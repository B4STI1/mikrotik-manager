import { Router, Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { requireAuth, requireWrite } from '../middleware/auth';
import { PollerService } from '../services/PollerService';

const router = Router();
router.use(requireAuth);

let pollerService: PollerService | null = null;
export function setPollerService(p: PollerService): void {
  pollerService = p;
}

interface LinkRow {
  id: number;
  from_device_id: number | null;
  from_interface: string | null;
  to_interface: string | null;
  to_device_id: number | null;
  neighbor_address: string | null;
  neighbor_identity: string | null;
  neighbor_platform: string | null;
  neighbor_mac: string | null;
  stp_role: string | null;
  stp_state: string | null;
  bridge_name: string | null;
  neighbor_caps: string | null;
  link_type: string | null;
  discovered_by: string | null;
  from_device_name: string | null;
  to_device_name: string | null;
}

// GET /api/topology
router.get('/', async (_req: Request, res: Response) => {
  const PROTO_RANK: Record<string, number> = { lldp: 0, cdp: 1, mndp: 2 };
  const protoRank = (p: string | null) => PROTO_RANK[p ?? ''] ?? 3;

  const [devices, allLinks, manualLinks] = await Promise.all([
    query(
      `SELECT id, name, ip_address, model, device_type, status, ros_version, ip_addresses_jsonb
       FROM devices ORDER BY name ASC`
    ),
    query<LinkRow>(
      `SELECT tl.*,
              fd.name AS from_device_name,
              td.name AS to_device_name
       FROM topology_links tl
       LEFT JOIN devices fd ON fd.id = tl.from_device_id
       LEFT JOIN devices td ON td.id = tl.to_device_id
       ORDER BY tl.discovered_at DESC`
    ),
    query<{ id: number; from_device_id: number; to_device_id: number; label: string | null;
             from_name: string; to_name: string }>(
      `SELECT ml.*, fd.name AS from_name, td.name AS to_name
       FROM manual_topology_links ml
       JOIN devices fd ON fd.id = ml.from_device_id
       JOIN devices td ON td.id = ml.to_device_id`
    ),
  ]);

  // ── Step 1: Per-(device, neighbor) best-protocol dedup ─────────────────────
  const bestByPair = new Map<string, LinkRow>();
  for (const link of allLinks as LinkRow[]) {
    if (!link.from_device_id) continue;
    const neighborKey = link.to_device_id
      ? `d:${link.to_device_id}`
      : (link.neighbor_mac
          ? `m:${link.neighbor_mac.toLowerCase()}`
          : (link.neighbor_address || link.neighbor_identity || ''));
    if (!neighborKey) continue;
    const key = `${link.from_device_id}::${neighborKey}`;
    const existing = bestByPair.get(key);
    if (!existing || protoRank(link.link_type) < protoRank(existing.link_type)) {
      bestByPair.set(key, link);
    }
  }
  let links = Array.from(bestByPair.values());

  // ── Step 2: Resolve neighbor IP → managed device via all known addresses ───
  const stripCidr = (a: string) => { const i = a.indexOf('/'); return i === -1 ? a : a.slice(0, i); };
  const normIp = (a: string) => stripCidr(a.trim()).toLowerCase();

  const ipToDevice = new Map<string, { id: number; name: string }>();
  for (const d of devices as { id: number; name: string; ip_address: string; ip_addresses_jsonb?: unknown }[]) {
    if (d.ip_address) {
      const k = normIp(d.ip_address);
      if (k && !ipToDevice.has(k)) ipToDevice.set(k, { id: d.id, name: d.name });
    }
    if (Array.isArray(d.ip_addresses_jsonb)) {
      for (const entry of d.ip_addresses_jsonb) {
        const raw = typeof entry === 'object' && entry && 'address' in entry
          ? String((entry as { address?: string }).address || '') : '';
        const k = normIp(raw);
        if (k && !ipToDevice.has(k)) ipToDevice.set(k, { id: d.id, name: d.name });
      }
    }
  }

  for (const link of links) {
    if (link.to_device_id) continue;
    const na = link.neighbor_address?.trim();
    if (!na || na.includes('%')) continue;
    const hit = ipToDevice.get(normIp(na));
    if (hit && hit.id !== link.from_device_id) {
      link.to_device_id = hit.id;
      link.to_device_name = hit.name;
    }
  }

  // ── Step 3: Build "LLDP-covered" neighbor set ───────────────────────────────
  // Any neighbor identifier (device_id / MAC / IP) that appears as the target of
  // an LLDP link. We use this to suppress CDP/MNDP links to the same neighbor —
  // LLDP already gives us a precise point-to-point path, no need for the noisy L2 data.
  const lldpCoveredDeviceIds = new Set<number>();
  const lldpCoveredMacs      = new Set<string>();
  const lldpCoveredAddresses = new Set<string>();

  for (const link of links) {
    if (link.link_type !== 'lldp') continue;
    if (link.to_device_id)    lldpCoveredDeviceIds.add(link.to_device_id);
    if (link.neighbor_mac)    lldpCoveredMacs.add(link.neighbor_mac.toLowerCase());
    if (link.neighbor_address) lldpCoveredAddresses.add(normIp(link.neighbor_address));
  }

  const isLldpCovered = (link: LinkRow): boolean => {
    if (link.to_device_id && lldpCoveredDeviceIds.has(link.to_device_id)) return true;
    if (link.neighbor_mac && lldpCoveredMacs.has(link.neighbor_mac.toLowerCase())) return true;
    if (link.neighbor_address && lldpCoveredAddresses.has(normIp(link.neighbor_address))) return true;
    return false;
  };

  // Drop non-LLDP links whose neighbor is already reachable via LLDP elsewhere
  links = links.filter((l) => l.link_type === 'lldp' || !isLldpCovered(l));

  // ── Step 4: Merge bidirectional LLDP pairs ─────────────────────────────────
  // For LLDP links A→B and B→A between two managed devices, keep one canonical
  // record (lower from_device_id is "from"). Enrich to_interface from the
  // reverse record if the forward record is missing it.
  const canonicalLldp: LinkRow[] = [];
  const mergedPairs = new Set<string>();

  for (const link of links) {
    if (link.link_type !== 'lldp' || !link.to_device_id) {
      canonicalLldp.push(link);
      continue;
    }
    const lo = Math.min(link.from_device_id!, link.to_device_id);
    const hi = Math.max(link.from_device_id!, link.to_device_id);
    const pairKey = `${lo}:${hi}`;

    if (mergedPairs.has(pairKey)) continue;
    mergedPairs.add(pairKey);

    // Prefer the direction where from_device_id is the lower id for stability
    const forward = link.from_device_id === lo ? link : links.find(
      r => r.link_type === 'lldp' && r.from_device_id === lo && r.to_device_id === hi
    );
    const reverse = links.find(
      r => r.link_type === 'lldp' && r.from_device_id === hi && r.to_device_id === lo
    );

    const canonical = forward ?? link;

    // If to_interface is missing on the canonical record but the reverse has from_interface, fill it in
    if (!canonical.to_interface && reverse?.from_interface) {
      canonical.to_interface = reverse.from_interface;
    }
    // If from_interface is missing but reverse has to_interface, fill it in
    if (!canonical.from_interface && reverse?.to_interface) {
      canonical.from_interface = reverse.to_interface;
    }

    canonicalLldp.push(canonical);
  }

  links = canonicalLldp;

  // ── Step 5: Build external node map ────────────────────────────────────────
  const externalMap = new Map<string, {
    id: string; name: string; address: string; platform: string; mac: string; caps: string;
  }>();
  for (const link of links) {
    if (link.to_device_id) continue;
    const key = link.neighbor_mac || link.neighbor_address || link.neighbor_identity || '';
    if (!key) continue;
    if (!externalMap.has(key)) {
      const safeId = key.replace(/[.: ]/g, '');
      externalMap.set(key, {
        id: `ext-${safeId}`,
        name: link.neighbor_identity || link.neighbor_address || 'Unknown',
        address: link.neighbor_address || '',
        platform: link.neighbor_platform || '',
        mac: link.neighbor_mac || '',
        caps: link.neighbor_caps || '',
      });
    }
  }

  // ── Step 6: Shared-segment detection (only for truly unresolved non-LLDP links) ──
  // After LLDP suppression above, the remaining non-LLDP links are genuinely
  // on segments where we couldn't find LLDP. Only group them into shared segments
  // when a single port sees ≥2 distinct unresolved neighbors.

  const lldpLinks    = links.filter((l) => l.link_type === 'lldp');
  const nonLldpLinks = links.filter((l) => l.link_type !== 'lldp' && !!l.from_device_id);

  const portGroupMap = new Map<string, LinkRow[]>();
  for (const link of nonLldpLinks) {
    const pk = `${link.from_device_id}::${link.from_interface ?? ''}`;
    if (!portGroupMap.has(pk)) portGroupMap.set(pk, []);
    portGroupMap.get(pk)!.push(link);
  }

  const sharedPortKeys = [...portGroupMap.keys()].filter((pk) => portGroupMap.get(pk)!.length >= 2);
  const soloNonLldp   = [...portGroupMap.values()].filter((g) => g.length < 2).flat();

  const nKey = (l: LinkRow) =>
    l.to_device_id   ? `d:${l.to_device_id}` :
    l.neighbor_mac   ? `m:${l.neighbor_mac.toLowerCase()}` :
    l.neighbor_address ? `a:${l.neighbor_address}` :
                        `i:${l.neighbor_identity ?? ''}`;

  // Union-find to merge port groups sharing a common neighbor
  const ufParent = new Map<string, string>(sharedPortKeys.map((k) => [k, k]));
  const ufFind = (k: string): string => {
    if (ufParent.get(k) !== k) ufParent.set(k, ufFind(ufParent.get(k)!));
    return ufParent.get(k)!;
  };
  const ufUnion = (a: string, b: string) => ufParent.set(ufFind(a), ufFind(b));

  const pkNeighborSets = new Map<string, Set<string>>();
  for (const pk of sharedPortKeys) {
    pkNeighborSets.set(pk, new Set(portGroupMap.get(pk)!.map(nKey)));
  }
  for (let i = 0; i < sharedPortKeys.length; i++) {
    for (let j = i + 1; j < sharedPortKeys.length; j++) {
      const setA = pkNeighborSets.get(sharedPortKeys[i])!;
      for (const n of pkNeighborSets.get(sharedPortKeys[j])!) {
        if (setA.has(n)) { ufUnion(sharedPortKeys[i], sharedPortKeys[j]); break; }
      }
    }
  }

  const segGroups = new Map<string, string[]>();
  for (const pk of sharedPortKeys) {
    const root = ufFind(pk);
    if (!segGroups.has(root)) segGroups.set(root, []);
    segGroups.get(root)!.push(pk);
  }

  interface SegConn { src: string; dst: string; port: string; }
  const segNodes: { id: string; name: string; address: string; platform: string; mac: string; caps: string }[] = [];
  const segConns: SegConn[] = [];

  for (const [root, pks] of segGroups) {
    const segId = `seg-${root.replace(/[^a-z0-9]/gi, '')}`;
    const srcDevPorts = new Map<string, string>();
    const allDevIds   = new Set<string>();
    const extNKeys    = new Set<string>();

    for (const pk of pks) {
      const colonIdx = pk.indexOf('::');
      const devId = pk.slice(0, colonIdx);
      const port  = pk.slice(colonIdx + 2);
      srcDevPorts.set(devId, port);
      allDevIds.add(devId);
      for (const link of portGroupMap.get(pk)!) {
        if (link.to_device_id) allDevIds.add(String(link.to_device_id));
        else extNKeys.add(nKey(link));
      }
    }

    segNodes.push({
      id: segId,
      name: 'Shared Segment',
      address: '',
      platform: `${allDevIds.size} devices`,
      mac: '',
      caps: 'segment',
    });

    for (const [devId, port] of srcDevPorts) {
      segConns.push({ src: devId, dst: segId, port });
    }
    for (const nk of extNKeys) {
      const ext = Array.from(externalMap.values()).find((e) =>
        `m:${(e.mac || '').toLowerCase()}` === nk ||
        `a:${e.address}` === nk ||
        `i:${e.name}` === nk
      );
      if (ext) segConns.push({ src: ext.id, dst: segId, port: '' });
    }
  }

  const activeLinks = [...lldpLinks, ...soloNonLldp];
  const externalNodes = Array.from(externalMap.values());
  const allExtNodes   = [...externalNodes, ...segNodes];

  // ── Step 7: Include manual links as synthetic topology link rows ────────────
  const manualAsLinks: LinkRow[] = (manualLinks as { id: number; from_device_id: number; to_device_id: number; label: string | null; from_name: string; to_name: string }[]).map((ml) => ({
    id: -ml.id, // negative id to avoid collision
    from_device_id: ml.from_device_id,
    from_interface: ml.label ?? null,
    to_interface: null,
    to_device_id: ml.to_device_id,
    neighbor_address: null,
    neighbor_identity: null,
    neighbor_platform: null,
    neighbor_mac: null,
    stp_role: null,
    stp_state: null,
    bridge_name: null,
    neighbor_caps: null,
    link_type: 'manual',
    discovered_by: null,
    from_device_name: ml.from_name,
    to_device_name: ml.to_name,
  }));

  res.json({
    devices,
    links: [...activeLinks, ...manualAsLinks],
    externalNodes: allExtNodes,
    segConns,
    manualLinkIds: (manualLinks as { id: number; from_device_id: number; to_device_id: number }[]).map((ml) => ({
      id: ml.id,
      from_device_id: ml.from_device_id,
      to_device_id: ml.to_device_id,
    })),
  });
});

// POST /api/topology/discover
router.post('/discover', requireWrite, async (_req: Request, res: Response) => {
  const devices = await query<{ id: number }>(`SELECT id FROM devices WHERE status='online'`);
  if (pollerService) {
    for (const d of devices) {
      await pollerService.scheduleDeviceSync(d.id, 'slow');
    }
  }
  res.json({ message: `Discovery triggered for ${devices.length} device(s)` });
});

// POST /api/topology/manual-links — create a user-drawn connection
router.post('/manual-links', requireWrite, async (req: Request, res: Response) => {
  const { from_device_id, to_device_id, label } = req.body as {
    from_device_id?: number; to_device_id?: number; label?: string;
  };
  if (!from_device_id || !to_device_id) {
    res.status(400).json({ error: 'from_device_id and to_device_id are required' });
    return;
  }
  if (from_device_id === to_device_id) {
    res.status(400).json({ error: 'Cannot connect a device to itself' });
    return;
  }

  // Ensure both devices exist
  const [devA, devB] = await Promise.all([
    queryOne<{ id: number }>(`SELECT id FROM devices WHERE id = $1`, [from_device_id]),
    queryOne<{ id: number }>(`SELECT id FROM devices WHERE id = $1`, [to_device_id]),
  ]);
  if (!devA || !devB) { res.status(404).json({ error: 'Device not found' }); return; }

  const rows = await query<{ id: number; from_device_id: number; to_device_id: number; label: string | null }>(
    `INSERT INTO manual_topology_links (from_device_id, to_device_id, label)
     VALUES ($1, $2, $3)
     ON CONFLICT (from_device_id, to_device_id) DO UPDATE SET label = EXCLUDED.label
     RETURNING *`,
    [from_device_id, to_device_id, label ?? null]
  );
  res.status(201).json(rows[0]);
});

// DELETE /api/topology/manual-links/:id
router.delete('/manual-links/:id', requireWrite, async (req: Request, res: Response) => {
  await query(`DELETE FROM manual_topology_links WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

export default router;
