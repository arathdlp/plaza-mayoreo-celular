"use server";

import { getAdminServiceSupabase } from "@/app/admin/_lib/supabase-admin";
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
  const r = await getAdminServiceSupabase();
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
    destino_lat: destino.lat,
    destino_lng: destino.lng,
    repartidor_nombre: input.tipo === "local" ? input.repartidorNombre?.trim() : null,
    repartidor_telefono: input.tipo === "local" ? input.repartidorTelefono?.trim() : null,
    paqueteria: input.tipo === "paqueteria" ? input.paqueteriaEmpresa?.trim() : null,
    numero_guia: input.tipo === "paqueteria" ? input.numeroGuia?.trim() : null,
    token,
    tiempo_estimado: input.tiempoEstimadoMinutos ?? null,
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
      .update({ ...row, token })
      .eq("id", existing.id)
      .select("id, token")
      .single();
    if (error || !data) {
      console.error("[asignarEnvio] update", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      return { ok: false as const, error: "No se pudo actualizar el envío." };
    }
    envioId = data.id as number;
  } else {
    const { data, error } = await supabase.from("envios").insert(row).select("id, token").single();
    if (error || !data) {
      console.error("[asignarEnvio] insert", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      return { ok: false as const, error: "No se pudo crear el envío." };
    }
    envioId = data.id as number;
  }

  await supabase.from("pedidos").update({ estado: "preparando" }).eq("id", input.pedidoId);

  revalidatePath("/admin/pedidos");
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${input.pedidoId}/tracking`);

  return {
    ok: true as const,
    envioId,
    token,
  };
}
