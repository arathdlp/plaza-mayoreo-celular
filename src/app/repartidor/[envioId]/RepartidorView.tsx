"use client";

import {
  mensajeWhatsAppEnCamino,
  mensajeWhatsAppEntregado,
  urlGoogleMapsDestino,
  urlWhatsApp,
} from "@/lib/contact-links";
import { ETIQUETAS_ESTADO_ENVIO } from "@/lib/envio-labels";
import { formatoPesos } from "@/lib/format";
import { parseCoord } from "@/lib/google-maps";
import type { RepartidorContext } from "@/types/repartidor";
import type { EstadoEnvio } from "@/types/envio";
import { motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INTERVAL_MS = 15_000;

function etiquetaMetodo(m: string | null): string {
  if (m === "mercado_pago") return "Mercado Pago";
  return "Pagar al recibir";
}

export default function RepartidorView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const envioId = params.envioId as string;
  const token = searchParams.get("token") ?? "";

  const [ctx, setCtx] = useState<RepartidorContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsOk, setGpsOk] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const fetchCtx = useCallback(async () => {
    const res = await fetch(`/api/repartidor/${envioId}?token=${encodeURIComponent(token)}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "No se pudo cargar el envío.");
      setCtx(null);
      return;
    }
    setCtx(json as RepartidorContext);
    setError(null);
  }, [envioId, token]);

  useEffect(() => {
    if (!token) {
      setError("Falta el token en el enlace.");
      setLoading(false);
      return;
    }
    void fetchCtx().finally(() => setLoading(false));
  }, [fetchCtx, token]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsOk(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setGpsOk(true),
      () => setGpsOk(false),
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }, []);

  const sendUbicacion = useCallback(
    async (lat: number, lng: number) => {
      await fetch(`/api/repartidor/${envioId}/ubicacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, lat, lng }),
      });
    },
    [envioId, token],
  );

  const stopTracking = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const tick = () => {
      const pos = lastPosRef.current;
      if (pos) void sendUbicacion(pos.lat, pos.lng);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        lastPosRef.current = { lat: p.coords.latitude, lng: p.coords.longitude };
        setGpsOk(true);
      },
      () => setGpsOk(false),
      { enableHighAccuracy: true, maximumAge: 5_000 },
    );

    intervalRef.current = setInterval(tick, INTERVAL_MS);
    tick();
  }, [sendUbicacion]);

  const envio = ctx?.envio;

  useEffect(() => {
    if (envio?.estado === "en_camino") {
      startTracking();
      return stopTracking;
    }
    stopTracking();
    return stopTracking;
  }, [envio?.estado, startTracking, stopTracking]);

  const mapsUrl = useMemo(() => {
    if (!ctx) return null;
    const lat = parseCoord(ctx.envio.destino_lat);
    const lng = parseCoord(ctx.envio.destino_lng);
    return urlGoogleMapsDestino(lat, lng, ctx.pedido.direccion_entrega);
  }, [ctx]);

  const waCliente = useMemo(() => {
    if (!ctx?.cliente.telefono) return null;
    return urlWhatsApp(
      ctx.cliente.telefono,
      mensajeWhatsAppEnCamino(ctx.cliente.nombre, ctx.pedido.id),
    );
  }, [ctx]);

  async function patchEstado(estadoNuevo: EstadoEnvio) {
    setBusy(true);
    const coords = lastPosRef.current;
    const res = await fetch(`/api/repartidor/${envioId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        estado: estadoNuevo,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "No se pudo actualizar.");
      return;
    }
    if (estadoNuevo === "entregado" && json.whatsappEntregado) {
      window.open(json.whatsappEntregado as string, "_blank", "noopener,noreferrer");
    }
    await fetchCtx();
  }

  async function iniciarEntrega() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta GPS.");
      return;
    }
    setBusy(true);
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (p) => {
          lastPosRef.current = { lat: p.coords.latitude, lng: p.coords.longitude };
          setGpsOk(true);
          await patchEstado("en_camino");
          resolve();
        },
        () => {
          setError("Activa el permiso de ubicación para iniciar.");
          setGpsOk(false);
          setBusy(false);
          resolve();
        },
        { enableHighAccuracy: true },
      );
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0f] text-white">
        <p className="text-lg">Cargando envío…</p>
      </div>
    );
  }

  if (error && !ctx) {
    return (
      <motion.div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
        <p className="text-xl font-bold text-red-400">Enlace no válido</p>
        <p className="mt-3 text-sm text-white/70">{error}</p>
      </motion.div>
    );
  }

  if (!ctx || !envio) return null;

  const estado = envio.estado;
  const entregado = estado === "entregado";
  const waEntregado = urlWhatsApp(
    ctx.cliente.telefono,
    mensajeWhatsAppEntregado(ctx.pedido.id),
  );

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] pb-10 text-white">
      <div className="mx-auto max-w-lg px-4 pt-6 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4d9fff]">Repartidor</p>
        <h1 className="mt-2 text-2xl font-bold">Pedido #{ctx.pedido.id}</h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-3"
        >
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0066FF] text-lg font-bold shadow-lg shadow-[#0066FF]/35 transition active:scale-[0.98]"
            >
              <span aria-hidden>🗺️</span> Abrir en Google Maps
            </a>
          ) : null}

          {waCliente ? (
            <a
              href={waCliente}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-lg font-bold shadow-lg shadow-[#25D366]/30 transition active:scale-[0.98]"
            >
              <span aria-hidden>💬</span> WhatsApp al cliente
            </a>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mt-8 space-y-4"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Estado</p>
            <p className="mt-2 text-2xl font-bold text-[#4d9fff]">
              {ETIQUETAS_ESTADO_ENVIO[estado]}
            </p>
            <p className="mt-4 text-sm text-white/75">
              <span className="font-semibold text-white">Cliente:</span> {ctx.cliente.nombre}
              {ctx.cliente.telefono ? ` · ${ctx.cliente.telefono}` : ""}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              <span className="font-semibold text-white">Dirección:</span>{" "}
              {ctx.pedido.direccion_entrega}
            </p>
            <p className="mt-2 text-sm text-white/60">
              Pago: {etiquetaMetodo(ctx.pedido.metodo_pago)} · Total{" "}
              <span className="font-semibold text-white">{formatoPesos(ctx.pedido.total)}</span>
            </p>
          </div>

          <motion.div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Productos</p>
            <ul className="mt-3 divide-y divide-white/10">
              {ctx.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3 py-2.5 text-sm first:pt-0">
                  <span className="text-white/90">
                    {it.cantidad}× {it.nombre}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-white">
                    {formatoPesos(it.precio_unitario * it.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="font-semibold text-white/90">GPS</p>
            <p className="mt-1 text-white/60">
              {gpsOk === null
                ? "Comprobando permisos…"
                : gpsOk
                  ? "Ubicación activa · enviando cada 15 s"
                  : "Permite el acceso a ubicación en tu navegador"}
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 pt-2">
            {estado === "pendiente" ? (
              <button
                type="button"
                disabled={busy || entregado}
                onClick={() => void iniciarEntrega()}
                className="flex min-h-[56px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-bold transition active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "Iniciando…" : "Iniciar entrega"}
              </button>
            ) : null}

            {estado === "en_camino" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void patchEstado("entregado")}
                className="flex min-h-[56px] items-center justify-center rounded-2xl bg-emerald-500 text-lg font-bold shadow-lg shadow-emerald-500/25 transition active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "Guardando…" : "Marcar como entregado"}
              </button>
            ) : null}

            {entregado ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <motion.div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 py-8 text-center">
                  <p className="text-3xl" aria-hidden>
                    ✓
                  </p>
                  <p className="mt-2 text-lg font-bold text-emerald-300">¡Entrega completada!</p>
                </motion.div>
                {waEntregado ? (
                  <a
                    href={waEntregado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[52px] items-center justify-center rounded-2xl bg-[#25D366] font-bold"
                  >
                    Avisar al cliente por WhatsApp
                  </a>
                ) : null}
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
