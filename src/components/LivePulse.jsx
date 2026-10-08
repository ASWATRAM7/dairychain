/**
 * Small animated dot indicating a "live" data feed, paired with a label.
 *
 * @param {string} [label="LIVE STREAM"] - text shown next to the dot
 * @param {"mint"|"navy"} [color="mint"] - dot color
 */
export default function LivePulse({ label = "LIVE STREAM", color = "mint" }) {
  const dotColor = color === "navy" ? "bg-navy" : "bg-mint";

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-page border border-border text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
      <span className="relative flex h-2 w-2">
        <span
          className={`live-pulse-ring absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      {label}
    </span>
  );
}
