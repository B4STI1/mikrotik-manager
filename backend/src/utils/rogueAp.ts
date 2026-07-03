// Rogue / neighbor AP classification over stored AP-scan results.
//
// A scanned BSSID falls into one of three buckets:
//  - ours:     the BSSID belongs to a managed radio → ignored
//  - ROGUE:    broadcasts one of OUR SSIDs from a BSSID we don't own — an evil
//              twin / SSID spoof, the classic WiFi attack Mist/UniFi alert on
//  - neighbor: any other foreign AP — inventory, ranked by signal

export interface ScannedEntry {
  bssid: string; vendor?: string; signal: number; freq?: number;
  band?: string; channel_width?: string;
}
export interface ScannedNetwork {
  ssid: string; security?: string; hidden?: boolean; entries: ScannedEntry[];
}
export interface ScanRecord {
  deviceName: string;
  scannedAt: string;
  networks: ScannedNetwork[];
}

export interface RogueAp {
  ssid: string; bssid: string; vendor: string; signal: number; band: string;
  seenBy: string; scannedAt: string;
}
export interface NeighborAp {
  ssid: string; bssid: string; vendor: string; signal: number; band: string;
  security: string; seenBy: string; scannedAt: string;
}

export function classifyScans(
  scans: ScanRecord[],
  ownSsids: Set<string>,   // SSIDs our managed radios broadcast
  ownBssids: Set<string>,  // every MAC we own (radio + interface MACs, lowercase)
): { rogues: RogueAp[]; neighbors: NeighborAp[] } {
  const rogueByBssid = new Map<string, RogueAp>();
  const neighborByBssid = new Map<string, NeighborAp>();

  for (const scan of scans) {
    for (const net of scan.networks) {
      for (const e of net.entries) {
        const bssid = (e.bssid || '').toLowerCase();
        if (!bssid || ownBssids.has(bssid)) continue; // our own radios

        if (net.ssid && ownSsids.has(net.ssid)) {
          const prev = rogueByBssid.get(bssid);
          if (!prev || e.signal > prev.signal) {
            rogueByBssid.set(bssid, {
              ssid: net.ssid, bssid, vendor: e.vendor || '', signal: e.signal,
              band: e.band || '', seenBy: scan.deviceName, scannedAt: scan.scannedAt,
            });
          }
        } else {
          const prev = neighborByBssid.get(bssid);
          if (!prev || e.signal > prev.signal) {
            neighborByBssid.set(bssid, {
              ssid: net.ssid || '(hidden)', bssid, vendor: e.vendor || '', signal: e.signal,
              band: e.band || '', security: net.security || '',
              seenBy: scan.deviceName, scannedAt: scan.scannedAt,
            });
          }
        }
      }
    }
  }

  return {
    rogues: [...rogueByBssid.values()].sort((a, b) => b.signal - a.signal),
    neighbors: [...neighborByBssid.values()].sort((a, b) => b.signal - a.signal),
  };
}
