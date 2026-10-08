import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ThermometerSnowflake,
  FileCheck2,
  FileWarning,
  DollarSign,
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import BlockchainBadge from '../components/BlockchainBadge.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import DataTable from '../components/DataTable.jsx';

const VIOLATIONS_DATA = [
  {
    id: 'VIO-2026-042',
    batchId: 'BATCH-TN-090',
    origin: 'Madurai South Milk Producers Co.',
    carrier: 'TN-59-9921 (Madurai FastLog)',
    route: 'Madurai → Dindigul Depot',
    peakTemp: 5.4,
    excursionDuration: '42 mins',
    threshold: '4.0°C max',
    timestamp: 'Today, 14:15 IST',
    block: 18398,
    severity: 'critical',
    status: 'Escrow Frozen',
    slaPenalty: '₹15,000 Held',
    rootCause: 'Reefer compressor failure near Vadipatti bypass',
  },
  {
    id: 'VIO-2026-039',
    batchId: 'MILK003',
    origin: 'Madurai Central Dairy Federation',
    carrier: 'TN-58-1044 (Kaveri Fleet)',
    route: 'Madurai → Tiruchirappalli',
    peakTemp: 7.2,
    excursionDuration: '1 hr 15 mins',
    threshold: '4.0°C max',
    timestamp: 'Today, 11:20 IST',
    block: 849203,
    severity: 'critical',
    status: 'Batch Quarantined',
    slaPenalty: '₹20,000 Forfeited',
    rootCause: 'Driver unscheduled stop; thermal insulation seal breached',
  },
  {
    id: 'VIO-2026-031',
    batchId: 'BATCH-TN-086',
    origin: 'Cuddalore Coastal Dairy Federation',
    carrier: 'TN-31-8812 (Delta Trans)',
    route: 'Cuddalore → Villupuram BMC',
    peakTemp: 4.8,
    excursionDuration: '18 mins',
    threshold: '4.0°C max',
    timestamp: 'Yesterday, 19:40 IST',
    block: 18394,
    severity: 'warning',
    status: 'Under Investigation',
    slaPenalty: 'Pending Inspector Review',
    rootCause: 'Loading bay delay under ambient summer heat (38°C ambient)',
  },
];

const columns = [
  { key: 'id', label: 'Incident ID' },
  { key: 'batchId', label: 'Batch ID' },
  { key: 'route', label: 'Route & Carrier' },
  { key: 'peakTemp', label: 'Recorded Peak' },
  { key: 'duration', label: 'Duration' },
  { key: 'penalty', label: 'Smart Contract SLA' },
  { key: 'status', label: 'Enforcement Status' },
  { key: 'action', label: 'Action', align: 'right' },
];

