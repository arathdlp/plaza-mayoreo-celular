"use client";

import { distanciaMetros } from "@/lib/geo";
import { parseCoord } from "@/lib/google-maps";
import type { EnvioRow, EstadoEnvio } from "@/types/envio";

const notified = new Set<string>();

function key(event: string, envioId: number) {
  return `${event}-${envioId}`;
}

function once(event: string, envioId: number, fn: () => void) {
  const k = key(event, envioId);
  if (notified.has(k)) return;
  notified.add(k);
  fn();
}

export async function solicitarPermisoNotificaciones(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function notify(title: string, body: string) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png" });
  } catch {
    /* ignore */
  }
}

export function notificarCambioEnvio(
  prev: EnvioRow,
  next: EnvioRow,
  pedidoId: number,
): void {
  if (prev.estado !== next.estado) {
    if (next.estado === "en_camino") {
      once("en_camino", next.id, () =>
        notify(
          "Tu pedido va en camino",
          `El repartidor salió con tu pedido #${pedidoId}.`,
        ),
      );
    }
    if (next.estado === "llegando") {
      once("llegando", next.id, () =>
        notify(
          "Tu repartidor ya llegó",
          "Prepárate para recibir tu pedido.",
        ),
      );
    }
    if (next.estado === "entregado") {
      once("entregado", next.id, () =>
        notify("Pedido entregado", `Tu pedido #${pedidoId} fue entregado. ¡Gracias!`),
      );
    }
  }

  const lat = parseCoord(next.lat_actual);
  const lng = parseCoord(next.lng_actual);
  const dLat = parseCoord(next.destino_lat);
  const dLng = parseCoord(next.destino_lng);
  if (lat == null || lng == null || dLat == null || dLng == null) return;

  const m = distanciaMetros({ lat, lng }, { lat: dLat, lng: dLng });
  if (m < 500 && (next.estado === "en_camino" || next.estado === "llegando")) {
    once("cerca", next.id, () =>
      notify("Repartidor cerca", "Tu pedido está a menos de 500 m."),
    );
  }
}

export function etiquetaEstadoEnvio(estado: EstadoEnvio): string {
  const map: Record<EstadoEnvio, string> = {
    pendiente: "Pendiente",
    en_camino: "En camino",
    llegando: "Llegando",
    entregado: "Entregado",
  };
  return map[estado] ?? estado;
}
