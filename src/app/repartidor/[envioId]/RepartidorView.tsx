"use client";

import { mensajeWhatsAppEnCamino, mensajeWhatsAppEntregado, urlWhatsApp } from "@/lib/contact-links";
import NavigationMap from "@/components/tracking/NavigationMap";
import PagoBadges from "@/components/pedidos/PagoBadges";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ETIQUETAS_ESTADO_ENVIO } from "@/lib/envio-labels";
import { formatoPesos } from "@/lib/format";
import { parseCoord, resolveDestino, type LatLng } from "@/lib/google-maps";
import { distanceMeters, maneuverLabel, type NavigationStats } from "@/lib/tracking-navigation";
import type { RepartidorContext } from "@/types/repartidor";
import type { EstadoEnvio } from "@/types/envio";
import ProductoImagen from "@/components/ProductoImagen";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bike,
  Clock,
  Gauge,
  MapPin,
  MessageCircle,
  Phone,
  Signal,
  Volume2,
  VolumeX,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { REPARTIDOR_GPS_INTERVAL_MS } from "@/types/envio";

const INTERVAL_MS = REPARTIDOR_GPS_INTERVAL_MS;
const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10_000,
};

type GpsPermission = "pending" | "granted" | "denied";

function pendingPosKey(envioId: string) {
  return `pmc_pending_pos_${envioId}`;
}

function savePendingPosition(envioId: string, lat: number, lng: number) {
  try {
    localStorage.setItem(pendingPosKey(envioId), JSON.stringify({ lat, lng, t: Date.now() }));
  } catch {
    /* quota */
  }
}

function etiquetaMetodo(m: string | null): string {
  if (m === "mercado_pago") return "Mercado Pago";
  return "Pagar al recibir";
}

function GpsBlockedScreen() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <MapPin className="h-12 w-12 text-[#0066FF]" />
      <h1 className="mt-4 text-xl font-semibold text-[#111827]">Activa tu ubicación</h1>
      <p className="mt-3 max-w-md text-sm text-gray-600">
        La app del repartidor necesita GPS para navegar y enviar tu posición al cliente. En Chrome o Safari,
        abre el candado de la barra de dirección, permite Ubicación y recarga esta página.
      </p>
      <p className="mt-4 text-xs text-gray-500">
        En iPhone: Ajustes del sitio → Ubicación → Permitir. En Android Chrome: Permisos → Ubicación.
      </p>
    </div>
  );
}

function DirectionIcon({ maneuver }: { maneuver?: string }) {
  if (maneuver?.includes("left")) return <ArrowLeft className="h-6 w-6" />;
  if (maneuver?.includes("right")) return <ArrowRight className="h-6 w-6" />;
  return <ArrowUp className="h-6 w-6" />;
}

