const VARIANTS = {
  safe: {
    dot: "bg-mint",
    text: "text-mint",
    bg: "bg-mint/10",
  },
  warning: {
    dot: "bg-amber",
    text: "text-amber",
    bg: "bg-amber/10",
  },
  critical: {
    dot: "bg-danger",
    text: "text-danger",
    bg: "bg-danger/10",
  },
  neutral: {
    dot: "bg-ink-muted",
    text: "text-ink-secondary",
    bg: "bg-page",
  },
};

/**
 * Small pill badge with a colored dot, used for status like
 * "Safe", "Alert", "Pending", etc.
 *
 * @param {"safe"|"warning"|"critical"|"neutral"} status - visual variant
 * @param {string} label - text shown next to the dot
 * @param {boolean} [filled=false] - solid background pill instead of a bare dot + text
 */
export default function StatusBadge({ status = "safe", label, filled = false }) {
  const v = VARIANTS[status] ?? VARIANTS.neutral;

  if (filled) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${v.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {label}
    </span>
  );
}
