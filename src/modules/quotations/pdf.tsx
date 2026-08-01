import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatKes } from "@/lib/currency";
import { BUSINESS_INFO } from "@/lib/business-info";
import type { getQuotationById } from "./queries";

type QuotationDetail = NonNullable<Awaited<ReturnType<typeof getQuotationById>>>;

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  businessName: { fontSize: 16, fontWeight: 700 },
  muted: { color: "#6b7280", fontSize: 9 },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2, textAlign: "right" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", color: "#374151" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  table: { borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 6, fontWeight: 700 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 6 },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totalsBlock: { marginTop: 10, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#1a1a1a" },
  grandTotalLabel: { fontSize: 11, fontWeight: 700 },
  grandTotalValue: { fontSize: 11, fontWeight: 700 },
  footer: { marginTop: 24, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

function money(value: unknown): string {
  return formatKes(Number(value ?? 0));
}

function QuotationPdfDocument({ quotation }: Readonly<{ quotation: QuotationDetail }>) {
  const customerName = quotation.guestName ?? quotation.customer?.name ?? "Customer";
  const customerPhone = quotation.guestPhone ?? quotation.customer?.phone ?? "—";
  const customerEmail = quotation.guestEmail ?? quotation.customer?.email ?? null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{BUSINESS_INFO.name}</Text>
            <Text style={styles.muted}>{BUSINESS_INFO.address}</Text>
            <Text style={styles.muted}>{BUSINESS_INFO.phone}</Text>
            <Text style={styles.muted}>{BUSINESS_INFO.email}</Text>
          </View>
          <View>
            <Text style={styles.title}>QUOTATION</Text>
            <Text style={styles.muted}>No. {quotation.quotationNumber}</Text>
            <Text style={styles.muted}>Issued: {new Date(quotation.createdAt).toLocaleDateString("en-KE")}</Text>
            {quotation.expiresAt && (
              <Text style={styles.muted}>Expires: {new Date(quotation.expiresAt).toLocaleDateString("en-KE")}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prepared For</Text>
          <Text>{customerName}</Text>
          <Text style={styles.muted}>{customerPhone}</Text>
          {customerEmail && <Text style={styles.muted}>{customerEmail}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.colDescription}>Description</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Unit Price</Text>
              <Text style={styles.colTotal}>Line Total</Text>
            </View>
            {quotation.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
                <Text style={styles.colTotal}>{money(item.lineTotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{money(quotation.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Discount</Text>
              <Text>-{money(quotation.discountTotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Installation</Text>
              <Text>{money(quotation.installationCharge)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Delivery</Text>
              <Text>{money(quotation.deliveryCharge)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Tax</Text>
              <Text>{money(quotation.taxTotal)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{money(quotation.total)}</Text>
            </View>
          </View>
        </View>

        {quotation.paymentTerms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text>{quotation.paymentTerms}</Text>
          </View>
        )}

        {quotation.warrantyInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warranty Information</Text>
            <Text>{quotation.warrantyInfo}</Text>
          </View>
        )}

        {quotation.termsAndConditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
            <Text>{quotation.termsAndConditions}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {BUSINESS_INFO.name} • {BUSINESS_INFO.phone} • {BUSINESS_INFO.email}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderQuotationPdf(quotation: QuotationDetail): Promise<Buffer> {
  return renderToBuffer(<QuotationPdfDocument quotation={quotation} />);
}
