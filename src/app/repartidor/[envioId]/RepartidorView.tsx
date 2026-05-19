"use client";

import { ETIQUETAS_ESTADO_ENVIO } from "@/lib/envio-labels";
import type { EstadoEnvio } from "@/types/envio";
import { motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type EnvioData = {
  id: number;
  pedido_id: number;
  tipo: string;
  estado: EstadoEnvio;
  direccion_destino: string | null;
  repartidor_nombre: string | null;
};

const INTERVAL_MS = 15_000;

export default function RepartidorView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const envioId = params.envioId as string;
  const token = searchParams.get("token") ?? "";

  const [envio, setEnvio] = useState<EnvioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsOk, setGpsOk] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const fetchEnvio = useCallback(async () => {
    const res = await fetch(`/api/repartidor/${envioId}?token=${encodeURIComponent(token)}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "No se pudo cargar el envío.");
      setEnvio(null);
      return;
    }
    setEnvio(json.envio);
    setError(null);
  }, [envioId, token]);

  useEffect(() => {
    if (!token) {
      setError("Falta el token en el enlace.");
      setLoading(false);
      return;
    }
    void fetchEnvio().finally(() => setLoading(false));
  }, [fetchEnvio, token]);

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

  useEffect(() => {
    if (envio?.estado === "en_camino") {
      startTracking();
      return stopTracking;
    }
    stopTracking();
    return stopTracking;
  }, [envio?.estado, startTracking, stopTracking]);

  async function patchEstado(estado: EstadoEnvio) {
    setBusy(true);
    const coords = lastPosRef.current;
    const res = await fetch(`/api/repartidor/${envioId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        estado,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "No se pudo actualizar.");
      return;
    }
    await fetchEnvio();
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

  if (error && !envio) {
    return (
      <motion.div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
        <p className="text-xl font-bold text-red-400">Enlace no válido</p>
        <p className="mt-3 text-sm text-white/70">{error}</p>
      </motion.div>
    );
  }

  if (!envio) return null;

  const estado = envio.estado;
  const entregado = estado === "entregado";

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] px-4 py-8 text-white sm:px-6">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0066FF]">Repartidor</p>
        <h1 className="mt-2 text-2xl font-bold">Pedido #{envio.pedido_id}</h1>
        <p className="mt-1 text-sm text-white/60">Envío #{envio.id}</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mx-auto mt-8 max-w-lg space-y-6"
      >
        <motion.div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Estado</p>
          <p className="mt-2 text-2xl font-bold text-[#4d9fff]">
            {ETIQUETAS_ESTADO_ENVIO[estado]}
          </p>
          {envio.direccion_destino ? (
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              <span className="font-semibold text-white">Destino:</span> {envio.direccion_destino}
            </p>
          ) : null}
        </motion.div>

        <motion.div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          <p className="font-semibold text-white/90">GPS</p>
          <p className="mt-1 text-white/60">
            {gpsOk === null
              ? "Comprobando permisos…"
              : gpsOk
                ? "Ubicación activa · enviando cada 15 s"
                : "Permite el acceso a ubicación en tu navegador"}
          </p>
        </motion.div>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 pt-2">
          {estado === "pendiente" ? (
            <button
              type="button"
              disabled={busy || entregado}
              onClick={() => void iniciarEntrega()}
              className="flex min-h-[56px] items-center justify-center rounded-2xl bg-[#0066FF] text-lg font-bold shadow-lg shadow-[#0066FF]/30 transition active:scale-[0.98] disabled:opacity-50"
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
              className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 py-8 text-center"
            >
              <p className="text-3xl" aria-hidden>
                ✓
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-300">¡Entrega completada!</p>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
