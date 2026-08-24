import { requirePermissionOrRedirect } from "@/lib/permissions";
import { createPage } from "@/modules/content/pages/actions";
import { PageForm } from "@/app/admin/(dashboard)/website/_components/page-form";

export default async function NewContentPagePage() {
  await requirePermissionOrRedirect("content.manage");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add page</h1>
        <p className="text-sm text-neutral-500">About, Contact, a policy/FAQ, or a solution page.</p>
      </div>

      <PageForm action={createPage} submitLabel="Create page" />
    </div>
  );
}
