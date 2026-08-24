import Link from "next/link";
import { Plus, Image as ImageIcon, FileText, FileEdit, ExternalLink } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deleteBanner } from "@/modules/content/banners/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";

interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default async function WebsitePage() {
  await requirePermissionOrRedirect("content.manage");

  const banners = await db.homepageBanner.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: BannerRow[] = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    sortOrder: b.sortOrder,
    isActive: b.isActive,
  }));

  const columns: DataListColumn<BannerRow>[] = [
    {
      key: "title",
      header: "Banner",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link href={`/admin/website/banners/${row.id}/edit`} className="font-semibold text-foreground hover:text-brand-600 transition-colors">
            {row.title}
          </Link>
          {row.subtitle && <span className="text-xs text-neutral-500">{row.subtitle}</span>}
        </div>
      ),
    },
    { key: "order", header: "Display Order", hideOnMobile: true, render: (row) => <span className="text-xs text-neutral-500">#{row.sortOrder}</span> },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/website/banners/${row.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 px-2 text-xs font-bold gap-1" })}
          >
            <FileEdit className="h-3 w-3" />
            Edit
          </Link>
          <DeleteRowButton action={deleteBanner} id={row.id} label="banner" name={row.title} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Website Content & Banners</h1>
          <p className="text-sm text-neutral-500">Manage the homepage hero carousel and storefront pages.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/admin/website/pages" className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 font-bold" })}>
            <FileText className="h-4 w-4" />
            Manage Pages
          </Link>
          <Link href="/admin/website/banners/new" className={buttonVariants({ size: "sm", className: "gap-1.5 font-bold" })}>
            <Plus className="h-4 w-4" />
            Add Banner
          </Link>
        </div>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.title}
        mobileAccessory={(row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>}
        emptyState={
          <EmptyState
            title="No homepage banners yet"
            description="Add a banner to replace the default hero content on the storefront homepage."
            action={
              <Link href="/admin/website/banners/new" className={buttonVariants({ size: "sm" })}>
                <Plus className="h-4 w-4" />
                Add Banner
              </Link>
            }
          />
        }
      />

      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <ImageIcon className="h-3.5 w-3.5" />
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-brand-600">
          View storefront homepage
          <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