export default function RepartidorView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const envioId = params.envioId as string;
  const token = searchParams.get("token") ?? "";

  const [ctx, setCtx] = useState<RepartidorContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsPermission, setGpsPermission] = useState<GpsPermission>("pending");
  const [busy, setBusy] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [stats, setStats] = useState<NavigationStats | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastPosTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const ctxRef = useRef<RepartidorContext | null>(null);
  const trackingStartedRef = useRef(false);

  const authBody = useCallback(
    () => (token ? { token } : {}),
    [token],
  );

  const fetchCtx = useCallback(async () => {
    const url = token
      ? `/api/repartidor/${envioId}?token=${encodeURIComponent(token)}`
      : `/api/repartidor/${envioId}`;
    const res = await fetch(url, { credentials: "include" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "No se pudo cargar el envío.");
      setCtx(null);
      return;
    }
    const data = json as RepartidorContext;
    setCtx(data);
    ctxRef.current = data;
    setError(null);
  }, [envioId, token]);

  useEffect(() => {
    void fetchCtx().finally(() => setLoading(false));
  }, [fetchCtx]);

  const sendUbicacion = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/repartidor/${envioId}/ubicacion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...authBody(), lat, lng }),
        });
        if (!res.ok) throw new Error("upload failed");
        savePendingPosition(envioId, lat, lng);
      } catch {
        savePendingPosition(envioId, lat, lng);
        console.warn("[REPARTIDOR] No se pudo enviar ubicación, guardada localmente");
      }
    },
    [authBody, envioId],
  );

  const applyPosition = useCallback(
    (p: GeolocationPosition) => {
      const next = { lat: p.coords.latitude, lng: p.coords.longitude };
      const previous = lastPosRef.current;
      const previousTime = lastPosTimeRef.current;
      const now = p.timestamp || Date.now();
      if (typeof p.coords.speed === "number" && Number.isFinite(p.coords.speed)) {
        setSpeedKmh(Math.max(0, p.coords.speed * 3.6));
      } else if (previous && previousTime && now > previousTime) {
        const meters = distanceMeters(previous, next);
        const seconds = (now - previousTime) / 1000;
        const kmh = seconds > 0 ? (meters * 3.6) / seconds : 0;
        setSpeedKmh(Math.max(0, Math.min(120, kmh)));
      }
      lastPosRef.current = next;
      lastPosTimeRef.current = now;
      setCurrentPosition(next);
      if (ctxRef.current) void sendUbicacion(next.lat, next.lng);
    },
    [sendUbicacion],
  );

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || trackingStartedRef.current) return;
    trackingStartedRef.current = true;

    const tick = () => {
      const pos = lastPosRef.current;
      if (pos) void sendUbicacion(pos.lat, pos.lng);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        applyPosition(p);
      },
      (err) => {
        console.warn("[REPARTIDOR] watchPosition error", err);
        setGpsPermission("denied");
      },
      GEO_OPTIONS,
    );

    intervalRef.current = setInterval(tick, INTERVAL_MS);
    tick();
    console.log("[REPARTIDOR] watchPosition activo");
  }, [applyPosition, sendUbicacion]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsPermission("denied");
      return;
    }
    console.log("[REPARTIDOR] Solicitando permiso de geolocalización");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        console.log("[REPARTIDOR] Primera posición obtenida");
        applyPosition(p);
        setGpsPermission("granted");
        startTracking();
      },
      (err) => {
        console.warn("[REPARTIDOR] Geolocalización denegada", err);
        setGpsPermission("denied");
      },
      GEO_OPTIONS,
    );
  }, [applyPosition, startTracking]);

  useEffect(() => {
    const stored = window.localStorage.getItem("pmc_repartidor_voice");
    setVoiceEnabled(stored === "1");
  }, []);

  function toggleVoice() {
    setVoiceEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem("pmc_repartidor_voice", next ? "1" : "0");
      return next;
    });
  }

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      /* ignorar */
    }
    wakeLockRef.current = null;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      /* permiso denegado o no soportado */
    }
  }, []);

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

  const envio = ctx?.envio;

  useEffect(() => {
    if (ctx) ctxRef.current = ctx;
  }, [ctx]);

  useEffect(() => {
    const flushPending = () => {
      try {
        const raw = localStorage.getItem(pendingPosKey(envioId));
        if (!raw) return;
        const parsed = JSON.parse(raw) as { lat: number; lng: number };
        if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
          void sendUbicacion(parsed.lat, parsed.lng);
        }
      } catch {
        /* ignore */
      }
    };
    flushPending();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        flushPending();
        if (envio?.estado === "en_camino" || envio?.estado === "llegando") {
          void requestWakeLock();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [envio?.estado, envioId, requestWakeLock, sendUbicacion]);

  useEffect(() => {
    if (envio?.estado === "en_camino" || envio?.estado === "llegando") {
      void requestWakeLock();
    } else {
      void releaseWakeLock();
    }
  }, [envio?.estado, releaseWakeLock, requestWakeLock]);

  useEffect(() => {
    return () => {
      stopTracking();
      void releaseWakeLock();
    };
  }, [releaseWakeLock, stopTracking]);

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
      credentials: "include",
      body: JSON.stringify({
        ...authBody(),
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
    if (estadoNuevo === "entregado") {
      await releaseWakeLock();
      if (json.whatsappEntregado) {
        window.open(json.whatsappEntregado as string, "_blank", "noopener,noreferrer");
      }
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
          const next = { lat: p.coords.latitude, lng: p.coords.longitude };
          lastPosRef.current = next;
          lastPosTimeRef.current = p.timestamp || Date.now();
          setCurrentPosition(next);
          await requestWakeLock();
          await patchEstado("en_camino");
          resolve();
        },
        () => {
          setError("Activa el permiso de ubicación para iniciar.");
          setGpsPermission("denied");
          setBusy(false);
          resolve();
        },
        GEO_OPTIONS,
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
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
        <p className="text-xl font-bold text-red-400">
          {error.includes("acceso") ? "Sin acceso" : "Enlace no válido"}
        </p>
        <p className="mt-3 text-sm text-white/70">{error}</p>
        {!token ? (
          <a
            href="/repartidor/login"
            className="mt-6 rounded-2xl bg-[#0066FF] px-6 py-3 text-sm font-bold"
          >
            Iniciar sesión
          </a>
        ) : null}
      </div>
    );
  }

  if (gpsPermission === "denied") {
    return <GpsBlockedScreen />;
  }

  if (!ctx || !envio) return null;

  const estado = envio.estado;
  const entregado = estado === "entregado";
  const trackingActivo = estado === "en_camino" || estado === "llegando";
  const showWakeBanner = gpsPermission === "granted";
  const destino = resolveDestino(envio);
  const activePosition = currentPosition ?? lastPosRef.current;
  const navigationPosition =
    gpsPermission === "granted" && activePosition
      ? { lat: activePosition.lat, lng: activePosition.lng }
      : null;
  const step = stats?.currentStep;
  const routeHint = stats?.routeError ?? (gpsPermission === "pending" ? "Obteniendo tu ubicación…" : null);
  const actionLabel =
    estado === "pendiente"
      ? "Iniciar entrega"
      : trackingActivo
        ? "Marcar como entregado"
        : entregado
          ? "Entrega completada"
          : "Actualizar entrega";
  const waEntregado = urlWhatsApp(
    ctx.cliente.telefono,
    mensajeWhatsAppEntregado(ctx.pedido.id),
  );

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-28 text-[#111827]">
      {showWakeBanner ? (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          <Signal className="h-4 w-4" />
          Mantén esta pestaña abierta durante la entrega
        </div>
      ) : null}
      <header className={`sticky z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur ${showWakeBanner ? "top-9" : "top-0"}`}>
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{ctx.cliente.nombre}</p>
            <p className="truncate text-xs text-gray-500">{ctx.pedido.direccion_entrega}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {ctx.cliente.telefono ? (
              <a
                href={`tel:${ctx.cliente.telefono.replace(/\s/g, "")}`}
                aria-label="Llamar al cliente"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700"
              >
                <Phone className="h-5 w-5" />
              </a>
            ) : null}
            {waCliente ? (
              <a
                href={waCliente}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Enviar mensaje al cliente"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0066FF] text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={voiceEnabled ? "Desactivar voz" : "Activar voz"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700"
            >
              {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl">
        <section className="h-[60vh] min-h-[420px] overflow-hidden border-b border-gray-200 bg-gray-100">
          {navigationPosition ? (
            <NavigationMap
              current={navigationPosition}
              destination={destino}
              destinationAddress={ctx.pedido.direccion_entrega}
              marker="navigation"
              followCurrent
              voiceEnabled={voiceEnabled}
              speedKmh={speedKmh}
              onStats={setStats}
              className="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
              {gpsPermission === "pending"
                ? "Esperando permiso de ubicación…"
                : "Activa el permiso de ubicación para iniciar la navegación integrada."}
            </div>
          )}
        </section>

        <section className="-mt-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 rounded-t-3xl border border-gray-200 bg-white p-5 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.2)]"
          >
            <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-gray-200" />
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0066FF]/10 text-[#0066FF]">
                <DirectionIcon maneuver={step?.maneuver} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  {maneuverLabel(step?.maneuver)}
                </p>
                <p className="mt-1 text-lg font-medium leading-snug">
                  {step?.instruction ?? routeHint ?? "Calculando ruta…"}
                </p>
              </div>
            </div>

            {stats?.routeError ? (
              <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {stats.routeError}
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl bg-gray-50 p-3">
                <MapPin className="h-4 w-4 text-[#0066FF]" />
                <p className="mt-1 font-semibold">{stats?.distanceText ?? "Ruta"}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <Clock className="h-4 w-4 text-[#0066FF]" />
                <p className="mt-1 font-semibold">
                  {stats ? <NumberTicker value={Math.max(1, Math.round(stats.durationValue / 60))} suffix=" min" /> : "Calculando"}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3">
                <Gauge className="h-4 w-4 text-[#0066FF]" />
                <p className="mt-1 font-semibold">{Math.round(speedKmh)} km/h</p>
              </div>
            </div>

          </motion.div>
        </section>

        <section className="px-4 pt-4">
          <button
            type="button"
            onClick={() => setSheetOpen((v) => !v)}
            className="w-full rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-gray-200" />
            <span className="flex items-center justify-between text-left">
              <span>
                <span className="block font-medium">Pedido #{ctx.pedido.id}</span>
                <span className="text-sm text-gray-500">{ETIQUETAS_ESTADO_ENVIO[estado]}</span>
              </span>
              <span className="text-lg font-semibold">{formatoPesos(ctx.pedido.total)}</span>
            </span>
          </button>

          {sheetOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              {ctx.pedido.metodo_pago === "contra_entrega" && !entregado ? (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <Wallet className="h-5 w-5 shrink-0" />
                  <p className="font-medium">Cobrar {formatoPesos(ctx.pedido.total)} en efectivo</p>
                </div>
              ) : null}
              <PagoBadges metodoPago={ctx.pedido.metodo_pago} estadoPago={ctx.pedido.estado_pago} />
              <ul className="mt-4 space-y-3">
                {ctx.items.map((it, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-gray-50 p-2">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                      {it.imagen_url ? (
                        <Image src={it.imagen_url} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <ProductoImagen
                          categoria="Accesorio"
                          marca=""
                          nombre={it.nombre}
                          variant="card"
                          className="absolute inset-0 scale-150"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {it.cantidad} x {it.nombre}
                      </p>
                      <p className="text-xs tabular-nums text-gray-500">
                        {formatoPesos(it.precio_unitario * it.cantidad)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-2xl font-semibold">{formatoPesos(ctx.pedido.total)}</span>
              </div>
            </motion.div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          {entregado ? (
            <a
              href={waEntregado ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-16 w-full items-center justify-center rounded-2xl bg-emerald-500 text-base font-medium text-white"
            >
              Avisar al cliente
            </a>
          ) : (
            <ShimmerButton
              type="button"
              disabled={busy}
              onClick={() =>
                estado === "pendiente"
                  ? void iniciarEntrega()
                  : void patchEstado("entregado")
              }
              className={`h-16 w-full ${estado === "pendiente" ? "bg-[#0066FF]" : "bg-emerald-500"}`}
            >
              {busy ? "Guardando" : actionLabel}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  );
}
