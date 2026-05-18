import { ETIQUETAS_TIPO_SERVICIO } from "@/lib/servicios-labels";
import type { TipoServicio } from "@/types/servicio";

export function telefonoParaWaMe(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("52")) return digits;
  if (digits.length === 10) return `52${digits}`;
  return `52${digits}`;
}

function textoEquipoWhatsApp(marca: string | null, modelo: string | null): string {
  const partes = [marca?.trim(), modelo?.trim()].filter(Boolean);
  return partes.length > 0 ? partes.join(" ") : "equipo";
}

export function mensajeWhatsAppSolicitudServicio(input: {
  nombre: string;
  tipo_servicio: TipoServicio;
  marca_equipo: string | null;
  modelo_equipo: string | null;
}): string {
  const tipo = ETIQUETAS_TIPO_SERVICIO[input.tipo_servicio];
  const equipo = textoEquipoWhatsApp(input.marca_equipo, input.modelo_equipo);
  const nombre = input.nombre.trim() || "cliente";

  return `Hola ${nombre}, somos de Plaza Mayoreo del Celular. Recibimos tu solicitud de ${tipo} para tu ${equipo}. ¿Cuándo podemos atenderte? 😊`;
}

export function urlWhatsAppSolicitudServicio(input: {
  telefono: string;
  nombre: string;
  tipo_servicio: TipoServicio;
  marca_equipo: string | null;
  modelo_equipo: string | null;
}): string | null {
  const numero = telefonoParaWaMe(input.telefono);
  if (!numero) return null;

  const text = mensajeWhatsAppSolicitudServicio(input);
  return `https://wa.me/${numero}?text=${encodeURIComponent(text)}`;
}
