import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";

export interface DataListColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
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
  pageSize?: number;
  page?: number;
  searchParams?: Record<string, string | string[] | undefined>;
  basePath?: string;
}

function buildPageHref(
  targetPage: number,
  searchParams?: Record<string, string | string[] | undefined>,
  basePath?: string,
): string {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (!value || key === "page") continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v) params.append(key, v);
        }
      } else {
        params.set(key, value);
      }
    }
  }

  if (targetPage > 1) {
    params.set("page", String(targetPage));
  } else if (!params.toString()) {
    return basePath || "?page=1";
  }

  const query = params.toString();
  const prefix = basePath ?? "";
  return query ? `${prefix}?${query}` : prefix || "?page=1";
}

// Renders as a real table on desktop and stacked cards on mobile (PRD §19.3 —
// wide admin tables must become readable mobile cards, and primary actions
// must never require horizontal scrolling). Server Component compatible.
export function DataList<T>({
  columns,
  rows,
  rowKey,
  mobileTitle,
  mobileAccessory,
  emptyState,
  pageSize = 15,
  page = 1,
  searchParams,
  basePath,
}: Readonly<DataListProps<T>>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const currentRows = totalPages > 1 ? rows.slice(startIndex, endIndex) : rows;

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-card border border-border md:block bg-surface">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-neutral-500 font-bold tracking-wider">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 font-semibold",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentRows.map((row) => (
              <tr key={rowKey(row)} className="bg-surface hover:bg-surface-muted/30 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 align-middle",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="flex flex-col gap-3 md:hidden">
        {currentRows.map((row) => (
          <div key={rowKey(row)} className="rounded-card border border-border bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex-1 min-w-0 font-medium text-foreground">{mobileTitle(row)}</div>
              {mobileAccessory && <div className="shrink-0 pt-0.5">{mobileAccessory(row)}</div>}
            </div>
            <dl className="mt-2 flex flex-col gap-1">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => {
                  if (!column.header) {
                    return (
                      <div key={column.key} className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center justify-end gap-1.5">
                        {column.render(row)}
                      </div>
                    );
                  }
                  return (
                    <div key={column.key} className="flex items-center justify-between gap-2 text-sm">
                      <dt className="text-neutral-500">{column.header}</dt>
                      <dd className="text-foreground">{column.render(row)}</dd>
                    </div>
                  );
                })}
            </dl>
          </div>
        ))}
      </div>

      {/* Pagination Navigation Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 py-2 text-xs text-neutral-500 border-t border-border/60">
          <div>
            Showing <span className="font-bold text-foreground">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-foreground">{endIndex}</span> of{" "}
            <span className="font-bold text-foreground">{totalRows}</span> records
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {safePage > 1 ? (
              <Link
                href={buildPageHref(safePage - 1, searchParams, basePath)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 text-xs font-bold gap-1" })}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 text-xs font-bold gap-1 opacity-50 pointer-events-none" })}>
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </span>
            )}

            <span className="px-2 font-semibold text-foreground">
              Page {safePage} of {totalPages}
            </span>

            {safePage < totalPages ? (
              <Link
                href={buildPageHref(safePage + 1, searchParams, basePath)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 text-xs font-bold gap-1" })}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 text-xs font-bold gap-1 opacity-50 pointer-events-none" })}>
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
