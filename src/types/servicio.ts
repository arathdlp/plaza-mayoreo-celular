export const TIPOS_SERVICIO = ["reparacion", "desbloqueo", "instalacion", "asesoria"] as const;
export type TipoServicio = (typeof TIPOS_SERVICIO)[number];

export const ESTADOS_SOLICITUD = ["nueva", "en_proceso", "resuelta", "cancelada"] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export type SolicitudServicio = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  tipo_servicio: TipoServicio;
  marca_equipo: string | null;
  modelo_equipo: string | null;
  descripcion: string;
  estado: EstadoSolicitud;
  created_at: string;
};
