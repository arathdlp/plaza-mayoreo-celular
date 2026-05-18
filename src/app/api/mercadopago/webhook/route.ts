import { cargarDatosEmailPedido, enviarEmailPagoConfirmado } from "@/lib/email";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago-payments";
import { getMercadoPagoAccessToken } from "@/lib/mercadopago";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

type MpWebhookBody = {
  type?: string;
  action?: string;
  data?: { id?: string | number };
};

function parsePedidoIdFromReference(ref: string | null): number | null {
  if (!ref?.trim()) return null;
  const id = Number.parseInt(ref.trim(), 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

function extractPaymentId(body: MpWebhookBody | null, url: URL): string | null {
  if (body?.type === "payment" && body.data?.id != null) {
    return String(body.data.id);
  }

  const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");
  if (topic === "payment") {
    const id = url.searchParams.get("id") ?? url.searchParams.get("data.id");
    if (id) return id;
  }

  return null;
}

async function processPaymentNotification(paymentId: string): Promise<void> {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) {
    console.error("[MP webhook] MERCADOPAGO_ACCESS_TOKEN no configurado");
    return;
  }

  const payment = await fetchMercadoPagoPayment(paymentId, accessToken);
  if (!payment) return;

  const pedidoId = parsePedidoIdFromReference(payment.external_reference);
  if (pedidoId == null) {
    console.warn("[MP webhook] external_reference inválido", payment.external_reference);
    return;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error("[MP webhook] SUPABASE_SERVICE_ROLE_KEY no configurado");
    return;
  }

  const mpPaymentId = String(payment.id);

  if (payment.status === "approved") {
    const { error } = await supabase
      .from("pedidos")
      .update({
        estado: "preparando",
        estado_pago: "pagado",
        mp_payment_id: mpPaymentId,
      })
      .eq("id", pedidoId);

    if (error) {
      console.error("[MP webhook] update approved", pedidoId, error.message);
      return;
    }

    try {
      const emailData = await cargarDatosEmailPedido(supabase, pedidoId);
      if (emailData) {
        await enviarEmailPagoConfirmado(
          emailData.pedido,
          emailData.items,
          emailData.cliente,
        );
      }
    } catch {
      /* no bloquear el webhook por fallo de email */
    }
    return;
  }

  if (payment.status === "rejected" || payment.status === "cancelled") {
    const { error } = await supabase
      .from("pedidos")
      .update({
        estado_pago: "fallido",
        mp_payment_id: mpPaymentId,
      })
      .eq("id", pedidoId);

    if (error) {
      console.error("[MP webhook] update rejected", pedidoId, error.message);
    }
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: MpWebhookBody | null = null;

  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text) as MpWebhookBody;
    }
  } catch {
    body = null;
  }

  if (body?.type && body.type !== "payment") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const paymentId = extractPaymentId(body, url);

  if (!paymentId) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    await processPaymentNotification(paymentId);
  } catch (err) {
    console.error("[MP webhook]", err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
