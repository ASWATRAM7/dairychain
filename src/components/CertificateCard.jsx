import { Award } from "lucide-react";
import MerkleHashDisplay from "./MerkleHashDisplay.jsx";
import StatusBadge from "./StatusBadge.jsx";

/**
 * Cream-background certificate card with a gold seal, used on the
 * Verify page to present a batch's cold-chain authenticity certificate.
 *
 * @param {string} batchId
 * @param {string} issuedNote - subtitle under the certificate title
 * @param {{label:string, lines:React.ReactNode[]}[]} columns - up to 6 detail columns
 * @param {string} merkleHash - leaf proof hash
 * @param {string} signatureNote - bottom-left validator note
 */
export default function CertificateCard({
  batchId,
  issuedNote,
  columns = [],
  merkleHash,
  signatureNote,
}) {
  return (
    <div className="relative bg-certificate-bg border-2 border-certificate-gold/40 rounded-xl p-8 shadow-sm">
      <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-certificate-gold/20 border-2 border-certificate-gold flex items-center justify-center">
        <Award className="w-7 h-7 text-certificate-gold" />
      </div>

      <StatusBadge status="safe" label="CRYPTOGRAPHICALLY VALIDATED" filled />

      <h2 className="mt-4 font-serif text-3xl text-ink-primary">
        Certificate of Cold-Chain Authenticity
      </h2>
      <p className="mt-2 text-sm text-ink-secondary max-w-2xl">{issuedNote}</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
              {col.label}
            </p>
            <div className="space-y-1">
              {col.lines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-certificate-gold/30">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
          Merkle Leaf Proof
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <MerkleHashDisplay hash={merkleHash} />
          <button
            type="button"
            className="shrink-0 px-4 py-2 rounded-lg border border-navy text-navy text-sm font-medium hover:bg-navy hover:text-white transition-default self-start sm:self-auto"
          >
            View Explorer
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-ink-muted">{signatureNote}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-navy text-navy text-sm font-medium hover:bg-navy hover:text-white transition-default"
          >
            Share Verification
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 hover:scale-[1.02] transition-default"
          >
            Download PDF Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
