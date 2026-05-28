import { mensajeWhatsAppEntregado, urlWhatsApp } from "@/lib/contact-links";
import { ENVIOS_DB_SELECT, mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { estadoPedidoPorEnvio, patchPedidoAlEntregar } from "@/lib/pedido-flujo";
import { enviarTicketSiPagado } from "@/lib/ticket-service";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { RepartidorContext, RepartidorPedidoItem } from "@/types/repartidor";
import type { EnvioRow, EstadoEnvio } from "@/types/envio";

export function parseEnvioId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Token de acceso del repartidor desde query string o body JSON. */
export function tokenFromRepartidorRequest(
  request: Request,
  body?: { token?: string | null },
): string | null {
  const fromQuery = new URL(request.url).searchParams.get("token");
  const fromBody = body?.token;
  const token = (fromQuery ?? fromBody)?.trim();
  return token || null;
}

function isAuthErrorRepartidor(message: string): boolean {
  return (
    message.includes("inválido") ||
    message.includes("expirado") ||
    message.includes("acceso") ||
    message.includes("No autorizado")
  );
}

export function httpStatusRepartidorError(message: string): 401 | 403 {
  return isAuthErrorRepartidor(message) ? 401 : 403;
}

type AuthOpts = {
  token?: string | null;
  repartidorId?: string | null;
};

async function authorizeEnvioAccess(
  envioId: number,
  opts: AuthOpts,
): Promise<{ ok: true; row: EnvioDbRow } | { ok: false; error: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) return { ok: false, error: "Servidor no configurado." };

  const { data, error } = await supabase
    .from("envios")
    .select(ENVIOS_DB_SELECT)
    .eq("id", envioId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Enlace inválido o expirado." };
  }

  const row = data as unknown as EnvioDbRow;
  const token = opts.token?.trim();

  if (token && row.token === token) {
    return { ok: true, row };
  }

  if (opts.repartidorId && row.repartidor_id === opts.repartidorId) {
    return { ok: true, row };
  }

  if (token) {
    return { ok: false, error: "Enlace inválido o expirado." };
  }

  return { ok: false, error: "No tienes acceso a este envío." };
}

async function syncPedidoConEnvio(pedidoId: number, envioEstado: EstadoEnvio) {
  const supabase = createServiceRoleClient();
  if (!supabase) return;

  const nuevoEstado = estadoPedidoPorEnvio(envioEstado);
  if (envioEstado === "entregado") {
    const { data: pedido } = await supabase
      .from("pedidos")
      .select("metodo_pago")
      .eq("id", pedidoId)
      .maybeSingle();

    const patch = patchPedidoAlEntregar((pedido?.metodo_pago as string) ?? null);
    await supabase.from("pedidos").update(patch).eq("id", pedidoId);
    await enviarTicketSiPagado(pedidoId);
    return;
  }

  if (nuevoEstado) {
    await supabase.from("pedidos").update({ estado: nuevoEstado }).eq("id", pedidoId);
  }
}

async function buildContextFromRow(row: EnvioDbRow): Promise<
  { ok: true; data: RepartidorContext } | { ok: false; error: string }
