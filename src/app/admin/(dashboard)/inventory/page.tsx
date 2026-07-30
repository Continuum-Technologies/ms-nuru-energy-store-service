import { UnderDevelopment } from "@/components/ui/under-development";

export default function InventoryPage() {
  return (
    <UnderDevelopment
      title="Inventory Control"
      description="Track stock levels, record arrivals, log damages, and manage reorder points."
      moduleName="Inventory"
      expectedFeatures={[
        "Real-Time Stock Audit Ledger",
        "Stock Receive / Damage / Adjustment Forms",
        "Low Stock Reorder Alerts",
        "Reserved Stock vs Available Stock Tracking",
        "Immutable Inventory Movement Logs",
      ]}
    />
  );
}
