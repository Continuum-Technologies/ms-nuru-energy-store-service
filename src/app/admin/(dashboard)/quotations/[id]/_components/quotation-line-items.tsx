"use client";

import { useActionState, useTransition, useState, useRef, useEffect } from "react";
import { Trash2, Package, Plus, PackageCheck, Pencil, Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatKes } from "@/lib/currency";
import { addQuotationItem, updateQuotationItem, removeQuotationItem } from "@/modules/quotations/admin-actions";

export interface QuotationLineItem {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuotationLineItemsProduct {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
}

export interface QuotationLineItemsProps {
  quotationId: string;
  items: QuotationLineItem[];
  products: QuotationLineItemsProduct[];
  editable: boolean;
}

export function QuotationLineItems({ quotationId, items, products, editable }: Readonly<QuotationLineItemsProps>) {
  const lineTotalSum = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <Card className="shadow-2xs">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400">
              <Package className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-base font-extrabold">Equipment & Service Line Items</CardTitle>
              <span className="text-xs text-neutral-500">{items.length} {items.length === 1 ? "item" : "items"} configured</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface-muted/40 px-3 py-1.5 text-xs font-bold">
            <span className="text-neutral-500">Items Subtotal:</span>
            <span className="font-mono text-foreground text-sm font-extrabold">{formatKes(lineTotalSum)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Empty State */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-surface-muted/20 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
              <PackageCheck className="h-6 w-6 stroke-1" />
            </div>
            <div className="flex flex-col gap-0.5 max-w-sm">
              <h3 className="text-sm font-bold text-foreground">No Equipment Configured Yet</h3>
              <p className="text-xs text-neutral-500">
                Select catalog equipment (solar panels, inverters, batteries) or add custom installation line items below.
              </p>
            </div>
          </div>
        )}

        {/* Clean Items Table */}
        {items.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/80 bg-surface-muted/50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 w-12 text-center">#</th>
                  <th className="py-3 px-3.5">Item & Description</th>
                  <th className="py-3 px-3.5 text-center w-20">Qty</th>
                  <th className="py-3 px-3.5 text-right w-32">Unit Price</th>
                  <th className="py-3 px-3.5 text-right w-36">Total Value</th>
                  {editable && <th className="py-3 px-3.5 text-right w-24">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item, index) => (
                  <LineItemRow key={item.id} item={item} index={index} products={products} editable={editable} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Item Form at bottom */}
        {editable && <AddLineItemForm quotationId={quotationId} products={products} />}
      </CardContent>
    </Card>
  );
}

