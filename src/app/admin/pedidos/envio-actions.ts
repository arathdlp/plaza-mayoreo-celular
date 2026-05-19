"use server";

import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import { geocodeAddress, type LatLng } from "@/lib/google-maps";
import { MORELIA_CENTER } from "@/lib/envio-labels";
import { TIPOS_ENVIO, type TipoEnvio } from "@/types/envio";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

export type AsignarEnvioInput = {
  pedidoId: number;
  tipo: TipoEnvio;
  repartidorNombre?: string;
  repartidorTelefono?: string;
  paqueteriaEmpresa?: string;
  numeroGuia?: string;
  tiempoEstimadoMinutos?: number | null;
};

async function db() {
  const r = await getAdminSupabase();
  if (!r.ok) throw new Error("Sin permiso de administración.");
  return r.supabase;
}

export async function asignarEnvioPedido(input: AsignarEnvioInput) {
  if (!Number.isFinite(input.pedidoId) || input.pedidoId <= 0) {
    return { ok: false as const, error: "Pedido inválido." };
  }
  if (!TIPOS_ENVIO.includes(input.tipo)) {
    return { ok: false as const, error: "Tipo de envío inválido." };
  }

  if (input.tipo === "local") {
    if (!input.repartidorNombre?.trim() || !input.repartidorTelefono?.trim()) {
      return { ok: false as const, error: "Nombre y teléfono del repartidor son obligatorios." };
    }
  } else if (!input.paqueteriaEmpresa?.trim() || !input.numeroGuia?.trim()) {
    return { ok: false as const, error: "Empresa y número de guía son obligatorios." };
  }

  const supabase = await db();

  const { data: pedido, error: pedErr } = await supabase
    .from("pedidos")
    .select("id, direccion_entrega")
    .eq("id", input.pedidoId)
    .maybeSingle();

  if (pedErr || !pedido) {
    return { ok: false as const, error: "Pedido no encontrado." };
  }

  const direccion = (pedido.direccion_entrega as string)?.trim() || "";
  let destino: LatLng = { ...MORELIA_CENTER };
  try {
    const geo = await geocodeAddress(direccion);
    if (geo) destino = geo;
  } catch {
    /* usa centro Morelia */
  }

  const token = randomUUID();
  const row = {
    pedido_id: input.pedidoId,
    tipo: input.tipo,
    estado: "pendiente" as const,
    direccion_destino: direccion,
    destino_lat: destino.lat,
    destino_lng: destino.lng,
    repartidor_nombre: input.tipo === "local" ? input.repartidorNombre?.trim() : null,
    repartidor_telefono: input.tipo === "local" ? input.repartidorTelefono?.trim() : null,
    paqueteria_empresa: input.tipo === "paqueteria" ? input.paqueteriaEmpresa?.trim() : null,
    numero_guia: input.tipo === "paqueteria" ? input.numeroGuia?.trim() : null,
    repartidor_token: token,
    tiempo_estimado_minutos: input.tiempoEstimadoMinutos ?? null,
  };

  const { data: existing } = await supabase
    .from("envios")
    .select("id")
    .eq("pedido_id", input.pedidoId)
    .maybeSingle();

  let envioId: number;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("envios")
      .update({ ...row, repartidor_token: token })
      .eq("id", existing.id)
      .select("id, repartidor_token")
      .single();
    if (error || !data) {
      return { ok: false as const, error: "No se pudo actualizar el envío." };
    }
    envioId = data.id as number;
  } else {
    const { data, error } = await supabase.from("envios").insert(row).select("id, repartidor_token").single();
    if (error || !data) {
      console.error("[asignarEnvio]", error?.message);
      return { ok: false as const, error: "No se pudo crear el envío." };
    }
    envioId = data.id as number;
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${input.pedidoId}/tracking`);

  return {
    ok: true as const,
    envioId,
    token: token,
  };
}
