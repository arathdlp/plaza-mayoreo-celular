import { cargarTicketData } from "@/lib/ticket-data";
import { generateTicketPdfBuffer } from "@/lib/ticket-pdf";
import { ticketFilename } from "@/lib/ticket-data";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isCurrentUserClientAdmin } from "@/lib/supabase/is-client-admin";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

async function puedeDescargarTicket(pedidoId: number): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  if (await isCurrentUserClientAdmin()) return true;

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, estado_pago, cliente_id")
    .eq("id", pedidoId)
    .eq("cliente_id", user.id)
    .maybeSingle();

  return Boolean(pedido && pedido.estado_pago === "pagado");
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: raw } = await context.params;
  const pedidoId = Number.parseInt(raw, 10);
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const allowed = await puedeDescargarTicket(pedidoId);
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Servidor no configurado" }, { status: 500 });
  }

  const data = await cargarTicketData(admin, pedidoId);
  if (!data) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  try {
    const pdf = await generateTicketPdfBuffer(data);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${ticketFilename(pedidoId)}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    console.error("[ticket API]", err);
    return NextResponse.json({ error: "Error al generar PDF" }, { status: 500 });
  }
}
