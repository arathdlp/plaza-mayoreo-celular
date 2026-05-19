"use client";

import TrackingMap from "@/components/tracking/TrackingMap";
import {
  BADGE_ESTADO_ENVIO,
  ETIQUETAS_ESTADO_ENVIO,
  ETIQUETAS_TIPO_ENVIO,
  urlTrackingPaqueteria,
} from "@/lib/envio-labels";
import { parseCoord, resolveDestino, type LatLng } from "@/lib/google-maps";
import { createClient } from "@/lib/supabase/client";
import type { EnvioRow, EstadoEnvio, TipoEnvio } from "@/types/envio";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  pedidoId: number;
  initialEnvio: EnvioRow;
};

function coordsFromEnvio(envio: EnvioRow): LatLng | null {
  const lat = parseCoord(envio.lat_actual);
  const lng = parseCoord(envio.lng_actual);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

export default function TrackingView({ pedidoId, initialEnvio }: Props) {
  const reduceMotion = useReducedMotion();
  const [envio, setEnvio] = useState(initialEnvio);

  const destino = useMemo(() => resolveDestino(envio), [envio]);
  const repartidor = useMemo(() => coordsFromEnvio(envio), [envio]);

  const estado = envio.estado as EstadoEnvio;
  const tipo = envio.tipo as TipoEnvio;
  const paqueteriaUrl = urlTrackingPaqueteria(envio.paqueteria_empresa, envio.numero_guia);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`envio-track-${envio.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "envios",
          filter: `id=eq.${envio.id}`,
        },
        (payload) => {
          const row = payload.new as EnvioRow;
          setEnvio((prev) => ({ ...prev, ...row }));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [envio.id]);

  const telHref = envio.repartidor_telefono
    ? `tel:${envio.repartidor_telefono.replace(/\s/g, "")}`
    : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <Link href="/pedidos" className="text-sm font-medium text-[#0066FF] hover:underline">
          ← Mis pedidos
        </Link>
        <h1 className="mt-2 text-xl font-bold text-[#111827]">Rastreo · Pedido #{pedidoId}</h1>
      </header>

      <div className="relative flex-1 min-h-[40vh]">
        {tipo === "local" ? (
          <TrackingMap destino={destino} repartidor={repartidor} className="absolute inset-0" />
        ) : (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center bg-gradient-to-b from-[#0066FF]/10 to-white px-6 text-center">
            <p className="text-lg font-bold text-[#111827]">Envío por paquetería</p>
            <p className="mt-2 text-sm text-gray-600">
              {envio.paqueteria_empresa} · Guía{" "}
              <span className="font-mono font-semibold">{envio.numero_guia}</span>
            </p>
            {paqueteriaUrl ? (
              <a
                href={paqueteriaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-full bg-[#0066FF] px-6 py-3 text-sm font-semibold text-white"
              >
                Rastrear en {envio.paqueteria_empresa}
              </a>
            ) : null}
          </div>
        )}
      </div>

      <motion.div
        initial={reduceMotion ? false : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-t border-gray-200 bg-white px-4 py-6 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)] sm:px-6"
      >
        <div className="mx-auto max-w-lg">
          <motion.div
            key={estado}
            initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${BADGE_ESTADO_ENVIO[estado]}`}
            >
              {ETIQUETAS_ESTADO_ENVIO[estado]}
            </span>
            <span className="text-xs text-gray-500">{ETIQUETAS_TIPO_ENVIO[tipo]}</span>
          </motion.div>

          {tipo === "local" && envio.repartidor_nombre ? (
            <p className="mt-4 text-base font-semibold text-[#111827]">
              Repartidor: {envio.repartidor_nombre}
            </p>
          ) : null}

          {envio.direccion_destino ? (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-gray-800">Entrega:</span> {envio.direccion_destino}
            </p>
          ) : null}

          {envio.tiempo_estimado_minutos && estado === "en_camino" ? (
            <p className="mt-3 text-sm font-medium text-[#0066FF]">
              Tiempo estimado: ~{envio.tiempo_estimado_minutos} min
            </p>
          ) : null}

          {tipo === "local" && telHref ? (
            <a
              href={telHref}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#0066FF] text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/20"
            >
              Llamar al repartidor
            </a>
          ) : null}

          {tipo === "paqueteria" && envio.numero_guia ? (
            <p className="mt-4 text-sm text-gray-600">
              Número de guía:{" "}
              <span className="font-mono font-semibold text-[#111827]">{envio.numero_guia}</span>
            </p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
