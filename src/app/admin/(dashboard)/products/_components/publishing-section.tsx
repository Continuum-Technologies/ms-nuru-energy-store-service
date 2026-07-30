"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/app/admin/(dashboard)/_components/form-field";
import { updateProductStatus } from "@/modules/catalog/products/actions";
import type { ProductStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  HIDDEN: "Hidden",
  OUT_OF_STOCK: "Out of stock",
  AVAILABLE_ON_ORDER: "Available on order",
  DISCONTINUED: "Discontinued",
  ARCHIVED: "Archived",
};

// OUT_OF_STOCK / AVAILABLE_ON_ORDER are availability states driven by
// inventory, not something the owner picks directly from this form.
const EDITABLE_STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "HIDDEN", "DISCONTINUED", "ARCHIVED"];

/** Edit-only. A product isn't publicly visible until explicitly published (CLAUDE.md §14.1). */
export function PublishingSection({
  productId,
  status,
  publishedAt,
}: Readonly<{ productId: string; status: ProductStatus; publishedAt: Date | null }>) {
  const [state, formAction, pending] = useActionState(updateProductStatus.bind(null, productId), undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Current status:</span>
          <Badge tone={status === "ACTIVE" ? "success" : "neutral"}>{STATUS_LABELS[status]}</Badge>
          {publishedAt && (
            <span className="text-xs text-neutral-400">Published {publishedAt.toLocaleDateString("en-KE")}</span>
          )}
        </div>

        <form action={formAction} className="flex items-end gap-2">
          <div className="flex-1">
            <FormField label="Change status" htmlFor="status">
              <Select id="status" name="status" defaultValue={status}>
                {EDITABLE_STATUSES.map((editableStatus) => (
                  <option key={editableStatus} value={editableStatus}>
                    {STATUS_LABELS[editableStatus]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update status"}
          </Button>
        </form>
        {state?.error && <p className="text-sm text-danger-600">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
