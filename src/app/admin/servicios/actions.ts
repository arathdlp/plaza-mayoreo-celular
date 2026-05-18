"use server";

import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import { ESTADOS_SOLICITUD, type EstadoSolicitud } from "@/types/servicio";
import { revalidatePath } from "next/cache";

async function db() {
  const r = await getAdminSupabase();
  if (!r.ok) throw new Error("Sin permiso de administración.");
  return r.supabase;
}

export async function actualizarEstadoSolicitud(solicitudId: number, estado: string) {
  if (!Number.isFinite(solicitudId) || solicitudId <= 0) {
    return { ok: false as const, error: "ID inválido." };
  }
  if (!ESTADOS_SOLICITUD.includes(estado as EstadoSolicitud)) {
    return { ok: false as const, error: "Estado no válido." };
  }

  const supabase = await db();
  const { error } = await supabase
    .from("solicitudes_servicio")
    .update({ estado })
    .eq("id", solicitudId);

  if (error) {
    console.error("[admin actualizarEstadoSolicitud]", error.message);
    return { ok: false as const, error: "No se pudo actualizar la solicitud." };
  }

  revalidatePath("/admin/servicios");
  return { ok: true as const };
}
