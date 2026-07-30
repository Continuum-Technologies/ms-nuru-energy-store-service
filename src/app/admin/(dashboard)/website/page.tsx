import { UnderDevelopment } from "@/components/ui/under-development";

export default function WebsitePage() {
  return (
    <UnderDevelopment
      title="Website Content & Banners"
      description="Manage storefront hero banners, knowledge center articles, and policy pages."
      moduleName="Website Content"
      expectedFeatures={[
        "Homepage Hero Banner Carousel Manager",
        "Knowledge Center / Solar Installation Guides",
        "Terms & Store Policy Page Editors",
        "SEO Meta Tags & Sitemaps Controls",
      ]}
    />
  );
}
