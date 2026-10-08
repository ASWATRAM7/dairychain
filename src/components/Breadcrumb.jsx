import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Simple breadcrumb trail, e.g. "Home / Batches / MILK001".
 *
 * @param {{label:string,to?:string}[]} items - trail items in order;
 *   the last item is rendered as plain text (current page)
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />}
            {isLast || !item.to ? (
              <span className="text-ink-primary font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.to}
                className="text-ink-secondary hover:text-navy transition-default"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
