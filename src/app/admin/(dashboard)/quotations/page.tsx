import { UnderDevelopment } from "@/components/ui/under-development";

export default function QuotationsPage() {
  return (
    <UnderDevelopment
      title="Quotation Requests"
      description="Review customer quote inquiries for custom solar and power installations."
      moduleName="Quotations"
      expectedFeatures={[
        "Incoming Quote Request Ingress Queue",
        "Line Item Pricing & Custom Discount Calculator",
        "PDF Quotation Document Generation",
        "Quotation-to-Order Conversion Pipeline",
        "Customer Site Assessment Notes",
      ]}
    />
  );
}
