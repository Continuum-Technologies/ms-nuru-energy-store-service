import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { deleteBrand } from "@/modules/catalog/brands/actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataList, type DataListColumn } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteRowButton } from "@/app/admin/(dashboard)/_components/delete-row-button";

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  countryOfOrigin: string | null;
  isActive: boolean;
  productCount: number;
}

export default async function BrandsPage() {
  await requirePermissionOrRedirect("brands.manage");

  const brands = await db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const rows: BrandRow[] = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    countryOfOrigin: brand.countryOfOrigin,
    isActive: brand.isActive,
    productCount: brand._count.products,
  }));

  const columns: DataListColumn<BrandRow>[] = [
    {
      key: "name",
      header: "Brand",
      hideOnMobile: true,
      render: (row) => (
        <Link href={`/admin/brands/${row.id}/edit`} className="font-medium text-foreground hover:text-brand-600">
          {row.name}
        </Link>
      ),
    },
    { key: "slug", header: "Slug", render: (row) => <span className="text-neutral-500">{row.slug}</span> },
    { key: "origin", header: "Origin", render: (row) => row.countryOfOrigin ?? "—" },
    { key: "products", header: "Products", render: (row) => row.productCount },
    {
      key: "status",
      header: "Status",
      hideOnMobile: true,
      render: (row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/brands/${row.id}/edit`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Edit
          </Link>
          <DeleteRowButton action={deleteBrand} id={row.id} label="brand" name={row.name} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Brands</h1>
          <p className="text-sm text-neutral-500">Manage equipment manufacturers carried in the catalog.</p>
        </div>
        <Link href="/admin/brands/new" className={buttonVariants({ size: "sm", className: "gap-2" })}>
          <Plus className="h-4 w-4" />
          Add Brand
        </Link>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileAccessory={(row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Hidden"}</Badge>}
        emptyState={
          <EmptyState
            title="No brands yet"
            description="Add the manufacturers whose equipment you stock."
            action={
              <Link href="/admin/brands/new" className={buttonVariants({ size: "sm" })}>
                Add Brand
              </Link>
            }
          />
        }
      />
    </div>
  );
}
