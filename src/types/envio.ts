export const TIPOS_ENVIO = ["local", "paqueteria"] as const;
export type TipoEnvio = (typeof TIPOS_ENVIO)[number];

export const ESTADOS_ENVIO = ["pendiente", "en_camino", "llegando", "entregado"] as const;

export const REPARTIDOR_GPS_INTERVAL_MS = 5_000;
export type EstadoEnvio = (typeof ESTADOS_ENVIO)[number];

export type EnvioRow = {
  id: number;
  pedido_id: number;
  tipo: TipoEnvio;
  estado: EstadoEnvio;
  lat_actual: number | null;
  lng_actual: number | null;
  destino_lat: number | null;
  destino_lng: number | null;
  direccion_destino: string | null;
  repartidor_nombre: string | null;
  repartidor_telefono: string | null;
  paqueteria_empresa: string | null;
  numero_guia: string | null;
  repartidor_token: string;
  tiempo_estimado_minutos: number | null;
  updated_at: string;
  repartidor_id?: string | null;
};
