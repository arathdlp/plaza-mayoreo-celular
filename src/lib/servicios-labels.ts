import type { EstadoSolicitud, TipoServicio } from "@/types/servicio";

export const ETIQUETAS_TIPO_SERVICIO: Record<TipoServicio, string> = {
  reparacion: "Reparaciones",
  desbloqueo: "Desbloqueos y liberaciones",
  instalacion: "Instalaciones a domicilio",
  asesoria: "Asesorías técnicas",
};

export const ETIQUETAS_ESTADO_SOLICITUD: Record<EstadoSolicitud, string> = {
  nueva: "Nueva",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
};

export const BADGE_ESTADO_SOLICITUD: Record<EstadoSolicitud, string> = {
  nueva: "border-sky-200 bg-sky-50 text-sky-800",
  en_proceso: "border-amber-200 bg-amber-50 text-amber-800",
  resuelta: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelada: "border-red-200 bg-red-50 text-red-800",
};
