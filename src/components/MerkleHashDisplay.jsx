import { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Monospace hash display with a copy-to-clipboard button,
 * used for merkle roots, tx hashes, and contract addresses.
 *
 * @param {string} hash - the full hash/address string
 * @param {string} [label] - optional label shown above the hash
 * @param {"light"|"dark"} [tone="light"] - color scheme
 */
export default function MerkleHashDisplay({ hash, label, tone = "light" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; fail silently
    }
  }

  const isDark = tone === "dark";

  return (
    <div className={isDark ? "text-white" : "text-ink-primary"}>
      {label && (
        <p
          className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
            isDark ? "text-white/60" : "text-ink-muted"
          }`}
        >
          {label}
        </p>
      )}
      <div className="flex items-center gap-2">
        <code className="font-mono text-xs break-all">{hash}</code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy hash"
          className={`shrink-0 p-1 rounded transition-default ${
            isDark
              ? "text-white/60 hover:text-white"
              : "text-ink-muted hover:text-navy"
          }`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-mint" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
