import { Check, Clock } from "lucide-react";

/**
 * A single circular node in a horizontal custody/route timeline.
 *
 * @param {"complete"|"pending"} status - complete shows a check, pending shows a clock
 * @param {string} title - node title, e.g. "Farm Dispatch"
 * @param {string} subtitle - location/entity name
 * @param {string[]} details - additional detail lines shown under the subtitle
 * @param {boolean} [isLast=false] - suppress the connecting line after the last node
 * @param {boolean} [active=false] - highlight this node with a glow ring (current step)
 */
export default function TimelineNode({
  status = "complete",
  title,
  subtitle,
  details = [],
  isLast = false,
  active = false,
}) {
  return (
    <div className="flex-1 min-w-[160px] flex flex-col items-center text-center relative">
      {!isLast && (
        <div className="absolute top-6 left-1/2 w-full h-px bg-border -z-10" />
      )}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-default ${
          status === "complete"
            ? "bg-mint/10 border-mint text-mint"
            : "bg-page border-border text-ink-muted"
        } ${active ? "ring-4 ring-navy/10" : ""}`}
      >
        {status === "complete" ? (
          <Check className="w-5 h-5" strokeWidth={2.5} />
        ) : (
          <Clock className="w-5 h-5" />
        )}
      </div>
      <p className="mt-3 text-sm font-semibold text-ink-primary">{title}</p>
      <p className="text-sm text-ink-secondary">{subtitle}</p>
      <div className="mt-1 space-y-0.5">
        {details.map((line) => (
          <p key={line} className="text-xs text-ink-muted">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
