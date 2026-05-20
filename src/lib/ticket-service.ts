import { enviarEmailTicketCompra } from "@/lib/email";
import { cargarTicketData, ticketFilename } from "@/lib/ticket-data";
import { generateTicketPdfBuffer } from "@/lib/ticket-pdf";
import { getSiteBaseUrl } from "@/lib/mercadopago";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** Genera PDF y envía email cuando el pedido queda pagado. Idempotente por pedido (no reenvía si ya tiene ticket_sent). */
export async function enviarTicketSiPagado(pedidoId: number): Promise<void> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error("[ticket] service role no configurado");
    return;
  }

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, estado_pago, ticket_enviado_at")
    .eq("id", pedidoId)
    .maybeSingle();

  if (!pedido || pedido.estado_pago !== "pagado") return;
  if (pedido.ticket_enviado_at) return;

  const ticketData = await cargarTicketData(supabase, pedidoId);
  if (!ticketData) {
    console.error("[ticket] no se pudo cargar datos", pedidoId);
    return;
  }

  let pdf: Buffer;
  try {
    pdf = await generateTicketPdfBuffer(ticketData);
  } catch (err) {
    console.error("[ticket] generar PDF", pedidoId, err);
    return;
  }

  const ticketUrl = `${getSiteBaseUrl()}/api/pedidos/${pedidoId}/ticket`;

  try {
    const { data: full } = await supabase
      .from("pedidos")
      .select("clientes ( nombre, email )")
      .eq("id", pedidoId)
      .maybeSingle();

    const clientes = full?.clientes as
      | { nombre: string; email: string }
      | { nombre: string; email: string }[]
      | null;
    const cli = Array.isArray(clientes) ? clientes[0] : clientes;

    if (cli?.email?.trim()) {
      await enviarEmailTicketCompra({
        pedidoId,
        clienteNombre: cli.nombre?.trim() || "Cliente",
        clienteEmail: cli.email.trim(),
        ticketUrl,
        pdf,
        filename: ticketFilename(pedidoId),
      });
    }
  } catch (err) {
    console.error("[ticket] email", pedidoId, err);
  }

  await supabase
    .from("pedidos")
    .update({ ticket_enviado_at: new Date().toISOString() })
    .eq("id", pedidoId)
    .is("ticket_enviado_at", null);
}
