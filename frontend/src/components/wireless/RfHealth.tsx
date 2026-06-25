import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Radio, Signal, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { wirelessApi } from '../../services/api';
import type {
  RfChannelRow, RfSignalRow, RfTxQualityRow, RfConnectivity,
} from '../../types';
import {
  BAND_CHANNELS, BAND_LABEL, RfBand, channelForFreq, bandForFreq, widthMhz,
  RSSI_ZONES, rssiColor, RETRY_BUCKETS, retryBucketIndex, retryColor,
} from '../../utils/wifiChannels';

const ALL_BANDS: RfBand[] = ['2.4', '5', '6'];

// ─── Channel Map ──────────────────────────────────────────────────────────────

interface CellInfo { count: number; labels: string[] }

function ChannelBandRow({ band, radios }: { band: RfBand; radios: RfChannelRow[] }) {
  const channels = BAND_CHANNELS[band];
  const cells: CellInfo[] = channels.map(() => ({ count: 0, labels: [] }));

  for (const r of radios) {
    const ch = channelForFreq(r.frequency);
    if (ch == null) continue;
    const idx = channels.indexOf(ch);
    if (idx < 0) continue;
    const span = Math.max(1, Math.round(widthMhz(r.channel_width) / 20));
    const start = Math.max(0, idx - Math.floor((span - 1) / 2));
    const end = Math.min(channels.length - 1, start + span - 1);
    for (let i = start; i <= end; i++) cells[i].count++;
    cells[idx].labels.push(
      `${r.device_name}${r.ssid ? ` · ${r.ssid}` : ''} — ch ${ch}, ${widthMhz(r.channel_width)} MHz, ${r.registered_clients} clients`
    );
  }

  const cellColor = (c: CellInfo) =>
    c.count === 0 ? 'bg-gray-200 dark:bg-slate-700'
      : c.count === 1 ? 'bg-green-500'
        : 'bg-amber-500'; // co-channel overlap

  return (
    <div>
      <div className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{BAND_LABEL[band]}</div>
      <div className="flex gap-px">
        {cells.map((c, i) => (
          <div key={channels[i]}
            title={c.labels.length ? c.labels.join('\n') : `Channel ${channels[i]} — unused`}
            className={clsx('h-2.5 flex-1 rounded-sm transition-colors', cellColor(c))} />
        ))}
      </div>
      <div className="flex mt-1">
        {channels.map(ch => (
          <div key={ch} className="flex-1 text-center text-[9px] leading-none text-gray-400 dark:text-slate-500">{ch}</div>
        ))}
      </div>
    </div>
  );
}

export function ChannelMap({ deviceId }: { deviceId?: number }) {
  const { data: radios = [] } = useQuery({
    queryKey: ['rf-channels', deviceId],
    queryFn: () => wirelessApi.getChannelUsage(deviceId).then(r => r.data),
    refetchInterval: 60_000,
  });

  const byBand = (b: RfBand) => radios.filter(r => bandForFreq(r.frequency) === b);
  // 2.4 + 5 always; 6 only when present (avoids an always-empty 59-cell row)
  const bands = ALL_BANDS.filter(b => b !== '6' || byBand('6').length > 0);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-4 h-4 text-blue-500" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Channel Usage</h2>
        <span className="ml-auto flex items-center gap-3 text-[11px] text-gray-400 dark:text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" />in use</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />overlap</span>
        </span>
      </div>
      {radios.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400 dark:text-slate-500">
          No active radios reporting a channel yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bands.map(b => <ChannelBandRow key={b} band={b} radios={byBand(b)} />)}
        </div>
      )}
    </div>
  );
}

// ─── RSSI Density ──────────────────────────────────────────────────────────────

const RSSI_MIN = -90;
const RSSI_MAX = -30;
const RSSI_TICKS = [-90, -80, -70, -60, -50, -40, -30];

