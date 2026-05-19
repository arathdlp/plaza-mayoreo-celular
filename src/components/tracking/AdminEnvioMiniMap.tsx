"use client";

import TrackingMap from "@/components/tracking/TrackingMap";
import { parseCoord, resolveDestino, type LatLng } from "@/lib/google-maps";
import type { EnvioRow } from "@/types/envio";
import { useMemo } from "react";

type Props = { envio: EnvioRow };

function coordsRepartidor(envio: EnvioRow): LatLng | null {
  const lat = parseCoord(envio.lat_actual);
  const lng = parseCoord(envio.lng_actual);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

export default function AdminEnvioMiniMap({ envio }: Props) {
  const destino = useMemo(() => resolveDestino(envio), [envio]);
  const repartidor = useMemo(() => coordsRepartidor(envio), [envio]);

  if (envio.estado === "entregado" && !repartidor) {
    return (
      <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        Entrega completada
      </p>
    );
  }

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
      <TrackingMap destino={destino} repartidor={repartidor} mini interactive={false} />
    </div>
  );
}
