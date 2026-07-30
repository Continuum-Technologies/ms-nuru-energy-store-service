import type { ReactNode } from "react";

export interface DataListColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  // Omit on the mobile card when the value is already shown as the card's
  // title or accessory, to avoid repeating it.
  hideOnMobile?: boolean;
}

export interface DataListProps<T> {
  columns: DataListColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  mobileTitle: (row: T) => ReactNode;
  mobileAccessory?: (row: T) => ReactNode;
  emptyState?: ReactNode;
}

// Renders as a real table on desktop and stacked cards on mobile (PRD §19.3 —
// wide admin tables must become readable mobile cards, and primary actions
// must never require horizontal scrolling). Put a link in a column's own
// `render` (e.g. wrap the order number) rather than a row-level href prop —
// keeps this component's job to layout, not routing.
export function DataList<T>({
  columns,
  rows,
  rowKey,
  mobileTitle,
  mobileAccessory,
  emptyState,
}: Readonly<DataListProps<T>>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-card border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-neutral-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="bg-surface">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-foreground">{mobileTitle(row)}</div>
              {mobileAccessory?.(row)}
            </div>
            <dl className="mt-2 flex flex-col gap-1">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div key={column.key} className="flex items-center justify-between gap-2 text-sm">
                    <dt className="text-neutral-500">{column.header}</dt>
                    <dd className="text-foreground">{column.render(row)}</dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
