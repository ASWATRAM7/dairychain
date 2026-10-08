/**
 * Page-level header: title, optional subtitle, and right-aligned action buttons.
 *
 * @param {React.ReactNode} [eyebrow] - small content above the title (badges, meta text)
 * @param {string} title - serif page title
 * @param {React.ReactNode} [subtitle] - subtitle/meta row under the title
 * @param {React.ReactNode} [actions] - buttons/links rendered on the right
 */
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
      <div>
        {eyebrow && <div className="mb-3">{eyebrow}</div>}
        <h1 className="font-serif text-3xl md:text-[32px] text-ink-primary">
          {title}
        </h1>
        {subtitle && <div className="mt-2">{subtitle}</div>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
