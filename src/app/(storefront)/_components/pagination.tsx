import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PaginationProps {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}

function hrefForPage(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Plain `<Link>`-based prev/next + page numbers — no client state, so pages stay crawlable/bookmarkable (CLAUDE.md §10). */
export function Pagination({ basePath, searchParams, page, totalPages }: Readonly<PaginationProps>) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-4">
      <Link
        href={hrefForPage(basePath, searchParams, page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-control border border-border text-neutral-500 hover:bg-surface-muted",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p, index) => (
        <span key={p} className="flex items-center gap-1.5">
          {index > 0 && pages[index - 1] !== p - 1 && <span className="px-1 text-neutral-400">…</span>}
          <Link
            href={hrefForPage(basePath, searchParams, p)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-control text-sm font-semibold",
              p === page ? "bg-brand-600 text-white" : "text-foreground hover:bg-surface-muted",
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={hrefForPage(basePath, searchParams, page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-control border border-border text-neutral-500 hover:bg-surface-muted",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
