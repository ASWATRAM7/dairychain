import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Reusable data table with hover-highlighted rows and optional
 * per-row expandable detail content (used for the ledger page).
 *
 * @param {{key:string,label:string,align?:"left"|"right"|"center"}[]} columns
 *   column definitions; `key` must match a field in each row object
 * @param {object[]} rows - row data; each row should have a stable `id` field
 * @param {(row:object)=>React.ReactNode} renderCell - renders a cell for (row, column)
 * @param {(row:object)=>React.ReactNode} [renderExpanded] - optional expanded-row content;
 *   when provided, rows become clickable/expandable
 */
export default function DataTable({ columns, rows, renderCell, renderExpanded }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="scroll-x">
      <table className="w-full min-w-[840px] text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted whitespace-nowrap ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
            {renderExpanded && <th className="w-10" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isExpanded = expandedId === row.id;
            return (
              <Fragment key={row.id}>
                <tr
                  key={row.id}
                  className={`table-row-hover border-b border-border last:border-0 transition-default ${
                    renderExpanded ? "cursor-pointer" : ""
                  }`}
                  onClick={
                    renderExpanded
                      ? () => setExpandedId(isExpanded ? null : row.id)
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 whitespace-nowrap ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {renderCell(row, col)}
                    </td>
                  ))}
                  {renderExpanded && (
                    <td className="px-2 text-center">
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted transition-default inline-block ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </td>
                  )}
                </tr>
                {renderExpanded && isExpanded && (
                  <tr key={`${row.id}-expanded`} className="bg-page">
                    <td colSpan={columns.length + 1} className="px-4 py-4">
                      {renderExpanded(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
