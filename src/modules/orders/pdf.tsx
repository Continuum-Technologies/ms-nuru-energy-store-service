import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatKes } from "@/lib/currency";
import { getBusinessInfo } from "@/lib/business-info";
import type { getOrderById } from "./queries";

type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;
type BusinessInfo = Awaited<ReturnType<typeof getBusinessInfo>>;

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  businessName: { fontSize: 16, fontWeight: 700 },
  muted: { color: "#6b7280", fontSize: 9 },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2, textAlign: "right" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", color: "#374151" },
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
  paidBadge: { marginTop: 8, alignSelf: "flex-end", fontSize: 10, fontWeight: 700, color: "#15803d" },
  footer: { marginTop: 24, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

function money(value: unknown): string {
  return formatKes(Number(value ?? 0));
}

function OrderPdfDocument({ order, businessInfo }: Readonly<{ order: OrderDetail; businessInfo: BusinessInfo }>) {
  const latestPayment = order.payments[order.payments.length - 1];
  const isPaid = latestPayment?.status === "SUCCESSFUL";
  const documentTitle = isPaid ? "RECEIPT" : "INVOICE";

  const customerName = order.guestName ?? order.customer?.name ?? "Customer";
  const customerPhone = order.guestPhone ?? order.customer?.phone ?? "—";
  const customerEmail = order.guestEmail ?? order.customer?.email ?? null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{businessInfo.name}</Text>
            <Text style={styles.muted}>{businessInfo.address}</Text>
            <Text style={styles.muted}>{businessInfo.phone}</Text>
            <Text style={styles.muted}>{businessInfo.email}</Text>
          </View>
          <View>
            <Text style={styles.title}>{documentTitle}</Text>
            <Text style={styles.muted}>No. {order.orderNumber}</Text>
            <Text style={styles.muted}>Issued: {new Date(order.createdAt).toLocaleDateString("en-KE")}</Text>
            {isPaid && latestPayment?.paidAt && (
              <Text style={styles.muted}>Paid: {new Date(latestPayment.paidAt).toLocaleDateString("en-KE")}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billed To</Text>
          <Text>{customerName}</Text>
          <Text style={styles.muted}>{customerPhone}</Text>
          {customerEmail && <Text style={styles.muted}>{customerEmail}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <Text>
            {order.deliveryLocation ? `${order.deliveryLocation}, ` : ""}
            {order.town}, {order.county}
          </Text>
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
            {order.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colDescription}>
                  {item.productName} ({item.productSku})
                </Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
                <Text style={styles.colTotal}>{money(item.lineTotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{money(order.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Discount</Text>
              <Text>-{money(order.discountTotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Installation</Text>
              <Text>{money(order.installationCharge)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Delivery</Text>
              <Text>{money(order.deliveryCharge)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text>Tax</Text>
              <Text>{money(order.taxTotal)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{money(order.total)}</Text>
            </View>
          </View>

          <Text style={styles.paidBadge}>{isPaid ? "PAID IN FULL" : `Amount Due: ${money(order.total)}`}</Text>
        </View>

        <Text style={styles.footer}>
          {businessInfo.name} • {businessInfo.phone} • {businessInfo.email}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderOrderPdf(order: OrderDetail): Promise<Buffer> {
  const businessInfo = await getBusinessInfo();
  return renderToBuffer(<OrderPdfDocument order={order} businessInfo={businessInfo} />);
}
