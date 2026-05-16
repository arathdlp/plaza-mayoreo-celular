import {
  createPreferenceClient,
  getMercadoPagoAccessToken,
  getSiteBaseUrl,
  parsePhoneMx,
  resolveInitPoint,
} from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type CompradorInput = {
  nombre: string;
  email: string;
  telefono: string;
};

type ItemInput = {
  productoId: number;
  cantidad: number;
  nombre?: string;
};

type PreferenceRequestBody = {
  pedidoId: number;
  comprador: CompradorInput;
  items?: ItemInput[];
};

type ProductoEmbed = { nombre: string } | { nombre: string }[] | null;

function productoNombre(p: ProductoEmbed): string {
  if (!p) return "Producto";
  const row = Array.isArray(p) ? p[0] : p;
  return row?.nombre?.trim() || "Producto";
}

export async function POST(request: Request) {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Mercado Pago no está configurado en el servidor." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  let body: PreferenceRequestBody;
  try {
    body = (await request.json()) as PreferenceRequestBody;
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const pedidoId = Number(body.pedidoId);
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ error: "pedidoId inválido." }, { status: 400 });
  }

  const comprador = body.comprador;
  if (!comprador?.email?.trim() || !comprador?.nombre?.trim()) {
    return NextResponse.json({ error: "Datos del comprador incompletos." }, { status: 400 });
  }

  const { data: pedido, error: pedidoErr } = await supabase
    .from("pedidos")
    .select("id, cliente_id, total, metodo_pago")
    .eq("id", pedidoId)
    .eq("cliente_id", user.id)
    .maybeSingle();

  if (pedidoErr || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  if (pedido.metodo_pago !== "mercado_pago") {
    return NextResponse.json({ error: "Este pedido no usa Mercado Pago." }, { status: 400 });
  }

  const { data: lineasDb, error: lineasErr } = await supabase
    .from("pedido_items")
    .select("producto_id, cantidad, precio_unitario, productos ( nombre )")
    .eq("pedido_id", pedidoId);

  if (lineasErr || !lineasDb?.length) {
    return NextResponse.json({ error: "El pedido no tiene productos." }, { status: 400 });
  }

  const mpItems = lineasDb.map((row) => {
    const precio =
      typeof row.precio_unitario === "string"
        ? parseFloat(row.precio_unitario)
        : Number(row.precio_unitario);
    const cantidad = Number(row.cantidad);
    return {
      id: String(row.producto_id),
      title: productoNombre(row.productos as ProductoEmbed).slice(0, 256),
      quantity: cantidad,
      unit_price: precio,
      currency_id: "MXN",
    };
  });

  const totalPedido =
    typeof pedido.total === "string" ? parseFloat(pedido.total) : Number(pedido.total);
  const sumItems = mpItems.reduce((acc, it) => acc + it.unit_price * it.quantity, 0);
  if (Math.abs(sumItems - totalPedido) > 0.02) {
    console.warn("[MP preference] total mismatch", { pedidoId, sumItems, totalPedido });
  }

  const base = getSiteBaseUrl();
  const backUrls = {
    success: `${base}/pedidos?pago=exitoso`,
    failure: `${base}/checkout?pago=fallido`,
    pending: `${base}/pedidos?pago=pendiente`,
  };

  const phone = parsePhoneMx(comprador.telefono ?? "");
  const nameParts = comprador.nombre.trim().split(/\s+/);
  const payerName = nameParts[0] ?? comprador.nombre;
  const payerSurname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

  try {
    const preference = createPreferenceClient();
    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: payerName,
          surname: payerSurname,
          email: comprador.email.trim(),
          phone,
        },
        back_urls: backUrls,
        auto_return: "approved",
        external_reference: String(pedidoId),
        statement_descriptor: "PLAZA MAYOREO",
      },
    });

    const initPoint = resolveInitPoint(result, accessToken);
    if (!initPoint) {
      console.error("[MP preference] sin init_point", result);
      return NextResponse.json(
        { error: "Mercado Pago no devolvió URL de pago." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      init_point: initPoint,
      preference_id: result.id,
      pedido_id: pedidoId,
    });
  } catch (err) {
    console.error("[MP preference]", err);
    const message = err instanceof Error ? err.message : "Error al crear preferencia";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
