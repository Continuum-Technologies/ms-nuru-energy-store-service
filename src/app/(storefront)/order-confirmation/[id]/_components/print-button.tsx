"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintReceiptButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 text-xs font-semibold"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" />
      Print Receipt
    </Button>
  );
}
