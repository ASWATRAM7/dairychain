import { useState } from 'react';
import {
  MapPin,
  Thermometer,
  User,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  Package,
  Truck,
  Warehouse,
  Factory,
  Store,
  Home,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Hash,
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

const STAGE_ICONS = {
  farm_collection: Package,
  chilling_center: Warehouse,
  transport: Truck,
  processing_plant: Factory,
  cold_storage: Warehouse,
  retail_delivery: Store,
  consumer: Home,
};

function fmt(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function JourneyTimeline({ journey }) {
  const [selectedStage, setSelectedStage] = useState(null);
  const [showScans, setShowScans] = useState(false);

  if (!journey) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-ink-muted text-sm">
        No journey data available for this batch.
      </div>
    );
  }

  const { batch, stats = {}, timeline = [], events = [], scans = [] } = journey;

  const completedStagesCount = timeline.filter((t) => t.completed).length;
  const currentStageIndex = timeline.map((t) => t.completed).lastIndexOf(true);

  // Filter events by selected stage if user clicked a node
  const displayedEvents = selectedStage
    ? events.filter((e) => e.stage === selectedStage)
    : events;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
      {/* ── 1. Header row ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Batch Traceability Journey
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink-primary mt-1 font-mono">
            {batch?.batchId || 'UNKNOWN'}
          </h2>
          {batch?.origin && (
            <p className="text-xs text-ink-secondary mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-navy" />
              <span>{batch.origin}</span>
              {batch.route && <span>• Route: {batch.route}</span>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            status={batch?.status || 'safe'}
            label={`STATUS: ${(batch?.status || 'safe').toUpperCase()}`}
            filled
          />
          {batch?.blockchainHash && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Anchored on Sepolia
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Stats strip (4 boxes) ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-neutral-50/70 border border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block">
            Stages Completed
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-ink-primary">
              {completedStagesCount}
            </span>
            <span className="text-xs text-ink-muted font-mono">
              / {timeline.length}
            </span>
          </div>
          <div className="w-full bg-border h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-navy h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completedStagesCount / (timeline.length || 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50/70 border border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block">
            Avg Temperature
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                stats.avgTemp != null && (stats.avgTemp < 2 || stats.avgTemp > 6)
                  ? 'text-danger'
                  : 'text-mint'
              }`}
            >
              {stats.avgTemp != null ? `${stats.avgTemp.toFixed(1)}°C` : '—'}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            Target Cold-Chain: 2°C – 6°C
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50/70 border border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block">
            Thermal Violations
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                stats.violations > 0 ? 'text-danger' : 'text-ink-primary'
              }`}
            >
              {stats.violations || 0}
            </span>
            <span className="text-xs text-ink-muted">breaches</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            {stats.violations === 0 ? '✓ Zero excursions' : 'Excursion detected'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50/70 border border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block">
            On-Chain Proofs
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-ink-primary">
              {stats.onChainCount || 0}
            </span>
            <span className="text-xs text-ink-muted">anchors</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            Immutable hashes verified
          </p>
        </div>
      </div>

      {/* ── 3. Horizontal journey ribbon ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wide">
            Consortium Stage Pipeline
          </h3>
          {selectedStage && (
            <button
              type="button"
              onClick={() => setSelectedStage(null)}
              className="text-xs text-navy hover:underline font-medium"
            >
              Clear filter (Show all {events.length} events)
            </button>
          )}
        </div>

        <div className="relative pt-4 pb-6 overflow-x-auto">
          {/* Connector line behind circles */}
          <div className="hidden md:block absolute top-[44px] left-[32px] right-[32px] h-[3px] bg-border z-0" />

          <div className="flex items-start justify-between min-w-[680px] gap-2 relative z-10">
            {timeline.map((stageItem, index) => {
              const Icon = STAGE_ICONS[stageItem.stage] || Circle;
              const isCompleted = stageItem.completed;
              const isCurrent = index === currentStageIndex;
              const isSelected = selectedStage === stageItem.stage;

              return (
                <button
                  key={stageItem.stage}
                  type="button"
                  onClick={() =>
                    setSelectedStage(isSelected ? null : stageItem.stage)
                  }
                  className="group flex flex-col items-center text-center focus:outline-none flex-1 transition-all"
                >
                  <div
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-mint text-white shadow-sm ring-4 ring-mint/20'
                        : 'bg-white border-2 border-border text-ink-muted'
                    } ${
                      isCurrent
                        ? 'ring-4 ring-navy/30 ring-offset-2'
                        : ''
                    } ${
                      isSelected
                        ? 'ring-4 ring-navy bg-navy text-white'
                        : 'hover:scale-105'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}

                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-navy opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-navy" />
                      </span>
                    )}
                  </div>

                  <span
                    className={`mt-3 text-[11px] font-semibold tracking-tight transition-colors ${
                      isSelected
                        ? 'text-navy font-bold'
                        : isCompleted
                        ? 'text-ink-primary'
                        : 'text-ink-muted'
                    }`}
                  >
                    {stageItem.label}
                  </span>

                  <span className="text-[10px] text-ink-muted mt-0.5">
                    {stageItem.lastAt
                      ? new Date(stageItem.lastAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Pending'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Timeline detail list (vertical) ───────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink-primary flex items-center gap-2">
            <span>Stage Checkpoints & Thermal Logs</span>
            <span className="text-xs text-ink-muted font-normal">
              ({displayedEvents.length} recorded)
            </span>
          </h3>
        </div>

        {displayedEvents.length === 0 ? (
          <div className="p-8 text-center text-ink-muted text-sm border border-dashed border-border rounded-xl">
            No events recorded yet for this stage.
          </div>
        ) : (
          <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-[11px] md:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
            {displayedEvents.map((ev, i) => {
              const statusTone =
                ev.status === 'critical'
                  ? 'bg-danger'
                  : ev.status === 'warning'
                  ? 'bg-amber'
                  : 'bg-mint';

              return (
                <div key={ev._id || i} className="relative group">
                  {/* Colored checkpoint dot */}
                  <div
                    className={`absolute -left-[27px] md:-left-[31px] top-1.5 w-6 h-6 rounded-full border-4 border-card ${statusTone} shadow-sm flex items-center justify-center`}
                  />

                  <div className="card-hover bg-card border border-border rounded-xl p-5 shadow-xs transition-default">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-semibold text-ink-primary">
                            {ev.stageLabel || ev.stage}
                          </h4>
                          <StatusBadge
                            status={ev.status || 'safe'}
                            label={(ev.status || 'safe').toUpperCase()}
                          />
                          {ev.onChain && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              On-Chain Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-secondary flex-wrap">
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-ink-muted" />
                              {ev.location}
                            </span>
                          )}
                          {ev.handler && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-ink-muted" />
                              {ev.handler}{' '}
                              {ev.handlerRole ? `(${ev.handlerRole})` : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-ink-muted">
                            <Clock className="w-3.5 h-3.5" />
                            {fmt(ev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Temperature callout */}
                      {typeof ev.temperature === 'number' && (
                        <div className="text-left md:text-right shrink-0 bg-neutral-50 px-3.5 py-2 rounded-lg border border-border">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                            Temperature
                          </span>
                          <span
                            className={`font-mono text-xl font-bold ${
                              ev.status === 'critical'
                                ? 'text-danger'
                                : 'text-mint'
                            }`}
                          >
                            {ev.temperature}°C
                          </span>
                          {ev.humidity != null && (
                            <span className="text-xs text-ink-muted block mt-0.5">
                              💧 {ev.humidity}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {ev.notes && (
                      <p className="mt-3 text-xs italic text-ink-secondary bg-neutral-50/50 p-2.5 rounded-lg border border-border/60">
                        "{ev.notes}"
                      </p>
                    )}

                    {/* Hashes and proofs */}
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                      {ev.dataHash ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
                          <Hash className="w-3.5 h-3.5 text-navy" />
                          <span className="text-navy font-semibold">
                            Hash: {ev.dataHash.slice(0, 16)}...{ev.dataHash.slice(-6)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-muted font-mono">
                          Local attestation
                        </span>
                      )}

                      {ev.txHash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${ev.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                        >
                          <span>View Sepolia Tx</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. Scan history section (collapsible) ───────────────── */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <button
          type="button"
          onClick={() => setShowScans((s) => !s)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-navy" />
            <h4 className="text-sm font-semibold text-ink-primary">
              Scan & Access Activity ({scans.length})
            </h4>
          </div>
          {showScans ? (
            <ChevronUp className="w-4 h-4 text-ink-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-muted" />
          )}
        </button>

        {showScans && (
          <div className="border-t border-border p-4 overflow-x-auto">
            {scans.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-4">
                No scans recorded yet for this batch.
              </p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 border-b border-border text-ink-muted uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scans.map((s, idx) => (
                    <tr key={s._id || idx} className="hover:bg-neutral-50/50">
                      <td className="p-2.5 font-mono text-ink-secondary">
                        {fmt(s.createdAt)}
                      </td>
                      <td className="p-2.5 capitalize">{s.scanType || 'QR'}</td>
                      <td className="p-2.5 capitalize">
                        {s.scannerRole || 'Public'}
                      </td>
                      <td className="p-2.5">
                        <StatusBadge
                          status={s.verified ? 'safe' : 'neutral'}
                          label={s.verified ? 'Verified' : 'Logged'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
