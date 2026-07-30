import { UnderDevelopment } from "@/components/ui/under-development";

export default function ReportsPage() {
  return (
    <UnderDevelopment
      title="Analytics & Reports"
      description="View sales trends, inventory turnover, revenue summaries, and popular categories."
      moduleName="Reports & Analytics"
      expectedFeatures={[
        "Daily / Weekly / Monthly Sales Analytics",
        "Top-Selling Solar & Battery Products Chart",
        "Inventory Turnover & Valuation Ledger",
        "Quotation Conversion Rate Metrics",
        "Exportable CSV Reports for Accounting",
      ]}
    />
  );
}
