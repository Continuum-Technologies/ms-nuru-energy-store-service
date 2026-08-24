import { notFound } from "next/navigation";
import { db } from "@/infrastructure/database/client";
import { requirePermissionOrRedirect } from "@/lib/permissions";
import { updateBanner } from "@/modules/content/banners/actions";
import { BannerForm } from "@/app/admin/(dashboard)/website/_components/banner-form";

export default async function EditBannerPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  await requirePermissionOrRedirect("content.manage");

  const { id } = await params;
  const banner = await db.homepageBanner.findUnique({ where: { id } });

  if (!banner) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit banner</h1>
        <p className="text-sm text-neutral-500">{banner.title}</p>
      </div>

      <BannerForm
        action={updateBanner.bind(null, banner.id)}
        initialValues={{
          title: banner.title,
          subtitle: banner.subtitle,
          imageUrl: banner.imageUrl,
          imageKey: banner.imageKey,
          ctaLabel: banner.ctaLabel,
          ctaHref: banner.ctaHref,
          sortOrder: banner.sortOrder,
          isActive: banner.isActive,
          startsAt: banner.startsAt?.toISOString() ?? null,
          endsAt: banner.endsAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
