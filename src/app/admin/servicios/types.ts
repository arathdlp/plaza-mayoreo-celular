import type { EstadoSolicitud, TipoServicio } from "@/types/servicio";

export type SolicitudAdminRow = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  tipo_servicio: TipoServicio;
  marca_equipo: string | null;
  modelo_equipo: string | null;
  estado: EstadoSolicitud;
  created_at: string;
};
