import { MORELIA_CENTER } from "@/lib/envio-labels";

export type LatLng = { lat: number; lng: number };

export function parseCoord(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

export function resolveDestino(envio: {
  destino_lat: number | string | null;
  destino_lng: number | string | null;
}): LatLng {
  const lat = parseCoord(envio.destino_lat);
  const lng = parseCoord(envio.destino_lng);
  if (lat != null && lng != null) return { lat, lng };
  return { ...MORELIA_CENTER };
}

export function coordsFromPosition(
  lat: number | string | null | undefined,
  lng: number | string | null | undefined,
): LatLng | null {
  const parsedLat = parseCoord(lat);
  const parsedLng = parseCoord(lng);
  if (parsedLat == null || parsedLng == null) return null;
  return { lat: parsedLat, lng: parsedLng };
}
