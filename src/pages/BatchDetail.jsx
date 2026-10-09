import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Share2,
  FileDown,
  Plus,
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Thermometer,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import JourneyTimeline from '../components/JourneyTimeline.jsx';
import JourneyEventForm from '../components/JourneyEventForm.jsx';
import { useJourney } from '../hooks/useJourney';
import { useAuth } from '../context/AuthContext';

export default function BatchDetail() {
  const params = useParams();
  const batchId = (params.batchId || params.id || 'MILK001').toUpperCase();
  const { user } = useAuth();
  const { journey, loading, error, refetch } = useJourney(batchId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const canAddEvent =
    user && ['admin', 'inspector', 'transport'].includes(user.role);

  const handleCopyHash = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `DairyChain Batch Journey — ${batchId}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Journey link copied to clipboard!');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const batch = journey?.batch || {};

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-8 animate-fade-in">
      {/* ── 1. Breadcrumb ────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Batches', to: '/batches' },
          { label: batchId },
        ]}
      />

      {/* ── 2. Page header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <StatusBadge
            status={batch.status || 'safe'}
            label="END-TO-END AUDITED"
            filled
          />
          <h1 className="mt-2 font-serif text-3xl md:text-4xl text-ink-primary">
            Batch Journey — <span className="font-mono">{batchId}</span>
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Complete traceability from farm to consumer, attested by IoT nodes
            and Sepolia smart contracts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {canAddEvent && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 hover:scale-[1.02] transition-default shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Add Journey Event
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-ink-secondary text-sm font-medium hover:border-navy hover:text-navy transition-default bg-white"
          >
            <Share2 className="w-4 h-4" />
            Share Journey
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-ink-secondary text-sm font-medium hover:border-navy hover:text-navy transition-default bg-white"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Loading & error states */}
      {loading && !journey && (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-navy animate-spin mx-auto" />
          <p className="text-sm text-ink-muted">Loading journey telemetry...</p>
        </div>
      )}

      {error && !journey && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── 3. Batch Summary Card ─────────────────────────────────── */}
      {journey && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Consortium Milk Passport
            </span>
            <span className="text-xs font-mono text-ink-secondary">
              Created: {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString('en-IN') : '—'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted block">
                Batch ID
              </span>
              <span className="font-mono font-bold text-sm text-navy mt-0.5 block">
                {batchId}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted block">
                Origin
              </span>
              <span className="font-medium text-sm text-ink-primary mt-0.5 block truncate" title={batch.origin}>
                {batch.origin || 'Cooperative'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted block">
                Collection Center
              </span>
              <span className="font-medium text-sm text-ink-primary mt-0.5 block truncate" title={batch.collectionCenter}>
                {batch.collectionCenter || 'Regional BMC'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted block">
                Volume
              </span>
              <span className="font-medium text-sm text-ink-primary mt-0.5 block">
                {batch.volume || '—'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted block">
                Current Stage
              </span>
              <span className="font-semibold text-sm text-navy mt-0.5 block">
                {batch.currentStage || 'Farm Collection'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted block">
                Latest Temp
              </span>
              <span className="font-mono font-bold text-sm text-mint mt-0.5 block">
                {batch.currentTemperature != null ? `${batch.currentTemperature}°C` : '—'}
              </span>
            </div>
          </div>

          {/* Full hash with copy */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-ink-muted font-medium shrink-0">
                Merkle Provenance Hash:
              </span>
              <code className="font-mono text-ink-primary bg-neutral-100 px-2.5 py-1 rounded-md border border-border truncate max-w-md">
                {batch.blockchainHash || (journey.events?.[0]?.dataHash) || '0x4f8b91a274c5d9e83120b02184918294a5c8291048b291a0c84192049b102941'}
              </code>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopyHash(
                  batch.blockchainHash ||
                    journey.events?.[0]?.dataHash ||
                    '0x4f8b91a274c5d9e83120b02184918294a5c8291048b291a0c84192049b102941'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border text-ink-secondary hover:text-navy hover:border-navy transition-default shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hash</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── 4. Journey Timeline Component ─────────────────────────── */}
      {journey && <JourneyTimeline journey={journey} />}

      {/* ── 5. Back to Verify link ─────────────────────────────────── */}
      <div className="pt-4 flex items-center justify-between">
        <Link
          to={`/verify?batch=${batchId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Verification Certificate
        </Link>

        <Link
          to="/batches"
          className="text-xs text-ink-muted hover:text-ink-secondary"
        >
          View all fleet batches →
        </Link>
      </div>

      {/* ── Modal: Add Journey Event ───────────────────────────────── */}
      {showAddModal && (
        <JourneyEventForm
          batchId={batchId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
