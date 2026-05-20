import type { LatLng } from "@/lib/coords";

export type RouteStepInfo = {
  instruction: string;
  distanceText: string;
  durationText: string;
  distanceValue: number;
  durationValue: number;
  maneuver?: string;
  endLocation?: LatLng;
};

export type NavigationStats = {
  distanceText: string;
  durationText: string;
  distanceValue: number;
  durationValue: number;
  speedKmh: number;
  currentStep?: RouteStepInfo;
  routeError?: string | null;
  stepIndex?: number;
  stepCount?: number;
};

export function directionsErrorMessage(status: string): string {
  if (status === "ROUTES_API_FORBIDDEN") {
    return "Google Routes API no está habilitada. Actívala en Google Cloud Console.";
  }
  if (status === "ZERO_RESULTS") {
    return "No se pudo calcular la ruta. Verificar dirección del cliente.";
  }
  if (status === "OVER_QUERY_LIMIT" || status === "REQUEST_DENIED") {
    return "Google Maps Directions API no está habilitada. Actívala en Google Cloud Console.";
  }
  if (status === "NOT_FOUND") {
    return "Origen o destino no encontrado. Revisa la dirección del cliente.";
  }
  return `No se pudo calcular la ruta (${status}).`;
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const r = 6_371_000;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function bearingDegrees(from: LatLng, to: LatLng): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const toDeg = (n: number) => (n * 180) / Math.PI;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "0 m";
  if (meters < 1000) return `${Math.max(0, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

export function formatDuration(seconds: number): string {
  const min = Math.max(1, Math.round(seconds / 60));
  return `${min} min`;
}

export function cleanInstruction(html: string): string {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, "");
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent?.replace(/\s+/g, " ").trim() || "Continúa por la ruta";
}

export function maneuverLabel(maneuver?: string): string {
  const normalized = maneuver?.toLowerCase() ?? "";
  if (!normalized) return "Continúa";
  if (normalized.includes("left")) return "Gira a la izquierda";
  if (normalized.includes("right")) return "Gira a la derecha";
  if (normalized.includes("roundabout")) return "Toma la glorieta";
  if (normalized.includes("merge")) return "Incorpórate";
  if (normalized.includes("straight")) return "Sigue derecho";
  return "Continúa";
}
