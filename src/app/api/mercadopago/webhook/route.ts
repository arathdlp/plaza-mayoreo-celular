import { cargarDatosEmailPedido, enviarEmailPagoConfirmado } from "@/lib/email";
import { enviarTicketSiPagado } from "@/lib/ticket-service";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago-payments";
import { getMercadoPagoAccessToken } from "@/lib/mercadopago";
import { createServiceRoleClient } from "@/lib/supabase/service";
import crypto from "crypto";
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

function parseMercadoPagoSignature(xSignature: string): { ts?: string; hash?: string } {
  return xSignature.split(",").reduce<{ ts?: string; hash?: string }>((acc, part) => {
    const [key, value] = part.trim().split("=");
    if (key === "ts") acc.ts = value;
    if (key === "v1") acc.hash = value;
    return acc;
  }, {});
}

function isValidMercadoPagoSignature({
  dataId,
  hash,
  requestId,
  secret,
  ts,
}: {
  dataId: string;
  hash: string;
  requestId: string;
  secret: string;
  ts: string;
}): boolean {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return hmac === hash;
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
      await enviarTicketSiPagado(pedidoId);
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
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const dataId = url.searchParams.get("data.id");

  if (xSignature && xRequestId && dataId) {
    if (!secret) {
      console.error("[MP webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado");
      return NextResponse.json({ error: "Webhook secret no configurado" }, { status: 500 });
    }

    const { ts, hash } = parseMercadoPagoSignature(xSignature);
    if (!ts || !hash || !isValidMercadoPagoSignature({ dataId, hash, requestId: xRequestId, secret, ts })) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

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
