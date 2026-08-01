import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Globe } from "lucide-react";

export interface SeoValues {
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
}

export function SeoSection({ initialValues }: Readonly<{ initialValues?: SeoValues }>) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-info-700 dark:text-info-200" />
          <CardTitle>SEO & Search Engine Indexing</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-6">
        <FormField label="SEO Title" htmlFor="seoTitle">
          <Input id="seoTitle" name="seoTitle" defaultValue={initialValues?.seoTitle ?? undefined} placeholder="e.g. Sunsynk 5kW Inverter Price in Kenya" />
        </FormField>

        <FormField label="Meta Description" htmlFor="seoDescription">
          <Textarea id="seoDescription" name="seoDescription" defaultValue={initialValues?.seoDescription ?? undefined} rows={2} placeholder="Search snippet text..." />
        </FormField>

        <FormField label="Search Keywords" htmlFor="seoKeywords">
          <Input id="seoKeywords" name="seoKeywords" defaultValue={initialValues?.seoKeywords ?? undefined} placeholder="sunsynk 5kw, hybrid inverter, solar inverter nairobi" />
        </FormField>

        <FormField label="Canonical URL" htmlFor="canonicalUrl">
          <Input id="canonicalUrl" name="canonicalUrl" defaultValue={initialValues?.canonicalUrl ?? undefined} placeholder="https://nuruenergy.co.ke/shop/..." />
        </FormField>
      </CardContent>
    </Card>
  );
}
