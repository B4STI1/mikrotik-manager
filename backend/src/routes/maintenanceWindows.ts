import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { requireAuth, requireWrite, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

export interface MaintenanceWindow {
  id: number;
  name: string;
  device_ids: number[];
  start_at: string;
  end_at: string;
  recurring_cron: string | null;
  active: boolean;
  created_at: string;
}

// Returns true if deviceId is currently in an active maintenance window
export async function isDeviceInMaintenance(deviceId: number): Promise<boolean> {
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM maintenance_windows
     WHERE active = true
       AND $1 = ANY(device_ids)
       AND NOW() BETWEEN start_at AND end_at`,
    [deviceId]
  ).catch(() => [{ count: '0' }]);
  return parseInt(rows[0]?.count || '0', 10) > 0;
}

// GET /api/maintenance-windows
router.get('/', async (_req: Request, res: Response) => {
  const rows = await query<MaintenanceWindow>(
    `SELECT * FROM maintenance_windows ORDER BY start_at DESC`
  );
  res.json(rows);
});

// POST /api/maintenance-windows (admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { name, device_ids, start_at, end_at, recurring_cron } = req.body as {
    name: string; device_ids: number[]; start_at: string; end_at: string; recurring_cron?: string;
  };
  if (!name?.trim() || !start_at || !end_at) {
    res.status(400).json({ error: 'name, start_at, and end_at are required' });
    return;
  }
  const rows = await query<MaintenanceWindow>(
    `INSERT INTO maintenance_windows (name, device_ids, start_at, end_at, recurring_cron)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name.trim(), device_ids ?? [], start_at, end_at, recurring_cron || null]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/maintenance-windows/:id (admin)
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  const { name, device_ids, start_at, end_at, recurring_cron, active } = req.body as Partial<MaintenanceWindow>;
  const rows = await query<MaintenanceWindow>(
    `UPDATE maintenance_windows SET
       name           = COALESCE($1, name),
       device_ids     = COALESCE($2, device_ids),
       start_at       = COALESCE($3, start_at),
       end_at         = COALESCE($4, end_at),
       recurring_cron = COALESCE($5, recurring_cron),
       active         = COALESCE($6, active)
     WHERE id = $7 RETURNING *`,
    [name, device_ids, start_at, end_at, recurring_cron, active, req.params.id]
  );
  if (!rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(rows[0]);
});

// DELETE /api/maintenance-windows/:id (admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  await query(`DELETE FROM maintenance_windows WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

// GET /api/maintenance-windows/active — currently active windows (used by AlertService)
router.get('/active', requireWrite, async (_req: Request, res: Response) => {
  const rows = await query<MaintenanceWindow>(
    `SELECT * FROM maintenance_windows WHERE active = true AND NOW() BETWEEN start_at AND end_at`
  );
  res.json(rows);
});

export default router;