> {
  const supabase = createServiceRoleClient()!;

  const { data: pedido, error: pedErr } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      total,
      metodo_pago,
      estado_pago,
      estado,
      direccion_entrega,
      cliente_id,
      pedido_items (
        cantidad,
        precio_unitario,
        productos ( nombre, imagen_url )
      ),
      clientes ( nombre, telefono )
    `,
    )
    .eq("id", row.pedido_id)
    .maybeSingle();

  if (pedErr || !pedido) {
    return { ok: false, error: "Pedido no encontrado." };
  }

  const clientes = pedido.clientes as
    | { nombre: string; telefono: string }
    | { nombre: string; telefono: string }[]
    | null;
  const clienteRow = Array.isArray(clientes) ? clientes[0] : clientes;

  const itemsRaw = (pedido.pedido_items ?? []) as {
    cantidad: number;
    precio_unitario: number | string;
    productos:
      | { nombre: string; imagen_url: string | null }
      | { nombre: string; imagen_url: string | null }[]
      | null;
  }[];

  const items: RepartidorPedidoItem[] = itemsRaw.map((it) => {
    const p = it.productos;
    const prod = Array.isArray(p) ? p[0] : p;
    const pu =
      typeof it.precio_unitario === "string"
        ? parseFloat(it.precio_unitario)
        : it.precio_unitario;
    return {
      nombre: prod?.nombre?.trim() || "Producto",
      cantidad: it.cantidad,
      precio_unitario: pu,
      imagen_url: prod?.imagen_url ?? null,
    };
  });

  const envio: EnvioRow = mapEnvioFromDb(row, {
    direccionEntrega: pedido.direccion_entrega as string,
  });

  return {
    ok: true,
    data: {
      envio,
      pedido: {
        id: pedido.id as number,
        total: typeof pedido.total === "string" ? parseFloat(pedido.total) : (pedido.total as number),
        metodo_pago: (pedido.metodo_pago as string | null) ?? null,
        estado_pago: (pedido.estado_pago as string | null) ?? null,
        estado: pedido.estado as string,
        direccion_entrega: pedido.direccion_entrega as string,
      },
      cliente: {
        nombre: clienteRow?.nombre?.trim() || "Cliente",
        telefono: clienteRow?.telefono?.trim() || "",
      },
      items,
    },
  };
}

export async function validarTokenRepartidor(
  envioId: number,
  token: string | null,
  repartidorId?: string | null,
) {
  const auth = await authorizeEnvioAccess(envioId, { token, repartidorId });
  if (!auth.ok) return auth;
  const envio = mapEnvioFromDb(auth.row);
  return { ok: true as const, envio };
}

export async function getRepartidorContext(
  envioId: number,
  token: string | null,
  repartidorId?: string | null,
): Promise<{ ok: true; data: RepartidorContext } | { ok: false; error: string }> {
  const auth = await authorizeEnvioAccess(envioId, { token, repartidorId });
  if (!auth.ok) return auth;
  return buildContextFromRow(auth.row);
}

export async function registrarUbicacionRepartidor(
  envioId: number,
  token: string | null,
  lat: number,
  lng: number,
  repartidorId?: string | null,
) {
  const auth = await validarTokenRepartidor(envioId, token, repartidorId);
  if (!auth.ok) return auth;

  const supabase = createServiceRoleClient()!;
  const envio = auth.envio;

  if (auth.envio.estado === "entregado") {
    return { ok: true as const, estado: auth.envio.estado, ignored: true };
  }

  if (auth.envio.estado === "en_camino" || auth.envio.estado === "llegando") {
    const { error: insErr } = await supabase.from("ubicaciones_envio").insert({
      envio_id: envioId,
      lat,
      lng,
    });
    if (insErr) {
      console.error("[ubicacion envio]", insErr.message);
      return { ok: false as const, error: "No se pudo guardar la ubicación." };
    }
  }

  let nuevoEstado = envio.estado;

  const { error: updErr } = await supabase
    .from("envios")
    .update({
      lat_actual: lat,
      lng_actual: lng,
      updated_at: new Date().toISOString(),
      ...(nuevoEstado !== envio.estado ? { estado: nuevoEstado } : {}),
    })
    .eq("id", envioId);

  if (updErr) {
    return { ok: false as const, error: "No se pudo actualizar el envío." };
  }
  return { ok: true as const, estado: nuevoEstado };
}

export async function actualizarEstadoRepartidor(
  envioId: number,
  token: string | null,
  estado: EstadoEnvio,
  coords?: { lat: number; lng: number },
  repartidorId?: string | null,
) {
  const auth = await validarTokenRepartidor(envioId, token, repartidorId);
  if (!auth.ok) return auth;

  const supabase = createServiceRoleClient()!;
  const patch: Record<string, unknown> = { estado };

  if (estado === "en_camino" && coords) {
    patch.lat_actual = coords.lat;
    patch.lng_actual = coords.lng;
  }
  if (estado === "entregado" && coords) {
    patch.lat_actual = coords.lat;
    patch.lng_actual = coords.lng;
  }

  const { error } = await supabase.from("envios").update(patch).eq("id", envioId);
  if (error) {
    return { ok: false as const, error: "No se pudo actualizar el estado." };
  }

  if (coords && (estado === "en_camino" || estado === "entregado")) {
    await supabase.from("ubicaciones_envio").insert({
      envio_id: envioId,
      lat: coords.lat,
      lng: coords.lng,
    });
  }

  await syncPedidoConEnvio(auth.envio.pedido_id, estado);

  let whatsappEntregado: string | null = null;
  if (estado === "entregado") {
    const ctx = await getRepartidorContext(envioId, token, repartidorId);
    if (ctx.ok && ctx.data.cliente.telefono) {
      whatsappEntregado = urlWhatsApp(
        ctx.data.cliente.telefono,
        mensajeWhatsAppEntregado(ctx.data.pedido.id),
      );
    }
  }

  return { ok: true as const, whatsappEntregado };
}
