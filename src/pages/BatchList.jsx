import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Milk,
  Search,
  Filter,
  ArrowRight,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import BlockchainBadge from '../components/BlockchainBadge.jsx';
import DataTable from '../components/DataTable.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { recentBatches } from '../data/mockData.js';

// Extended mock batch list for a comprehensive registry
const ALL_BATCHES = [
  ...recentBatches,
  {
    id: 'BATCH-TN-088',
    origin: 'Dharmapuri Dairy Farmers Union',
    volumeLiters: 19450,
    avgTemp: 3.5,
    status: 'safe',
    route: 'Dharmapuri → Krishnagiri Hub',
    block: 18396,
    action: 'inspect',
  },
  {
    id: 'BATCH-TN-087',
    origin: 'Thanjavur Delta Milk Cooperative',
    volumeLiters: 11200,
    avgTemp: 3.9,
    status: 'safe',
    route: 'Thanjavur → Trichy Central',
    block: 18395,
    action: 'inspect',
  },
  {
    id: 'BATCH-TN-086',
    origin: 'Cuddalore Coastal Dairy Federation',
    volumeLiters: 7850,
    avgTemp: 4.8,
    status: 'alert',
    statusNote: 'Temp Variance',
    route: 'Cuddalore → Villupuram BMC',
    block: 18394,
    action: 'audit',
  },
  {
    id: 'BATCH-TN-085',
    origin: 'Vellore Milk Producers Co.',
    volumeLiters: 14600,
    avgTemp: 3.6,
    status: 'safe',
    route: 'Vellore → Chennai Processing',
    block: 18393,
    action: 'inspect',
  },
];

const columns = [
  { key: 'id', label: 'Batch ID' },
  { key: 'origin', label: 'Origin Cooperative' },
  { key: 'volume', label: 'Milk Volume', align: 'right' },
  { key: 'avgTemp', label: 'Avg Temp' },
  { key: 'route', label: 'Route' },
  { key: 'block', label: 'Blockchain Block' },
  { key: 'action', label: 'Action', align: 'right' },
];

export default function BatchList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coopFilter, setCoopFilter] = useState('all');

  // Available cooperatives for filter
  const cooperatives = useMemo(() => {
    const list = Array.from(new Set(ALL_BATCHES.map((b) => b.origin)));
    return ['all', ...list];
  }, []);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return ALL_BATCHES.filter((batch) => {
      const matchesSearch =
        batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.route.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || batch.status === statusFilter;

      const matchesCoop =
        coopFilter === 'all' || batch.origin === coopFilter;

      return matchesSearch && matchesStatus && matchesCoop;
    });
  }, [searchTerm, statusFilter, coopFilter]);

  // Aggregate metrics
  const totalVolume = useMemo(
    () => ALL_BATCHES.reduce((acc, b) => acc + b.volumeLiters, 0),
    []
  );
  const compliantCount = useMemo(
    () => ALL_BATCHES.filter((b) => b.status === 'safe').length,
    []
  );
  const complianceRate = ((compliantCount / ALL_BATCHES.length) * 100).toFixed(1);
  const avgFleetTemp = (
    ALL_BATCHES.reduce((acc, b) => acc + b.avgTemp, 0) / ALL_BATCHES.length
  ).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Batches' },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status="safe" label="Registry Synchronized" filled />
            <span className="text-sm text-ink-muted font-mono">
              Consensus Block #18,492
            </span>
          </div>
        }
        title="Tamil Nadu Milk Fleet & Batch Registry"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-navy text-navy text-sm font-medium hover:bg-navy hover:text-white transition-default"
            >
              <Download className="w-4 h-4" />
              Export CSV Ledger
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 hover:scale-[1.02] transition-default"
            >
              <Plus className="w-4 h-4" />
              Register New Batch
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Batches"
          value={ALL_BATCHES.length.toString()}
          note={`${compliantCount} fully compliant`}
          noteTone="positive"
          icon={Milk}
        />
        <StatCard
          label="Total Milk Volume"
          value={`${(totalVolume / 1000).toFixed(1)}k L`}
          note="Across 5 TN regions"
          noteTone="neutral"
          icon={Clock}
        />
        <StatCard
          label="Thermal Compliance"
          value={`${complianceRate}%`}
          note="FSSAI standard < 4.0°C"
          noteTone={Number(complianceRate) > 85 ? 'positive' : 'negative'}
          icon={CheckCircle2}
        />
        <StatCard
          label="Avg. Fleet Temp"
          value={`+${avgFleetTemp}°C`}
          note="Optimal chiller band"
          noteTone="positive"
          icon={AlertTriangle}
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Batch ID (e.g. BATCH-TN-093), Cooperative, or Route..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-white placeholder-ink-muted focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-ink-muted shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-2 text-ink-secondary bg-white focus:outline-none focus:border-navy"
              >
                <option value="all">All Statuses</option>
                <option value="safe">Safe / Compliant Only</option>
                <option value="alert">Alert / Excursions Only</option>
              </select>
            </div>

            <select
              value={coopFilter}
              onChange={(e) => setCoopFilter(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 text-ink-secondary bg-white focus:outline-none focus:border-navy max-w-[200px] truncate"
            >
              <option value="all">All Cooperatives</option>
              {cooperatives.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink-primary">
            Registered Milk Shipments ({filteredBatches.length})
          </h3>
          <span className="text-xs text-ink-muted">
            Showing all real-time on-chain verifiable batches
          </span>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="py-12 text-center text-ink-muted text-sm space-y-2">
            <p>No batches match the selected filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCoopFilter('all');
              }}
              className="text-xs text-navy font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredBatches}
            renderCell={(row, col) => {
              switch (col.key) {
                case 'id':
                  return (
                    <Link
                      to={`/batch/${row.id}`}
                      className="font-mono text-sm font-semibold text-navy hover:underline inline-flex items-center gap-1.5"
                    >
                      <Milk className="w-3.5 h-3.5 text-navy/70" />
                      {row.id}
                    </Link>
                  );
                case 'origin':
                  return (
                    <span className="text-ink-primary font-medium">
                      {row.origin}
                    </span>
                  );
                case 'volume':
                  return `${row.volumeLiters.toLocaleString()} L`;
                case 'avgTemp':
                  return (
                    <StatusBadge
                      status={row.status}
                      label={`+${row.avgTemp.toFixed(1)}°C${
                        row.statusNote ? ` (${row.statusNote})` : ''
                      }`}
                    />
                  );
                case 'route':
                  return (
                    <span className="text-xs text-ink-secondary font-medium">
                      {row.route}
                    </span>
                  );
                case 'block':
                  return <BlockchainBadge blockNumber={row.block} />;
                case 'action':
                  return row.status === 'alert' ? (
                    <Link
                      to="/violations"
                      className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/20 text-xs font-semibold hover:bg-danger hover:text-white transition-default inline-flex items-center gap-1"
                    >
                      Audit Excursion
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      to={`/batch/${row.id}`}
                      className="px-3 py-1.5 rounded-lg border border-border text-ink-secondary text-xs font-medium hover:border-navy hover:text-navy transition-default inline-flex items-center gap-1"
                    >
                      Inspect
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  );
                default:
                  return null;
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
