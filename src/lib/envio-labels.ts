import type { EstadoEnvio, TipoEnvio } from "@/types/envio";

export const MORELIA_CENTER = { lat: 19.7059, lng: -101.1949 } as const;

export const ETIQUETAS_ESTADO_ENVIO: Record<EstadoEnvio, string> = {
  pendiente: "Pendiente de salida",
  en_camino: "En camino",
  llegando: "Llegando",
  entregado: "Entregado",
};

export const BADGE_ESTADO_ENVIO: Record<EstadoEnvio, string> = {
  pendiente: "border-slate-200 bg-slate-100 text-slate-800",
  en_camino: "border-sky-200 bg-sky-50 text-sky-800",
  llegando: "border-amber-200 bg-amber-50 text-amber-800",
  entregado: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export const ETIQUETAS_TIPO_ENVIO: Record<TipoEnvio, string> = {
  local: "Entrega local",
  paqueteria: "Paquetería",
};

export function envioActivo(estado: EstadoEnvio): boolean {
  return estado === "pendiente" || estado === "en_camino" || estado === "llegando";
}

export function urlTrackingPaqueteria(empresa: string | null, guia: string | null): string | null {
  if (!empresa?.trim() || !guia?.trim()) return null;
  const e = empresa.toLowerCase();
  const g = encodeURIComponent(guia.trim());
  if (e.includes("dhl")) {
    return `https://www.dhl.com/mx-es/home/tracking/tracking-express.html?submit=1&tracking-id=${g}`;
  }
  if (e.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${g}`;
  }
  if (e.includes("estafeta")) {
    return `https://www.estafeta.com/rastrear-envio`;
  }
  return null;
}

export function linkRepartidor(envioId: number, token: string, baseUrl?: string): string {
  const origin =
    baseUrl?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "https://plaza-mayoreo-celular.vercel.app");
  return `${origin}/repartidor/${envioId}?token=${encodeURIComponent(token)}`;
}
