import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, ShieldCheck, Truck, RefreshCw, HelpCircle } from "lucide-react";
import { getPageBySlug } from "@/modules/content/queries";
import { buildPageMetadata } from "@/modules/content/metadata";
import { PageContent } from "../../_components/page-content";

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

const POLICY_LINKS = [
  { slug: "delivery-shipping", label: "Delivery & Shipping", icon: Truck },
  { slug: "warranty-returns", label: "Warranty & Returns", icon: RefreshCw },
  { slug: "faq", label: "Frequently Asked Questions", icon: HelpCircle },
  { slug: "privacy-policy", label: "Privacy Policy", icon: ShieldCheck },
  { slug: "terms-conditions", label: "Terms & Conditions", icon: FileText },
];

export async function generateMetadata({ params }: Readonly<PolicyPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || page.type !== "POLICY") return {};
  return buildPageMetadata(page, `/pages/${slug}`);
}

export default async function PolicyPage({ params }: Readonly<PolicyPageProps>) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || page.type !== "POLICY") notFound();

  return (
    <div className="mx-auto flex max-w-[1536px] flex-col gap-8 px-4 py-8 sm:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Customer Care & Policies</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-foreground truncate">{page.title}</span>
      </nav>

      {/* Main Content Layout with Sidebar Navigation */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Quick Policy Nav */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs">
            <span className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Customer Policies
            </span>
            {POLICY_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = link.slug === slug;
              return (
                <Link
                  key={link.slug}
                  href={`/pages/${link.slug}`}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                      : "text-neutral-600 hover:bg-surface-muted hover:text-foreground dark:text-neutral-300"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-neutral-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Policy Document Body */}
        <article className="flex-1 rounded-3xl border border-border/80 bg-surface p-6 sm:p-10 shadow-2xs">
          <PageContent title={page.title} body={page.body} />
        </article>
      </div>
    </div>
  );
}
