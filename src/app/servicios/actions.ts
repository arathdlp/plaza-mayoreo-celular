"use server";

import { enviarEmailNuevaSolicitudServicio } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_SERVICIO, type TipoServicio } from "@/types/servicio";

export type CrearSolicitudServicioInput = {
  nombre: string;
  telefono: string;
  email: string;
  tipo_servicio: TipoServicio;
  marca_equipo: string;
  modelo_equipo: string;
  descripcion: string;
};

export type CrearSolicitudServicioResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function crearSolicitudServicio(
  input: CrearSolicitudServicioInput,
): Promise<CrearSolicitudServicioResult> {
  const nombre = input.nombre.trim();
  const telefono = input.telefono.trim();
  const email = input.email.trim();
  const descripcion = input.descripcion.trim();
  const marca = input.marca_equipo.trim() || null;
  const modelo = input.modelo_equipo.trim() || null;

  if (!nombre || !telefono || !email || !descripcion) {
    return { ok: false, error: "Completa los campos obligatorios." };
  }

  if (!TIPOS_SERVICIO.includes(input.tipo_servicio)) {
    return { ok: false, error: "Tipo de servicio no válido." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("solicitudes_servicio")
    .insert({
      nombre,
      telefono,
      email,
      tipo_servicio: input.tipo_servicio,
      marca_equipo: marca,
      modelo_equipo: modelo,
      descripcion,
      estado: "nueva",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error("[crearSolicitudServicio]", error?.message);
    return {
      ok: false,
      error:
        error?.message?.includes("solicitudes_servicio") ||
        error?.message?.includes("does not exist")
          ? "Ejecuta la migración SQL de solicitudes_servicio en Supabase."
          : "No se pudo enviar la solicitud. Intenta de nuevo.",
    };
  }

  const id = data.id as number;

  try {
    await enviarEmailNuevaSolicitudServicio({
      id,
      nombre,
      telefono,
      email,
      tipo_servicio: input.tipo_servicio,
      marca_equipo: marca,
      modelo_equipo: modelo,
      descripcion,
    });
  } catch {
    /* no bloquear si falla el correo */
  }

  return { ok: true, id };
}
