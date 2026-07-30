import { UnderDevelopment } from "@/components/ui/under-development";

export default function OrdersPage() {
  return (
    <UnderDevelopment
      title="Orders Management"
      description="Process customer orders, verify payment callbacks, and handle dispatching."
      moduleName="Orders"
      expectedFeatures={[
        "Order Processing Workflow (New -> Confirmed -> Dispatched -> Completed)",
        "M-Pesa / Bank Reference Manual Verification",
        "Printable Thermal POS & Standard Invoices",
        "Guest & Registered Customer Order History",
        "Order Items Price Snapshots Audit",
      ]}
    />
  );
}
