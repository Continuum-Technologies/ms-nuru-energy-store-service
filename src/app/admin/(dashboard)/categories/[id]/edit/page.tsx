import { notFound } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { updateCategory } from "@/modules/catalog/categories/actions";
import { CategoryForm } from "@/app/admin/(dashboard)/categories/_components/category-form";
import { SpecTemplateSection } from "@/app/admin/(dashboard)/categories/_components/spec-template-section";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermissionOrRedirect("categories.manage");

  const { id } = await params;

  const [category, parentOptions, template] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({
      where: { id: { not: id } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.specificationTemplate.findFirst({
      where: { categoryId: id },
      include: { fields: { orderBy: { displayOrder: "asc" } } },
    }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit category</h1>
        <p className="text-sm text-neutral-500">{category.name}</p>
      </div>

      <CategoryForm
        action={updateCategory.bind(null, category.id)}
        parentOptions={parentOptions}
        initialValues={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          parentId: category.parentId,
          displayOrder: category.displayOrder,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          seoKeywords: category.seoKeywords,
          canonicalUrl: category.canonicalUrl,
        }}
      />

      <SpecTemplateSection categoryId={category.id} template={template} />
    </div>
  );
}
