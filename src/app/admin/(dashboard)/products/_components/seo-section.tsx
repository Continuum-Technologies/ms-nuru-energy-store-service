import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";

export interface SeoValues {
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
}

export function SeoSection({ initialValues }: Readonly<{ initialValues?: SeoValues }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField label="SEO title" htmlFor="seoTitle">
          <Input id="seoTitle" name="seoTitle" defaultValue={initialValues?.seoTitle ?? undefined} />
        </FormField>
        <FormField label="Meta description" htmlFor="seoDescription">
          <Textarea id="seoDescription" name="seoDescription" defaultValue={initialValues?.seoDescription ?? undefined} rows={2} />
        </FormField>
        <FormField label="Search keywords" htmlFor="seoKeywords">
          <Input id="seoKeywords" name="seoKeywords" defaultValue={initialValues?.seoKeywords ?? undefined} />
        </FormField>
        <FormField label="Canonical URL" htmlFor="canonicalUrl">
          <Input id="canonicalUrl" name="canonicalUrl" defaultValue={initialValues?.canonicalUrl ?? undefined} />
        </FormField>
      </CardContent>
    </Card>
  );
}
