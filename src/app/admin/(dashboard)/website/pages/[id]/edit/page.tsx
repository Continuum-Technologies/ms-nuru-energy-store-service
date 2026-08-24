import { notFound } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { updatePage } from "@/modules/content/pages/actions";
import { PageForm } from "@/app/admin/(dashboard)/website/_components/page-form";

export default async function EditContentPagePage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  await requirePermissionOrRedirect("content.manage");

  const { id } = await params;
  const page = await db.page.findUnique({ where: { id } });

  if (!page) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit page</h1>
        <p className="text-sm text-neutral-500">{page.title}</p>
      </div>

      <PageForm
        action={updatePage.bind(null, page.id)}
        initialValues={{
          type: page.type,
          title: page.title,
          slug: page.slug,
          body: page.body,
          isPublished: page.isPublished,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          seoKeywords: page.seoKeywords,
          canonicalUrl: page.canonicalUrl,
        }}
      />
    </div>
  );
}
