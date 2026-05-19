import type { EnvioRow, EstadoEnvio, TipoEnvio } from "@/types/envio";

/** Columnas reales de public.envios en Supabase. */
const ENVIOS_DB_COLUMNS_ARR = [
  "id",
  "pedido_id",
  "lat_actual",
  "lng_actual",
  "estado",
  "updated_at",
  "token",
  "destino_lat",
  "destino_lng",
  "tiempo_estimado",
  "repartidor_nombre",
  "repartidor_telefono",
  "numero_guia",
  "paqueteria",
  "tipo",
  "created_at",
] as const;

export const ENVIOS_DB_COLUMNS = ENVIOS_DB_COLUMNS_ARR.join(", ");

/** Literal para .select() con tipos correctos en Supabase. */
export const ENVIOS_DB_SELECT =
  "id, pedido_id, lat_actual, lng_actual, estado, updated_at, token, destino_lat, destino_lng, tiempo_estimado, repartidor_nombre, repartidor_telefono, numero_guia, paqueteria, tipo, created_at" as const;

export type EnvioDbRow = {
  id: number;
  pedido_id: number;
  lat_actual: number | null;
  lng_actual: number | null;
  estado: EstadoEnvio;
  updated_at: string;
  token: string;
  destino_lat: number | null;
  destino_lng: number | null;
  tiempo_estimado: number | null;
  repartidor_nombre: string | null;
  repartidor_telefono: string | null;
  numero_guia: string | null;
  paqueteria: string | null;
  tipo: TipoEnvio;
  created_at: string;
};

export function mapEnvioFromDb(
  row: EnvioDbRow,
  options?: { direccionEntrega?: string | null },
): EnvioRow {
  const direccion = options?.direccionEntrega?.trim();
  return {
    id: row.id,
    pedido_id: row.pedido_id,
    tipo: row.tipo,
    estado: row.estado,
    lat_actual: row.lat_actual,
    lng_actual: row.lng_actual,
    destino_lat: row.destino_lat,
    destino_lng: row.destino_lng,
    direccion_destino: direccion || null,
    repartidor_nombre: row.repartidor_nombre,
    repartidor_telefono: row.repartidor_telefono,
    paqueteria_empresa: row.paqueteria,
    numero_guia: row.numero_guia,
    repartidor_token: row.token,
    tiempo_estimado_minutos: row.tiempo_estimado,
    updated_at: row.updated_at,
  };
}
