import Link from "next/link";
import { Plus, FileEdit, ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deletePage } from "@/modules/content/pages/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";
import { publicPathForPage } from "@/modules/content/page-paths";
import type { PageType } from "@/generated/prisma/client";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  type: PageType;
  isPublished: boolean;
}

const TYPE_LABEL: Record<PageType, string> = {
  STATIC: "Static Page",
  POLICY: "Policy / FAQ",
  SOLUTION: "Solution",
};

export default async function PagesListPage() {
  await requirePermissionOrRedirect("content.manage");

  const pages = await db.page.findMany({ orderBy: [{ type: "asc" }, { title: "asc" }] });
  const rows: PageRow[] = pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug, type: p.type, isPublished: p.isPublished }));

  const columns: DataListColumn<PageRow>[] = [
    {
      key: "title",
      header: "Page",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link href={`/admin/website/pages/${row.id}/edit`} className="font-semibold text-foreground hover:text-brand-600 transition-colors">
            {row.title}
          </Link>
          <span className="text-xs font-mono text-neutral-500">/{row.slug}</span>
        </div>
      ),
    },
    { key: "type", header: "Type", hideOnMobile: true, render: (row) => <span className="text-xs text-neutral-500">{TYPE_LABEL[row.type]}</span> },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge tone={row.isPublished ? "success" : "neutral"}>{row.isPublished ? "Published" : "Draft"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/website/pages/${row.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1" })}
          >
            <FileEdit className="h-3 w-3" />
            Edit
          </Link>
          {row.isPublished && (
            <a
              href={publicPathForPage(row.type, row.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1 text-neutral-500 hover:text-brand-600" })}
            >
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          )}
          <DeleteRowButton action={deletePage} id={row.id} label="page" name={row.title} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/website" className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 gap-1 px-2 text-xs" })}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Website Content
            </Link>
          </div>
          <h1 className="text-xl font-bold text-foreground">Pages</h1>
          <p className="text-sm text-neutral-500">About, Contact, policies, FAQ, and solution pages.</p>
        </div>
        <Link href="/admin/website/pages/new" className={buttonVariants({ size: "sm", className: "gap-1.5 font-bold" })}>
          <Plus className="h-4 w-4" />
          Add Page
        </Link>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.title}
        mobileAccessory={(row) => <Badge tone={row.isPublished ? "success" : "neutral"}>{row.isPublished ? "Published" : "Draft"}</Badge>}
        emptyState={
          <EmptyState
            title="No pages created yet"
            description="Add About, Contact, policy, FAQ, or solution pages for the storefront."
            action={
              <Link href="/admin/website/pages/new" className={buttonVariants({ size: "sm" })}>
                <Plus className="h-4 w-4" />
                Add Page
              </Link>
            }
          />
        }
      />
    </div>
  );
}
