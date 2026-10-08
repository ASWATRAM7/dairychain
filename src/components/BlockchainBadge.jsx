import { Link2 } from "lucide-react";

/**
 * Light-blue pill badge indicating an on-chain block reference,
 * e.g. "Verified • Block #18,401".
 *
 * @param {string|number} blockNumber - block number to display
 * @param {string} [label="Verified"] - leading label text
 */
export default function BlockchainBadge({ blockNumber, label = "Verified" }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chain-bg text-chain-text text-xs font-medium">
      <Link2 className="w-3 h-3" />
      {label}
      {blockNumber != null && (
        <span className="font-mono">• Block #{blockNumber}</span>
      )}
    </span>
  );
}
