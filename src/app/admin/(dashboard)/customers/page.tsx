import { UnderDevelopment } from "@/components/ui/under-development";

export default function CustomersPage() {
  return (
    <UnderDevelopment
      title="Customer Directory"
      description="View registered accounts, guest contact records, and delivery locations."
      moduleName="Customers"
      expectedFeatures={[
        "Customer Search & Filtering",
        "Individual / Business / Farmer Classification",
        "Order & Quotation History Per Customer",
        "Delivery Address Management",
      ]}
    />
  );
}
