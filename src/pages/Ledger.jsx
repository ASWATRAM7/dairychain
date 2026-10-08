import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import DataTable from "../components/DataTable.jsx";
import { ledgerEntries } from "../data/mockData.js";

const columns = [
  { key: "block", label: "Block #" },
  { key: "txHash", label: "Tx Hash" },
  { key: "batchId", label: "Batch ID" },
  { key: "eventType", label: "Event Type" },
  { key: "temperature", label: "Temperature" },
  { key: "timeAgo", label: "Timestamp" },
  { key: "validator", label: "Validator Node" },
  { key: "status", label: "Status" },
];

const tempTone = {
  safe: "safe",
  critical: "critical",
  info: "neutral",
};

export default function Ledger() {
  const [search, setSearch] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-6">
      <StatusBadge status="safe" label="TRN-GRID RPC ONLINE" filled />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <StatusBadge
            status="neutral"
            label="Consensus Proof of Authority"
            filled
          />
          <p className="mt-2 text-xs text-ink-muted">
            Epoch: 412 • Block Interval: 3.2s
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink-primary">
            Cold Chain Blockchain Ledger
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1 text-sm text-ink-secondary shrink-0">
          <span>⛓ Latest Block: #849,205</span>
          <span>⚡ Hash Rate: 142 TH/s</span>
          <span className="text-mint">✓ 0 Failed Cold-Chain Transactions</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Tx Hash, Batch ID, or Block..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm placeholder:text-ink-muted focus:border-navy transition-default"
          />
        </div>
        <select className="text-sm border border-border rounded-lg px-3 py-2 text-ink-secondary bg-white">
          <option>Filter by Event</option>
          <option>Temp Log Ping</option>
          <option>Chiller Handover</option>
        </select>
        <select className="text-sm border border-border rounded-lg px-3 py-2 text-ink-secondary bg-white">
          <option>Chilling Center</option>
          <option>Node-Salem-04</option>
          <option>Node-Erode-01</option>
        </select>
        <select className="text-sm border border-border rounded-lg px-3 py-2 text-ink-secondary bg-white">
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
        <button
          type="button"
          className="px-3 py-2 rounded-lg border border-border text-sm text-ink-secondary hover:border-navy hover:text-navy transition-default"
        >
          CSV
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-lg border border-border text-sm text-ink-secondary hover:border-navy hover:text-navy transition-default"
        >
          JSON
        </button>
      </div>

      {/* Ledger table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          rows={ledgerEntries}
          renderCell={(row, col) => {
            switch (col.key) {
              case "block":
                return (
                  <span className="font-mono text-sm text-ink-primary">
                    #{row.block}
                  </span>
                );
              case "txHash":
                return (
                  <span className="font-mono text-xs text-ink-secondary">
                    {row.txHash}
                  </span>
                );
              case "batchId":
                return (
                  <span className="font-mono text-sm text-navy">
                    {row.batchId}
                  </span>
                );
              case "eventType":
                return <span className="text-sm text-ink-secondary">{row.eventType}</span>;
              case "temperature":
                return (
                  <StatusBadge
                    status={tempTone[row.tempStatus] ?? "neutral"}
                    label={row.temperature}
                  />
                );
              case "timeAgo":
                return <span className="text-xs text-ink-muted">{row.timeAgo}</span>;
              case "validator":
                return <span className="text-sm text-ink-secondary">{row.validator}</span>;
              case "status":
                return row.status === "confirmed" ? (
                  <StatusBadge status="safe" label="Confirmed" filled />
                ) : (
                  <StatusBadge
                    status="warning"
                    label={`Pending${row.statusNote ? ` (${row.statusNote})` : ""}`}
                    filled
                  />
                );
              default:
                return null;
            }
          }}
          renderExpanded={(row) =>
            row.expanded ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
                    Immutable Merkle Root
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs text-ink-secondary break-all">
                      {row.expanded.merkleRoot}
                    </code>
                    <button
                      type="button"
                      aria-label="Copy hash"
                      className="shrink-0 text-ink-muted hover:text-navy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-ink-muted mt-2">
                    Gas Used: {row.expanded.gasUsed} | Nonce: {row.expanded.nonce}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
                    Hardware Signature Attestation
                  </p>
                  <p className="text-xs text-ink-secondary">
                    Thermal Sensor ID: {row.expanded.sensorId}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1">
                    GPS: {row.expanded.gps}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1">
                    Battery: {row.expanded.battery} • Compressor Status:{" "}
                    {row.expanded.compressor}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
                    Custody Multi-Sig Attestation
                  </p>
                  <div className="space-y-1">
                    {row.expanded.signatures.map((sig) => (
                      <p key={sig.name} className="text-xs text-mint">
                        ✓ {sig.name} ({sig.address}SIGNED)
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-muted">
                No extended attestation data recorded for this entry.
              </p>
            )
          }
        />
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-muted">
        <span>● RPC Latency: 24ms</span>
        <span>Showing 1 - 25 of 32,880 entries</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            className="p-1.5 rounded-lg border border-border hover:border-navy hover:text-navy transition-default"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-ink-secondary">Page 1 of 1,280</span>
          <button
            type="button"
            aria-label="Next page"
            className="p-1.5 rounded-lg border border-border hover:border-navy hover:text-navy transition-default"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
