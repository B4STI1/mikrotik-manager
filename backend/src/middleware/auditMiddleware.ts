import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { verifyToken } from './auth';

function extractEntity(path: string): { entityType: string | null; entityId: number | null } {
  // e.g. /api/devices/42/interfaces → 'device', 42
  const segments = path.replace(/^\/api\//, '').split('/');
  const resourceMap: Record<string, string> = {
    devices: 'device',
    backups: 'backup',
    clients: 'client',
    events: 'event',
    settings: 'settings',
    alerts: 'alert',
    topology: 'topology',
    wireless: 'wireless',
    'network-services': 'network_services',
    'credential-presets': 'credential_preset',
    'audit-log': 'audit_log',
    users: 'user',
  };
  const entityType = resourceMap[segments[0]] ?? segments[0] ?? null;
  const idRaw = segments[1];
  const entityId = idRaw && /^\d+$/.test(idRaw) ? parseInt(idRaw, 10) : null;
  return { entityType, entityId };
}

function extractUser(req: Request): { userId: number | null; username: string | null } {
  if (req.user) return { userId: req.user.userId, username: req.user.username };
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7));
      return { userId: payload.userId, username: payload.username };
    } catch { /* expired/invalid — record as anonymous */ }
  }
  return { userId: null, username: null };
}

export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }

  res.on('finish', () => {
    const { entityType, entityId } = extractEntity(req.path);
    const { userId, username } = extractUser(req);
    const summary = `${req.method} ${req.path}`;
    const ip = (req.ip ?? '').replace(/^::ffff:/, '');

    query(
      `INSERT INTO audit_log (user_id, username, method, path, entity_type, entity_id, summary, ip_address, status_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [userId, username, req.method, req.path, entityType, entityId, summary, ip, res.statusCode]
    ).catch(() => {});
  });

  next();
}
