"use client";

import DeliveryCelebration from "@/components/tracking/DeliveryCelebration";
import EnCaminoDots from "@/components/tracking/EnCaminoDots";
import TrackingMap from "@/components/tracking/TrackingMap";
import { mensajeClienteARepartidor, urlWhatsApp } from "@/lib/contact-links";
import {
  BADGE_ESTADO_ENVIO,
  ETIQUETAS_ESTADO_ENVIO,
  ETIQUETAS_TIPO_ENVIO,
  urlTrackingPaqueteria,
} from "@/lib/envio-labels";
import { mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { parseCoord, resolveDestino, type LatLng } from "@/lib/google-maps";
import { createClient } from "@/lib/supabase/client";
import { notificarCambioEnvio, solicitarPermisoNotificaciones } from "@/lib/tracking-push";
import type { EnvioRow, EstadoEnvio, TipoEnvio } from "@/types/envio";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  pedidoId: number;
  initialEnvio: EnvioRow;
  clienteNombre?: string;
  clienteTelefono?: string;
};

function coordsFromEnvio(envio: EnvioRow): LatLng | null {
  const lat = parseCoord(envio.lat_actual);
  const lng = parseCoord(envio.lng_actual);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

export default function TrackingView({
  pedidoId,
  initialEnvio,
  clienteNombre,
  clienteTelefono,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [envio, setEnvio] = useState(initialEnvio);
  const [segundosDesdeUpdate, setSegundosDesdeUpdate] = useState(0);
  const envioPrevRef = useRef(initialEnvio);

  const destino = useMemo(() => resolveDestino(envio), [envio]);
  const repartidor = useMemo(() => coordsFromEnvio(envio), [envio]);

  const estado = envio.estado as EstadoEnvio;
  const tipo = envio.tipo as TipoEnvio;
  const paqueteriaUrl = urlTrackingPaqueteria(envio.paqueteria_empresa, envio.numero_guia);
  const entregado = estado === "entregado";

  const telRepartidor = envio.repartidor_telefono
    ? `tel:${envio.repartidor_telefono.replace(/\s/g, "")}`
    : null;

  const waRepartidor = useMemo(() => {
    if (!envio.repartidor_telefono) return null;
    return urlWhatsApp(
      envio.repartidor_telefono,
      mensajeClienteARepartidor(clienteNombre ?? "cliente", pedidoId),
    );
  }, [envio.repartidor_telefono, clienteNombre, pedidoId]);

  useEffect(() => {
    void solicitarPermisoNotificaciones();
  }, []);

  useEffect(() => {
    const tick = () => {
      const t = new Date(envio.updated_at).getTime();
      setSegundosDesdeUpdate(Math.max(0, Math.floor((Date.now() - t) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [envio.updated_at]);

  useEffect(() => {
    notificarCambioEnvio(envioPrevRef.current, envio, pedidoId);
    envioPrevRef.current = envio;
  }, [envio, pedidoId]);

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
          const row = mapEnvioFromDb(payload.new as EnvioDbRow);
          setEnvio((prev) => ({
            ...row,
            direccion_destino: prev.direccion_destino,
          }));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [envio.id]);

  if (entregado) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <Link href="/pedidos" className="text-sm font-medium text-[#0066FF] hover:underline">
            ← Mis pedidos
          </Link>
        </header>
        <DeliveryCelebration />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0a0a0f]">
      <header className="z-10 border-b border-white/10 bg-[#0a0a0f]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <Link href="/pedidos" className="text-sm font-medium text-[#4d9fff] hover:underline">
          ← Mis pedidos
        </Link>
        <h1 className="mt-1 text-lg font-bold text-white">Pedido #{pedidoId}</h1>
      </header>

      <div className="relative flex-1 min-h-[45vh]">
        {tipo === "local" && repartidor ? (
          <div
            className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md ${
              segundosDesdeUpdate > 30
                ? "bg-amber-100 text-amber-900"
                : "bg-emerald-100 text-emerald-900"
            }`}
          >
            {segundosDesdeUpdate > 30
              ? "🟡 Conectando…"
              : `🟢 Última actualización: hace ${segundosDesdeUpdate}s`}
          </div>
        ) : null}
        {tipo === "local" ? (
          <TrackingMap
            destino={destino}
            repartidor={repartidor}
            repartidorPulsando={estado === "llegando"}
            className="absolute inset-0"
          />
        ) : (
          <div className="flex h-full min-h-[45vh] flex-col items-center justify-center bg-gradient-to-b from-[#0066FF]/20 to-[#0a0a0f] px-6 text-center">
            <p className="text-lg font-bold text-white">Envío por paquetería</p>
            <p className="mt-2 text-sm text-white/70">
              {envio.paqueteria_empresa} · Guía{" "}
              <span className="font-mono font-semibold text-white">{envio.numero_guia}</span>
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
        initial={reduceMotion ? false : { y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative z-10 -mt-6 rounded-t-3xl border border-white/10 bg-white px-4 pb-8 pt-6 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.45)] sm:px-6"
      >
        <div className="mx-auto max-w-lg">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" aria-hidden />

          <motion.div
            key={estado}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0066FF]/10 text-2xl">
              {tipo === "local" ? "🛵" : "📦"}
            </div>
            <div className="min-w-0 flex-1">
              {tipo === "local" && envio.repartidor_nombre ? (
                <p className="text-lg font-bold text-[#111827]">{envio.repartidor_nombre}</p>
              ) : (
                <p className="text-lg font-bold text-[#111827]">{ETIQUETAS_TIPO_ENVIO[tipo]}</p>
              )}
              {estado === "en_camino" || estado === "llegando" ? (
                <p className="mt-1">
                  <EnCaminoDots label={estado === "llegando" ? "Llegando" : "En camino"} />
                </p>
              ) : (
                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${BADGE_ESTADO_ENVIO[estado]}`}
                >
                  {ETIQUETAS_ESTADO_ENVIO[estado]}
                </span>
              )}
            </div>
          </motion.div>

          {envio.direccion_destino ? (
            <p className="mt-4 text-sm text-gray-600">
              <span className="font-medium text-gray-800">Entrega:</span> {envio.direccion_destino}
            </p>
          ) : null}

          {envio.tiempo_estimado_minutos && estado === "en_camino" ? (
            <p className="mt-3 rounded-xl bg-[#0066FF]/5 px-3 py-2 text-sm font-semibold text-[#0066FF]">
              Llegada estimada · ~{envio.tiempo_estimado_minutos} min
            </p>
          ) : null}

          {tipo === "local" ? (
            <motion.div className="mt-6 grid grid-cols-2 gap-3">
              {telRepartidor ? (
                <a
                  href={telRepartidor}
                  className="flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-[#111827] transition hover:bg-gray-100"
                >
                  Llamar
                </a>
              ) : null}
              {waRepartidor ? (
                <a
                  href={waRepartidor}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center rounded-2xl bg-[#25D366] text-sm font-semibold text-white shadow-md shadow-[#25D366]/25"
                >
                  WhatsApp
                </a>
              ) : null}
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