function LineItemRow({
  item,
  index,
  products,
  editable,
}: Readonly<{ item: QuotationLineItem; index: number; products: QuotationLineItemsProduct[]; editable: boolean }>) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [state, formAction, pending] = useActionState(updateQuotationItem.bind(null, item.id), undefined);
  const [removing, startRemoveTransition] = useTransition();

  const [selectedProductId, setSelectedProductId] = useState<string>(item.productId ?? "");
  const [unitPrice, setUnitPrice] = useState<number>(item.unitPrice);
  const [quantity, setQuantity] = useState<number>(item.quantity);

  const matchedProduct = products.find((p) => p.id === selectedProductId);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setUnitPrice(product.sellingPrice);
    }
  };

  // If read-only or not actively editing, render a clean table row
  if (!editable || !isEditing) {
    return (
      <tr className="hover:bg-surface-muted/30 transition-colors">
        <td className="py-3 px-3.5 font-bold text-neutral-400 text-center font-mono">{index + 1}</td>
        <td className="py-3 px-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-foreground text-xs">{item.description}</span>
            {matchedProduct && (
              <span className="text-[10px] font-semibold text-neutral-500 font-mono">SKU: {matchedProduct.sku}</span>
            )}
          </div>
        </td>
        <td className="py-3 px-3.5 text-center font-bold font-mono text-foreground">{item.quantity}</td>
        <td className="py-3 px-3.5 text-right font-medium font-mono text-neutral-600 dark:text-neutral-400">
          {formatKes(item.unitPrice)}
        </td>
        <td className="py-3 px-3.5 text-right font-extrabold font-mono text-foreground">
          {formatKes(item.lineTotal)}
        </td>
        {editable && (
          <td className="py-3 px-3.5 text-right">
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                title="Edit Line Item"
                className="h-8 w-8 p-0 text-neutral-600 hover:text-brand-600"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={removing}
                onClick={() => startRemoveTransition(() => removeQuotationItem(item.id))}
                title="Delete Line Item"
                className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-950"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </td>
        )}
      </tr>
    );
  }

  // Active Inline Edit Form
  return (
    <tr className="bg-brand-50/20 dark:bg-brand-600/10 border-l-4 border-l-brand-600">
      <td colSpan={6} className="p-3.5">
        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5 text-brand-600" />
              Editing Item #{index + 1}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="gap-1 text-xs text-neutral-500 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={pending} className="gap-1 text-xs font-bold">
                <Check className="h-3.5 w-3.5" />
                {pending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="flex flex-col gap-1 sm:col-span-6">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Catalog Product</label>
              <Select
                name="productId"
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Custom Item / Service (No catalog match)</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-6">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Description / Specs</label>
              <Input
                name="description"
                defaultValue={item.description}
                placeholder="e.g. 550W Tier-1 Solar Module"
                required
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Quantity</label>
              <Input
                name="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Unit Price (KES)</label>
              <Input
                name="unitPrice"
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="flex flex-col justify-end gap-1 sm:col-span-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Line Total</span>
              <span className="font-mono text-sm font-extrabold text-foreground py-2">
                {formatKes(quantity * unitPrice)}
              </span>
            </div>
          </div>

          {state?.error && <p className="text-xs font-semibold text-danger-600">{state.error}</p>}
        </form>
      </td>
    </tr>
  );
}

function AddLineItemForm({
  quotationId,
  products,
}: Readonly<{ quotationId: string; products: QuotationLineItemsProduct[] }>) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(addQuotationItem.bind(null, quotationId), undefined);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");

  const prevPending = useRef(false);

  useEffect(() => {
    // If pending went from true to false, and there is no error in state, reset the form
    if (prevPending.current && !pending && !state?.error) {
      setSelectedProductId("");
      setDescription("");
      setUnitPrice("");
      formRef.current?.reset();
    }
    prevPending.current = pending;
  }, [pending, state]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setDescription(product.name);
      setUnitPrice(product.sellingPrice.toString());
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-brand-500/30 bg-brand-50/20 p-4 dark:bg-brand-600/5 shadow-2xs"
    >
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Plus className="h-4 w-4 text-brand-600" />
        <span className="text-xs font-extrabold text-foreground">Add Equipment or Service Line Item</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="flex flex-col gap-1 sm:col-span-6">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Catalog Product (Optional)
          </label>
          <Select
            name="productId"
            value={selectedProductId}
            onChange={(e) => handleProductSelect(e.target.value)}
          >
            <option value="">Custom Line Item / EPRA Service / Delivery</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku}) — {formatKes(product.sellingPrice)}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-6">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Description / Specs</label>
          <Input
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 10kW Hybrid Inverter or On-site Wiring"
            required
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Quantity</label>
          <Input name="quantity" type="number" min={1} defaultValue={1} required />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Unit Price (KES)</label>
          <Input
            name="unitPrice"
            type="number"
            min={0}
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex items-end sm:col-span-3">
          <Button type="submit" size="sm" disabled={pending} className="w-full gap-1.5 font-bold text-xs">
            <Plus className="h-4 w-4" />
            {pending ? "Adding…" : "Add Line Item"}
          </Button>
        </div>
      </div>

      {state?.error && <p className="text-xs font-semibold text-danger-600">{state.error}</p>}
    </form>
  );
}
