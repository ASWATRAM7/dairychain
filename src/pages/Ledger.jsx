import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Copy, Check, ExternalLink, ShieldCheck, Activity, Database, CheckCircle2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import DataTable from "../components/DataTable.jsx";
import { ledgerEntries } from "../data/mockData.js";
import { useBlockchain } from "../hooks/useBlockchain";

const columns = [
  { key: "block", label: "Block #" },
  { key: "txHash", label: "Tx Hash" },
  { key: "dataHash", label: "Hash" },
  { key: "onChain", label: "On-Chain" },
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
  const [copied, setCopied] = useState(false);
  const { ready, contractAddress, totalLogs, loading } = useBlockchain();
  const [lastRefreshed] = useState(new Date().toLocaleTimeString('en-IN'));

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Enrich mock entries with dataHash and onChain status if not present
  const enrichedEntries = ledgerEntries.map((entry, idx) => {
    const fallbackHash = entry.expanded?.merkleRoot || `0x${(idx + 1).toString().padStart(64, 'a')}`;
    return {
      ...entry,
      dataHash: entry.dataHash || fallbackHash,
      onChain: entry.onChain !== undefined ? entry.onChain : entry.status === "confirmed",
    };
  });

  const filteredEntries = enrichedEntries.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (row.txHash && row.txHash.toLowerCase().includes(q)) ||
      (row.batchId && row.batchId.toLowerCase().includes(q)) ||
      (row.block && row.block.toLowerCase().includes(q)) ||
      (row.dataHash && row.dataHash.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-6">
      {/* ── Status Banner ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {ready ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              ⛓️ Ethereum Sepolia • Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              ⛓️ Blockchain offline
            </span>
          )}

          {contractAddress ? (
            <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary bg-neutral-100 px-2.5 py-1 rounded-md border border-border">
              <span>Contract:</span>
              <span className="font-semibold text-navy">
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-ink-muted">Contract not deployed yet</span>
          )}

          <span className="text-xs text-ink-secondary font-medium">
            Total logs: <strong className="text-ink-primary font-mono">{totalLogs}</strong>
          </span>
        </div>

        {contractAddress && (
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-navy/80 hover:underline"
          >
            View on Etherscan
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <StatusBadge
            status={ready ? "safe" : "neutral"}
            label={ready ? "Sepolia Testnet Active" : "Consensus Proof of Authority"}
            filled
          />
          <p className="mt-2 text-xs text-ink-muted">
            Network: Ethereum Sepolia • Chain ID: 11155111
          </p>
          <h1 className="mt-1 font-serif text-3xl text-ink-primary">
            Cold Chain Blockchain Ledger
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1 text-sm text-ink-secondary shrink-0">
          <span>⛓ Latest Block: #{ready ? (849205 + totalLogs).toLocaleString() : '849,205'}</span>
          <span>⚡ Layer: Ethereum PoS Anchor</span>
          <span className="text-mint">✓ Immutable Cold-Chain Transactions</span>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
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

      {/* ── Ledger table ──────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          rows={filteredEntries}
          renderCell={(row, col) => {
            switch (col.key) {
              case "block":
                return (
                  <span className="font-mono text-sm text-ink-primary">
                    #{row.block}
                  </span>
                );
              case "txHash": {
                const cleanTx = row.txHash?.replace('8x', '0x');
                return (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${cleanTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Click to view on Etherscan"
                    className="font-mono text-xs text-navy hover:underline flex items-center gap-1 group"
                  >
                    <span>{row.txHash}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              }
              case "dataHash":
                return (
                  <span className="font-mono text-xs text-ink-muted" title={row.dataHash}>
                    {row.dataHash ? `${row.dataHash.slice(0, 10)}...` : '—'}
                  </span>
                );
              case "onChain":
                return row.onChain ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ✓ Anchored
                  </span>
                ) : (
                  <span className="text-xs text-ink-muted font-mono">—</span>
                );
              case "batchId":
                return (
                  <span className="font-mono text-sm text-navy font-semibold">
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
                      onClick={() => handleCopy(row.expanded.merkleRoot)}
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

      {/* ── Pagination ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-muted">
        <span>● RPC Latency: 24ms</span>
        <span>Showing 1 - {filteredEntries.length} of {filteredEntries.length} entries</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            className="p-1.5 rounded-lg border border-border hover:border-navy hover:text-navy transition-default"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-ink-secondary">Page 1 of 1</span>
          <button
            type="button"
            aria-label="Next page"
            className="p-1.5 rounded-lg border border-border hover:border-navy hover:text-navy transition-default"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Blockchain Health Card ────────────────────────── */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <h3 className="font-semibold text-ink-primary text-base">Blockchain Health & Contract Details</h3>
          </div>
          <span className="text-xs text-ink-muted">Last Refreshed: {lastRefreshed}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-border">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block mb-1">
              Network
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-primary">Ethereum Sepolia</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-navy/10 text-navy rounded font-mono">11155111</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 border border-border">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block mb-1">
              Total On-Chain Logs
            </span>
            <span className="text-xl font-bold font-mono text-ink-primary">{totalLogs}</span>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 border border-border md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted block mb-1">
              Contract Address
            </span>
            {contractAddress ? (
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-ink-primary break-all">
                  {contractAddress}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(contractAddress)}
                  className="p-1 text-ink-muted hover:text-navy transition-default shrink-0"
                  title="Copy contract address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <span className="text-xs text-ink-muted font-mono">Not configured in .env</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
