import { ENVIOS_DB_SELECT, mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserClientAdmin } from "@/lib/supabase/is-client-admin";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { EnvioRow } from "@/types/envio";

export type PedidoTrackingPayload = {
  pedidoId: number;
  envio: EnvioRow;
  clienteNombre?: string;
  clienteTelefono?: string;
  /** Token de acceso en URL (invitados sin sesión). */
  accessToken?: string;
};

export type LoadPedidoTrackingResult =
  | { ok: true; data: PedidoTrackingPayload }
  | { ok: false; reason: "no_access" | "no_envio" | "pedido_not_found" };

function parseCliente(
  clientes: { nombre: string; telefono: string } | { nombre: string; telefono: string }[] | null,
) {
  const cli = Array.isArray(clientes) ? clientes[0] : clientes;
  return { nombre: cli?.nombre, telefono: cli?.telefono };
}

function buildPayload(
  pedidoId: number,
  pedido: { direccion_entrega: string; clientes?: unknown },
  envioRaw: EnvioDbRow,
  accessToken?: string,
): PedidoTrackingPayload {
  const { nombre, telefono } = parseCliente(
    pedido.clientes as
      | { nombre: string; telefono: string }
      | { nombre: string; telefono: string }[]
      | null,
  );
  const envio = mapEnvioFromDb(envioRaw, {
    direccionEntrega: pedido.direccion_entrega as string,
  });
  return {
    pedidoId,
    envio,
    clienteNombre: nombre,
    clienteTelefono: telefono,
    accessToken: accessToken ?? envio.repartidor_token,
  };
}

async function loadByToken(pedidoId: number, token: string): Promise<LoadPedidoTrackingResult> {
  const admin = createServiceRoleClient();
  if (!admin) return { ok: false, reason: "no_access" };

  const { data: envioRaw } = await admin
    .from("envios")
    .select(ENVIOS_DB_SELECT)
    .eq("pedido_id", pedidoId)
    .eq("token", token)
    .maybeSingle();

  if (!envioRaw) return { ok: false, reason: "no_access" };

  const { data: pedido } = await admin
    .from("pedidos")
    .select("id, direccion_entrega, clientes ( nombre, telefono )")
    .eq("id", pedidoId)
    .maybeSingle();

  if (!pedido) return { ok: false, reason: "pedido_not_found" };

  return {
    ok: true,
    data: buildPayload(pedidoId, pedido, envioRaw as unknown as EnvioDbRow, token),
  };
}

async function loadByAdmin(pedidoId: number): Promise<LoadPedidoTrackingResult> {
  const admin = createServiceRoleClient();
  if (!admin) return { ok: false, reason: "no_access" };

  const { data: pedido } = await admin
    .from("pedidos")
    .select("id, direccion_entrega, clientes ( nombre, telefono )")
    .eq("id", pedidoId)
    .maybeSingle();

  if (!pedido) return { ok: false, reason: "pedido_not_found" };

  const { data: envioRaw } = await admin
    .from("envios")
    .select(ENVIOS_DB_SELECT)
    .eq("pedido_id", pedidoId)
    .maybeSingle();

  if (!envioRaw) return { ok: false, reason: "no_envio" };

  return {
    ok: true,
    data: buildPayload(pedidoId, pedido, envioRaw as unknown as EnvioDbRow),
  };
}

async function loadByOwner(pedidoId: number, userId: string): Promise<LoadPedidoTrackingResult> {
  const supabase = await createClient();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, direccion_entrega, clientes ( nombre, telefono )")
    .eq("id", pedidoId)
    .eq("cliente_id", userId)
    .maybeSingle();

  if (!pedido) return { ok: false, reason: "no_access" };

  const { data: envioRaw } = await supabase
    .from("envios")
    .select(ENVIOS_DB_SELECT)
    .eq("pedido_id", pedidoId)
    .maybeSingle();

  if (!envioRaw) return { ok: false, reason: "no_envio" };

  const { nombre, telefono } = parseCliente(
    pedido.clientes as
      | { nombre: string; telefono: string }
      | { nombre: string; telefono: string }[]
      | null,
  );
  const envio = mapEnvioFromDb(envioRaw as unknown as EnvioDbRow, {
    direccionEntrega: pedido.direccion_entrega as string,
  });

  return {
    ok: true,
    data: {
      pedidoId,
      envio,
      clienteNombre: nombre,
      clienteTelefono: telefono,
      accessToken: envio.repartidor_token,
    },
  };
}

export function pedidoTrackingHref(pedidoId: number, token?: string | null): string {
  const base = `/pedidos/${pedidoId}/tracking`;
  const t = token?.trim();
  if (!t) return base;
  return `${base}?token=${encodeURIComponent(t)}`;
}

export async function loadPedidoTracking(
  pedidoId: number,
  options: { userId?: string | null; token?: string | null },
): Promise<LoadPedidoTrackingResult> {
  const token = options.token?.trim() || null;

  if (options.userId) {
    const owner = await loadByOwner(pedidoId, options.userId);
    if (owner.ok || owner.reason === "no_envio") return owner;

    if (await isCurrentUserClientAdmin()) {
      return loadByAdmin(pedidoId);
    }
  }

  if (token) {
    return loadByToken(pedidoId, token);
  }

  if (options.userId) {
    return { ok: false, reason: "no_access" };
  }

  return { ok: false, reason: "no_access" };
}
