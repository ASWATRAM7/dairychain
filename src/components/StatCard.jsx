/**
 * Top-level metric card used on the dashboard and landing stat rows.
 *
 * @param {string} label - small uppercase label, e.g. "ACTIVE BATCHES"
 * @param {string|number} value - the big stat number
 * @param {string} [note] - supporting note under the value, e.g. "↑ 12% vs. Yesterday"
 * @param {"positive"|"neutral"|"negative"} [noteTone="neutral"] - color of the note text
 * @param {React.ComponentType} [icon] - lucide icon component shown top-right
 * @param {string} [description] - longer supporting copy (used on landing stat cards)
 */
export default function StatCard({
  label,
  value,
  note,
  noteTone = "neutral",
  icon: Icon,
  description,
}) {
  const noteColor =
    noteTone === "positive"
      ? "text-mint"
      : noteTone === "negative"
      ? "text-danger"
      : "text-ink-muted";

  return (
    <div className="card-hover bg-card border border-border rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-ink-muted" />}
      </div>
      <div className="mt-2 font-sans font-semibold text-4xl text-ink-primary">
        {value}
      </div>
      {note && <p className={`mt-1 text-sm font-medium ${noteColor}`}>{note}</p>}
      {description && (
        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
