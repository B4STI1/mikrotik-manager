import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowUpCircle, X } from 'lucide-react';
import { authApi, systemApi } from '../services/api';

interface SecurityStatus {
  warnings: string[];
}

export default function SecurityBanners() {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{ latest: string } | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  useEffect(() => {
    authApi.securityStatus()
      .then((r) => setStatus(r.data))
      .catch(() => {});

    systemApi.versionCheck()
      .then((r) => {
        if (r.data.update_available && r.data.latest) {
          setUpdateInfo({ latest: r.data.latest });
        }
      })
      .catch(() => {});
  }, []);

  const noWarnings = !status || status.warnings.length === 0;
  const noUpdate = !updateInfo || updateDismissed;
  if (noWarnings && noUpdate) return null;

  const hasSecretWarning = !!status && (
    status.warnings.includes('jwt_secret_default') ||
    status.warnings.includes('encryption_key_default')
  );
  const hasAdminWarning = !!status && status.warnings.includes('admin_password_default');

  const secretNames = [
    status?.warnings.includes('jwt_secret_default') && 'JWT_SECRET',
    status?.warnings.includes('encryption_key_default') && 'ENCRYPTION_KEY',
  ]
    .filter(Boolean)
    .join(' and ');

  return (
    <div>
      {updateInfo && !updateDismissed && (
        <div className="flex items-center justify-between gap-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2 text-sm text-blue-800 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 shrink-0" />
            <span>
              <span className="font-semibold">Update available:</span>{' '}
              v{updateInfo.latest} is on GitHub.{' '}
              <a
                href="https://github.com/2GT-Media-Group-LLC/mikrotik-manager"
                target="_blank"
                rel="noreferrer"
                className="underline hover:no-underline"
              >
                View release
              </a>{' '}
              and run <code className="font-mono text-xs">docker compose pull &amp;&amp; docker compose up -d</code> to update.
            </span>
          </div>
          <button
            onClick={() => setUpdateDismissed(true)}
            className="shrink-0 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {hasSecretWarning && (
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-sm text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <span className="font-semibold">Security warning:</span>{' '}
            {secretNames}{' '}
            {status.warnings.filter((w) =>
              ['jwt_secret_default', 'encryption_key_default'].includes(w)
            ).length > 1
              ? 'are'
              : 'is'}{' '}
            using default values. Set strong secrets in your{' '}
            <code className="font-mono text-xs">.env</code> file before
            exposing this to any network.
          </span>
        </div>
      )}
      {hasAdminWarning && (
        <div className="flex items-center justify-between gap-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-800 dark:text-red-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              <span className="font-semibold">Critical:</span> The{' '}
              <code className="font-mono text-xs">admin</code> account is
              using the default password. Change it immediately.
            </span>
          </div>
          <Link
            to="/settings"
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded font-medium"
          >
            Change password
          </Link>
        </div>
      )}
    </div>
  );
}
