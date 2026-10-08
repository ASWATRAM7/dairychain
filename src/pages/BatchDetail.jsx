import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Share2, FileJson } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import TimelineNode from "../components/TimelineNode.jsx";
import MerkleHashDisplay from "../components/MerkleHashDisplay.jsx";
import { batchJourney, milk001TemperatureLog } from "../data/mockData.js";

export default function BatchDetail() {
  const { id } = useParams();
  const batch = batchJourney; // mock data keyed to MILK001 regardless of :id for now

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Batches", to: "/dashboard" },
          { label: id || batch.id },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="font-serif text-3xl text-ink-primary">
            Batch Journey — {id || batch.id}
          </h1>
          <p className="mt-2 font-mono text-xs text-ink-muted">
            CONTRACT: {batch.contract} | GAS: {batch.gasGwei} GWEI | VOLUME:{" "}
            {batch.volumeLiters.toLocaleString()} L | {batch.union.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge
            status="safe"
            label={`Cold-Chain Compliant (${batch.complianceScore}%)`}
            filled
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-navy text-navy text-sm font-medium hover:bg-navy hover:text-white transition-default"
          >
            <Share2 className="w-4 h-4" />
            Share Audit Log
          </button>
        </div>
      </div>

      {/* Route timeline */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-ink-primary">
            Consortium Route Telemetry
          </h3>
          <span className="text-xs text-ink-muted">
            Live Synchronized via IoT Mesh
          </span>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-8 sm:gap-2">
          {batch.route.map((node, i) => (
            <TimelineNode
              key={node.title}
              status={node.status}
              title={node.title}
              subtitle={node.subtitle}
              details={node.details}
              isLast={i === batch.route.length - 1}
              active={node.status === "complete" && batch.route[i + 1]?.status === "pending"}
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Thermal chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-ink-primary">
            Continuous Thermal Telemetry
          </h3>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={milk001TemperatureLog}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  domain={[0, 8]}
                  ticks={[0, 2, 4, 6]}
                  tickFormatter={(v) => `${v.toFixed(1)}°C`}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  formatter={(v) => [`${v}°C`, "Temperature"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <ReferenceArea
                  y1={2}
                  y2={6}
                  fill="#22C55E"
                  fillOpacity={0.08}
                  label={{
                    value: "OPTIMAL PRESERVATION ZONE",
                    position: "insideTopLeft",
                    fontSize: 10,
                    fill: "#22C55E",
                  }}
                />
                <ReferenceLine
                  y={6}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  label={{
                    value: "Upper Threshold: 6.0°C",
                    position: "right",
                    fontSize: 10,
                    fill: "#DC2626",
                  }}
                />
                <ReferenceLine
                  y={2}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  label={{
                    value: "Lower Threshold: 2.0°C",
                    position: "right",
                    fontSize: 10,
                    fill: "#DC2626",
                  }}
                />
                <ReferenceDot
                  x="08:15"
                  y={6.4}
                  r={5}
                  fill="#DC2626"
                  stroke="none"
                  label={{
                    value: "09:45 AM | 6.4°C | Threshold Breach",
                    position: "top",
                    fontSize: 10,
                    fill: "#DC2626",
                  }}
                />
                <ReferenceDot x="08:30" y={4.0} r={5} fill="#22C55E" stroke="none" />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#1E40AF"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {batch.metrics.map((m) => (
              <div
                key={m.label}
                className="border border-border rounded-lg p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {m.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-ink-primary">
                  {m.value}
                </p>
                <p className="text-xs text-ink-muted">{m.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Authority ledger */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Authority Ledger
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink-primary">
            Batch Details &amp; Cryptographic Provenance
          </h3>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">
              Farm / Origin &amp; Source
            </p>
            <p className="text-sm text-ink-primary font-medium">
              {batch.farmOrigin.name}
            </p>
            <p className="text-sm text-ink-secondary">{batch.farmOrigin.zone}</p>
            <p className="text-sm text-ink-secondary">
              Producer Farmers: {batch.farmOrigin.farmers}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              GPS Anchor: {batch.farmOrigin.gps}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">
              Certified Milk Chemistry
            </p>
            <div className="grid grid-cols-3 gap-2">
              {batch.chemistry.map((c) => (
                <div
                  key={c.label}
                  className="border border-border rounded-lg p-2 text-center"
                >
                  <p className="text-sm font-semibold text-ink-primary">
                    {c.value}
                  </p>
                  <p className="text-[10px] text-ink-muted uppercase">
                    {c.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 bg-navy-deep rounded-lg p-4">
            <MerkleHashDisplay
              label="◉ Merkle Root Hash"
              hash={batch.merkleRoot}
              tone="dark"
            />
            <p className="mt-2 text-xs text-white/60">
              Validation Nodes: {batch.validationNode}, Last Assertion{" "}
              {batch.lastAssertion}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#dcebe0] bg-[#f8fcf8] p-3">
            <div className="w-20 h-20 rounded-lg border border-[#cfe5d4] bg-white flex items-center justify-center p-1">
              <QRCodeSVG value={`${window.location.origin}/scan?batch=${encodeURIComponent(batch.id)}`} size={68} bgColor="#ffffff" fgColor="#123b2a" includeMargin={false} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#164d33]">Scan to share this journey</p>
              <p className="mt-1 text-xs text-slate-500">Customer-safe public proof link for {batch.id}</p>
              <p className="mt-1 font-mono text-[10px] text-slate-400">/scan?batch={batch.id}</p>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-navy text-navy text-sm font-medium hover:bg-navy hover:text-white transition-default"
          >
            <FileJson className="w-4 h-4" />
            Inspect Smart Contract JSON Payload
          </button>
        </div>
      </div>
    </div>
  );
}