export function RssiDensity({ deviceId }: { deviceId?: number }) {
  const { data: signals = [] } = useQuery({
    queryKey: ['rf-signals', deviceId],
    queryFn: () => wirelessApi.getClientSignals(deviceId).then(r => r.data),
    refetchInterval: 30_000,
  });

  const clamped = (dbm: number) => Math.max(RSSI_MIN, Math.min(RSSI_MAX, dbm));
  const pos = (dbm: number) => ((clamped(dbm) - RSSI_MIN) / (RSSI_MAX - RSSI_MIN)) * 100;

  // Bin clients into 2 dB bins so co-located clients form a sized bubble.
  const bins = new Map<number, RfSignalRow[]>();
  for (const s of signals) {
    const bin = Math.round(clamped(s.signal_strength) / 2) * 2;
    if (!bins.has(bin)) bins.set(bin, []);
    bins.get(bin)!.push(s);
  }

  const weak = signals.filter(s => s.signal_strength < -75).length;
  const weakRatio = signals.length ? weak / signals.length : 0;
  const needsImprovement = signals.length >= 3 && weakRatio > 0.3;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Signal className="w-4 h-4 text-emerald-500" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">AP Deployment Density</h2>
        <span className="ml-auto text-[11px] text-gray-400 dark:text-slate-500">
          {signals.length} client{signals.length !== 1 ? 's' : ''} by signal (dBm)
        </span>
      </div>

      {signals.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400 dark:text-slate-500">
          No connected wireless clients to plot.
        </div>
      ) : (
        <>
          {needsImprovement && (
            <div className="flex items-start gap-2 mb-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>AP deployment density may need improvement — {weak} of {signals.length} clients are connecting below −75 dBm, which suggests coverage gaps.</span>
            </div>
          )}

          {/* Density track */}
          <div className="relative h-16">
            {/* gradient zone background */}
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full overflow-hidden flex">
              {RSSI_ZONES.map(z => (
                <div key={z.label} style={{
                  width: `${((Math.min(z.max, RSSI_MAX) - Math.max(z.min, RSSI_MIN)) / (RSSI_MAX - RSSI_MIN)) * 100}%`,
                  backgroundColor: z.color, opacity: 0.25,
                }} />
              ))}
            </div>
            {/* client bubbles */}
            {Array.from(bins.entries()).map(([bin, rows]) => {
              const size = Math.min(34, 12 + (rows.length - 1) * 4);
              return (
                <div key={bin}
                  title={rows.map(r => `${r.custom_name || r.hostname || r.mac_address} (${r.signal_strength} dBm, ${r.device_name})`).join('\n')}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shadow ring-2 ring-white dark:ring-slate-800"
                  style={{ left: `${pos(bin)}%`, width: size, height: size, backgroundColor: rssiColor(bin) }}>
                  {rows.length > 1 ? rows.length : ''}
                </div>
              );
            })}
          </div>
          {/* axis */}
          <div className="relative h-4 mt-1">
            {RSSI_TICKS.map(t => (
              <span key={t} className="absolute -translate-x-1/2 text-[10px] text-gray-400 dark:text-slate-500"
                style={{ left: `${pos(t)}%` }}>{t}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TX Retries histogram ───────────────────────────────────────────────────────

export function TxRetries({ deviceId }: { deviceId?: number }) {
  const [band, setBand] = useState<RfBand>('5');
  const { data: radios = [] } = useQuery({
    queryKey: ['rf-tx-quality', deviceId],
    queryFn: () => wirelessApi.getTxQuality(deviceId, '6h').then(r => r.data),
    refetchInterval: 60_000,
  });

  const inBand = radios.filter((r: RfTxQualityRow) => r.band === band);
  const counts = RETRY_BUCKETS.map(() => 0);
  for (const r of inBand) counts[retryBucketIndex(r.tx_retry_pct)]++;
  // UniFi orders worst → best (35%+ … 0%)
  const ordered = RETRY_BUCKETS.map((b, i) => ({ ...b, count: counts[i] })).reverse();

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-violet-500" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">AP Radio TX Retries</h2>
        <div className="ml-auto flex gap-1">
          {ALL_BANDS.map(b => (
            <button key={b} onClick={() => setBand(b)}
              className={clsx('px-2 py-0.5 rounded-md text-xs font-medium transition-colors',
                band === b ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700')}>
              {BAND_LABEL[b]}
            </button>
          ))}
        </div>
      </div>

      {radios.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400 dark:text-slate-500">
          No TX-retry data. This is derived from per-client CCQ, which the legacy
          <span className="font-mono"> wireless</span> driver reports; Wi-Fi 6/7 (<span className="font-mono">wifi</span>) radios don&apos;t expose it.
        </div>
      ) : (
        <>
          <div className="flex gap-1">
            {ordered.map(b => (
              <div key={b.label} className="flex-1 text-center">
                <div className="h-9 rounded-md flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: b.count > 0 ? retryColor((b.min + Math.min(b.max, 40)) / 2) : 'var(--color-border, #e5e7eb)' }}>
                  <span className={clsx(b.count === 0 && 'text-gray-400 dark:text-slate-600')}>{b.count || ''}</span>
                </div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">{b.label}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-3">
            Radios bucketed by transmit-retry rate over the last 6h ({inBand.length} on {BAND_LABEL[band]}). Lower is better.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Connectivity Success funnel ────────────────────────────────────────────────

const STAGE_META: { key: keyof RfConnectivity['stages']; label: string }[] = [
  { key: 'association', label: 'Association' },
  { key: 'authentication', label: 'Authentication' },
  { key: 'dhcp', label: 'DHCP' },
];

export function ConnectivitySuccess({ deviceId }: { deviceId?: number }) {
  const [range, setRange] = useState('24h');
  const { data } = useQuery({
    queryKey: ['rf-connectivity', deviceId, range],
    queryFn: () => wirelessApi.getConnectivity(deviceId, range).then(r => r.data),
    refetchInterval: 60_000,
  });

  const stages = data?.stages;
  const totalEvents = stages
    ? STAGE_META.reduce((s, m) => s + stages[m.key].success + stages[m.key].failure, 0)
    : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">WiFi Connectivity Success</h2>
        <div className="ml-auto flex gap-1">
          {['1h', '24h', '7d'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={clsx('px-2 py-0.5 rounded-md text-xs font-medium transition-colors',
                range === r ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700')}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {!stages || totalEvents === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400 dark:text-slate-500">
          No connectivity events in this window. This funnel is derived from device
          logs — enable wireless &amp; DHCP logging on the APs to populate it.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {STAGE_META.map(({ key, label }) => {
              const s = stages[key];
              const pct = s.pct;
              const color = pct == null ? '#94a3b8' : pct >= 98 ? '#22c55e' : pct >= 90 ? '#84cc16' : pct >= 75 ? '#f59e0b' : '#ef4444';
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-slate-300">{label}</span>
                    <span className="text-gray-400 dark:text-slate-500">
                      {pct == null ? '—' : `${pct}%`}
                      <span className="ml-2 text-[10px]">({s.success} ok / {s.failure} fail)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct ?? 0}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-3">
            Approximate, derived from device logs. DNS success isn&apos;t observable on RouterOS and is omitted.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Combined section ─────────────────────────────────────────────────────────

export default function RfHealth({ deviceId }: { deviceId?: number }) {
  return (
    <div className="space-y-6">
      <ChannelMap deviceId={deviceId} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <RssiDensity deviceId={deviceId} />
        <TxRetries deviceId={deviceId} />
      </div>
      <ConnectivitySuccess deviceId={deviceId} />
    </div>
  );
}
