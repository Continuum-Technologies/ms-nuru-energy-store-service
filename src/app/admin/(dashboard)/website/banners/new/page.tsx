import { requirePermissionOrRedirect } from "@/lib/permissions";
import { createBanner } from "@/modules/content/banners/actions";
import { BannerForm } from "@/app/admin/(dashboard)/website/_components/banner-form";

export default async function NewBannerPage() {
  await requirePermissionOrRedirect("content.manage");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add homepage banner</h1>
        <p className="text-sm text-neutral-500">Appears in the storefront hero carousel once active.</p>
      </div>

      <BannerForm action={createBanner} submitLabel="Create banner" />
    </div>
  );
}
