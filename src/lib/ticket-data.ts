import { CONTACT_CITY, CONTACT_FACEBOOK_URL, CONTACT_INSTAGRAM_URL, CONTACT_PHONE_DISPLAY, CONTACT_WHATSAPP_URL } from "@/lib/contact";
import { formatoPesos } from "@/lib/format";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TicketItem = {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type TicketData = {
  pedidoId: number;
  fecha: string;
  clienteNombre: string;
  clienteTelefono: string;
  direccion: string;
  items: TicketItem[];
  total: number;
  metodoPagoLabel: string;
  whatsapp: string;
  ciudad: string;
  facebook: string;
  instagram: string;
};

function metodoLabel(metodo: string | null): string {
  if (metodo === "mercado_pago") return "Mercado Pago";
  if (metodo === "contra_entrega") return "Efectivo al recibir";
  return metodo ?? "—";
}

type ProductoEmbed = { nombre: string } | { nombre: string }[] | null;
type ItemRow = {
  cantidad: number;
  precio_unitario: number | string;
  productos: ProductoEmbed;
};
type ClienteEmbed =
  | { nombre: string; telefono: string | null }
  | { nombre: string; telefono: string | null }[]
  | null;

export async function cargarTicketData(
  supabase: SupabaseClient,
  pedidoId: number,
): Promise<TicketData | null> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      total,
      metodo_pago,
      direccion_entrega,
      created_at,
      clientes ( nombre, telefono ),
      pedido_items ( cantidad, precio_unitario, productos ( nombre ) )
    `,
    )
    .eq("id", pedidoId)
    .maybeSingle();

  if (error || !data) return null;

  const clientes = data.clientes as ClienteEmbed;
  const cli = Array.isArray(clientes) ? clientes[0] : clientes;

  const items = ((data.pedido_items ?? []) as ItemRow[]).map((row) => {
    const p = row.productos;
    const prod = Array.isArray(p) ? p[0] : p;
    const pu =
      typeof row.precio_unitario === "string"
        ? parseFloat(row.precio_unitario)
        : Number(row.precio_unitario);
    const cantidad = Number(row.cantidad);
    return {
      nombre: prod?.nombre?.trim() || "Producto",
      cantidad,
      precio_unitario: pu,
      subtotal: pu * cantidad,
    };
  });

  const total =
    typeof data.total === "string" ? parseFloat(data.total) : Number(data.total);

  const fecha = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(data.created_at as string));

  return {
    pedidoId: data.id as number,
    fecha,
    clienteNombre: cli?.nombre?.trim() || "Cliente",
    clienteTelefono: cli?.telefono?.trim() || "—",
    direccion: (data.direccion_entrega as string) || "—",
    items,
    total,
    metodoPagoLabel: metodoLabel(data.metodo_pago as string | null),
    whatsapp: CONTACT_WHATSAPP_URL,
    ciudad: CONTACT_CITY,
    facebook: CONTACT_FACEBOOK_URL,
    instagram: CONTACT_INSTAGRAM_URL,
  };
}

export async function cargarTicketDataPedido(pedidoId: number): Promise<TicketData | null> {
  const supabase = createServiceRoleClient();
  if (!supabase) return null;
  return cargarTicketData(supabase, pedidoId);
}

export function ticketFilename(pedidoId: number): string {
  return `ticket-pedido-${pedidoId}.pdf`;
}

export function resumenTicketTexto(data: TicketData): string {
  const lineas = data.items
    .map((i) => `${i.cantidad}× ${i.nombre} — ${formatoPesos(i.subtotal)}`)
    .join("\n");
  return `Pedido #${data.pedidoId}\n${lineas}\nTotal: ${formatoPesos(data.total)}`;
}
