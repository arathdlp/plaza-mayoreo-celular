import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { TicketData } from "@/lib/ticket-data";
import { CONTACT_PHONE_DISPLAY } from "@/lib/contact";
import { formatoPesos } from "@/lib/format";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#0066FF",
    paddingBottom: 12,
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066FF",
  },
  meta: {
    marginTop: 6,
    fontSize: 9,
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 6,
    fontWeight: "bold",
    fontSize: 9,
    color: "#6b7280",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colProducto: { width: "48%" },
  colQty: { width: "12%", textAlign: "center" },
  colUnit: { width: "20%", textAlign: "right" },
  colSub: { width: "20%", textAlign: "right" },
  totalBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 12, fontWeight: "bold" },
  totalAmount: { fontSize: 16, fontWeight: "bold", color: "#0066FF" },
  garantia: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  garantiaTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 6 },
  garantiaText: { fontSize: 8, lineHeight: 1.45, color: "#4b5563" },
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
});

function TicketDocument({ data }: { data: TicketData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Plaza Mayoreo del Celular</Text>
          <Text style={styles.meta}>
            Ticket #{data.pedidoId} · {data.fecha}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Cliente</Text>
        <Text>{data.clienteNombre}</Text>
        <Text style={{ marginBottom: 4 }}>Tel: {data.clienteTelefono}</Text>
        <Text style={{ marginBottom: 16 }}>Dirección: {data.direccion}</Text>

        <Text style={styles.sectionTitle}>Productos</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colProducto}>Producto</Text>
          <Text style={styles.colQty}>Cant.</Text>
          <Text style={styles.colUnit}>P. unit.</Text>
          <Text style={styles.colSub}>Subtotal</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colProducto}>{item.nombre}</Text>
            <Text style={styles.colQty}>{item.cantidad}</Text>
            <Text style={styles.colUnit}>{formatoPesos(item.precio_unitario)}</Text>
            <Text style={styles.colSub}>{formatoPesos(item.subtotal)}</Text>
          </View>
        ))}

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatoPesos(data.total)}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.row}>
            <Text>Método de pago: </Text>
            <Text style={{ fontWeight: "bold" }}>{data.metodoPagoLabel}</Text>
          </Text>
        </View>

        <View style={styles.garantia}>
          <Text style={styles.garantiaTitle}>GARANTÍA</Text>
          <Text style={styles.garantiaText}>
            Este ticket es válido como comprobante de garantía. Pantallas: 30 días contra defectos
            de fábrica. Baterías: 60 días. Accesorios: 15 días. Presentar este ticket para cualquier
            reclamación.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>WhatsApp: {CONTACT_PHONE_DISPLAY}</Text>
          <Text>{data.ciudad}</Text>
          <Text>Facebook: {data.facebook}</Text>
          <Text>Instagram: {data.instagram}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateTicketPdfBuffer(data: TicketData): Promise<Buffer> {
  const buf = await renderToBuffer(<TicketDocument data={data} />);
  return Buffer.from(buf);
}