export default function Violations() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = VIOLATIONS_DATA.filter((v) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'critical' && v.severity === 'critical') ||
      (filter === 'warning' && v.severity === 'warning') ||
      (filter === 'frozen' && v.status.includes('Frozen'));

    const matchesSearch =
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.carrier.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Violations' },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/10 border border-danger/20 text-danger text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" /> FSSAI Compliance Enforcement
            </span>
            <span className="text-sm text-ink-muted font-mono">
              Smart Contract SLA Engine Active
            </span>
          </div>
        }
        title="Cold-Chain Integrity & Breach Audit Log"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-navy text-navy text-sm font-medium hover:bg-navy hover:text-white transition-default"
            >
              <Download className="w-4 h-4" />
              Download FSSAI Dossier
            </button>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 hover:scale-[1.02] transition-default"
            >
              <FileCheck2 className="w-4 h-4" />
              Inspector Verification
            </Link>
          </div>
        }
      />

      {/* FSSAI Standard Policy Notice Banner */}
      <div className="rounded-xl border border-amber/30 bg-amber/5 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber/15 text-amber shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink-primary">
              FSSAI Standard Reg. 2.1.1 — Strict 2.0°C to 4.0°C Thermal Envelope
            </h4>
            <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
              Raw milk shipments exceeding +4.5°C for more than 15 minutes are automatically flagged on-chain.
              Smart contract escrow is immediately frozen and penalties are levied against transporter deposits.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-amber shrink-0 bg-white px-3 py-1.5 rounded-lg border border-amber/30 shadow-xs">
          Auto-SLA: ₹500 / 0.1°C Excursion
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Violations"
          value={VIOLATIONS_DATA.length.toString()}
          note="2 Critical, 1 Warning"
          noteTone="negative"
          icon={ShieldAlert}
        />
        <StatCard
          label="Peak Excursion"
          value="+7.2°C"
          note="Batch MILK003 (+3.2°C above ceiling)"
          noteTone="negative"
          icon={ThermometerSnowflake}
        />
        <StatCard
          label="Total Escrow Frozen"
          value="₹35,000"
          note="Held in Polygon Smart Contract"
          noteTone="neutral"
          icon={DollarSign}
        />
        <StatCard
          label="Quarantine Actions"
          value="1 Tanker"
          note="Quarantine hold active"
          noteTone="negative"
          icon={FileWarning}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by incident ID, batch, cooperative, or carrier tanker..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-white placeholder-ink-muted focus:outline-none focus:border-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'critical', 'warning', 'frozen'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-default ${
                filter === tab
                  ? 'bg-navy text-white shadow-xs'
                  : 'bg-page border border-border text-ink-secondary hover:bg-white'
              }`}
            >
              {tab === 'all' ? 'All Incidents' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink-primary">
            Logged Cold-Chain Breaches ({filtered.length})
          </h3>
          <span className="text-xs text-ink-muted">
            All violations immutable on Polygon PoS
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          renderCell={(row, col) => {
            switch (col.key) {
              case 'id':
                return (
                  <span className="font-mono text-xs font-bold text-ink-primary">
                    {row.id}
                  </span>
                );
              case 'batchId':
                return (
                  <div>
                    <Link
                      to={`/batch/${row.batchId}`}
                      className="font-mono text-sm font-semibold text-navy hover:underline block"
                    >
                      {row.batchId}
                    </Link>
                    <span className="text-[11px] text-ink-muted">{row.origin}</span>
                  </div>
                );
              case 'route':
                return (
                  <div>
                    <span className="text-xs font-medium text-ink-primary block">
                      {row.route}
                    </span>
                    <span className="text-[11px] text-ink-muted font-mono">
                      🚛 {row.carrier}
                    </span>
                  </div>
                );
              case 'peakTemp':
                return (
                  <div>
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-danger text-sm">
                      +{row.peakTemp.toFixed(1)}°C
                    </span>
                    <span className="text-[10px] text-ink-muted block">
                      Limit: {row.threshold}
                    </span>
                  </div>
                );
              case 'duration':
                return (
                  <span className="text-xs font-medium text-ink-secondary">
                    ⏱️ {row.excursionDuration}
                  </span>
                );
              case 'penalty':
                return (
                  <span className="font-mono text-xs font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded border border-amber/20">
                    {row.slaPenalty}
                  </span>
                );
              case 'status':
                return (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      row.severity === 'critical'
                        ? 'bg-danger/10 border-danger/20 text-danger'
                        : 'bg-amber/10 border-amber/20 text-amber'
                    }`}
                  >
                    ● {row.status}
                  </span>
                );
              case 'action':
                return (
                  <Link
                    to={`/batch/${row.batchId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-ink-secondary hover:border-navy hover:text-navy transition-default"
                  >
                    Investigate
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                );
              default:
                return null;
            }
          }}
        />
      </div>

      {/* Highlighted Critical Incident Detail Card */}
      <div className="bg-gradient-to-br from-card to-danger/5 border border-danger/20 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-danger/10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/15 text-danger font-bold text-xs mb-2">
              🚨 Highest Thermal Breach in 24 Hours
            </span>
            <h3 className="font-serif text-2xl text-ink-primary">
              Incident Case VIO-2026-039 — Batch MILK003
            </h3>
            <p className="text-xs text-ink-muted font-mono mt-1">
              Polygon PoS Block #849,203 • Transponder CBPD-001 • Merkle Root: 0x9a34...23a4
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/batch/MILK003"
              className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition-default inline-flex items-center gap-1.5"
            >
              View Full Telemetry Curve
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-5">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-ink-muted">
              Thermal Excursion Peak
            </span>
            <p className="text-3xl font-mono font-bold text-danger">+7.2°C</p>
            <p className="text-xs text-ink-secondary">
              Exceeded permissible threshold by +3.2°C for 75 consecutive minutes.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-ink-muted">
              Investigator Root Cause
            </span>
            <p className="text-sm font-semibold text-ink-primary">
              Unscheduled halt & reefer compressor stoppage
            </p>
            <p className="text-xs text-ink-secondary">
              GPS telemetry recorded tanker stationary for 1h 15m outside standard corridor without auxiliary power unit engaged.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-ink-muted">
              Blockchain Automated Action
            </span>
            <p className="text-sm font-semibold text-danger">
              Smart Contract Escrow Deducted
            </p>
            <p className="text-xs text-ink-secondary">
              Transporter deposit of ₹20,000 forfeited to Cooperative Indemnity Pool. Batch quarantined at intake gate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
