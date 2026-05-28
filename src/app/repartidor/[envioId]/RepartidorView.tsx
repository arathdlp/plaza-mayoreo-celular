"use client";

import { mensajeWhatsAppEnCamino, urlWhatsApp } from "@/lib/contact-links";
import PagoBadges from "@/components/pedidos/PagoBadges";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ETIQUETAS_ESTADO_ENVIO } from "@/lib/envio-labels";
import { formatoPesos } from "@/lib/format";
import { parseCoord, resolveDestino, type LatLng } from "@/lib/coords";
import { distanceMeters, maneuverLabel, type NavigationStats } from "@/lib/tracking-navigation";
import type { RepartidorContext } from "@/types/repartidor";
import type { EstadoEnvio } from "@/types/envio";
import ProductoImagen from "@/components/ProductoImagen";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle,
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
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";

import { REPARTIDOR_GPS_INTERVAL_MS } from "@/types/envio";

const INTERVAL_MS = REPARTIDOR_GPS_INTERVAL_MS;
const FAST_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60_000,
  timeout: 5_000,
};
const WATCH_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 30_000,
};
const ENTREGA_PENDIENTE_KEY = "entrega_pendiente";

type EntregaPendiente = {
  envioId: string;
  token: string;
  timestamp: number;
};

type EntregaButtonState =
  | { kind: "idle" }
  | { kind: "intentando" }
  | { kind: "reintentando"; intento: number; total: number }
  | { kind: "sin_conexion" };

function isLikelyMobile(): boolean {
  if (typeof navigator === "undefined") return true;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

const NavigationMap = dynamic(
  () => import("@/components/tracking/NavigationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full animate-pulse items-center justify-center bg-gray-100 px-6 text-center text-sm font-medium text-gray-500">
        Obteniendo tu ubicación...
      </div>
    ),
  },
);

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

function clearPendingPosition(envioId: string) {
  try {
    localStorage.removeItem(pendingPosKey(envioId));
  } catch {
    /* ignore */
  }
}

function etiquetaMetodo(m: string | null): string {
  if (m === "mercado_pago") return "Mercado Pago";
  return "Pagar al recibir";
}

function GpsBlockedScreen({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <MapPin className="h-12 w-12 text-[#0066FF]" />
      <h1 className="mt-4 text-xl font-semibold text-[#111827]">Activa tu ubicación</h1>
      <div className="mt-4 max-w-md space-y-4 text-left text-sm text-gray-600">
        <p>
          La app del repartidor necesita GPS para navegar y enviar tu posición al cliente.
          {message ? ` Error: ${message}` : ""}
        </p>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold text-[#111827]">Chrome</p>
          <p>1. Toca el candado o controles del sitio junto a la URL.</p>
          <p>2. En Permisos, cambia Ubicación a Permitir.</p>
          <p>3. Vuelve a esta página y presiona Reintentar.</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="font-semibold text-[#111827]">Safari</p>
          <p>1. Abre Ajustes del sitio web para esta página.</p>
          <p>2. En Ubicación, selecciona Permitir.</p>
          <p>3. Regresa a la app y presiona Reintentar.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 flex h-14 items-center justify-center rounded-2xl bg-[#0066FF] px-6 text-sm font-semibold text-white shadow-sm"
      >
        Reintentar
      </button>
    </div>
  );
}

function DirectionIcon({ maneuver }: { maneuver?: string }) {
  if (maneuver?.includes("left")) return <ArrowLeft className="h-6 w-6" />;
  if (maneuver?.includes("right")) return <ArrowRight className="h-6 w-6" />;
  return <ArrowUp className="h-6 w-6" />;
}

function LoadingScreen({
  timedOut,
  onRetry,
}: {
  timedOut: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
      <div className="mb-5 h-16 w-16 animate-pulse rounded-full bg-white/10" />
      <p className="text-lg font-medium">
        {timedOut ? "Tardamos más de lo esperado" : "Cargando envío..."}
      </p>
      <p className="mt-2 max-w-sm text-sm text-white/60">
        {timedOut
          ? "Revisa tu conexión e intenta cargar el envío nuevamente."
          : "Estamos preparando los datos de la entrega."}
      </p>
      {timedOut ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-14 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
          >
            Volver al inicio
          </a>
        </div>
      ) : null}
    </div>
  );
}

function FatalScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
      <p className="text-xl font-bold text-red-400">{title}</p>
      <p className="mt-3 max-w-md text-sm text-white/70">{message}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-14 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
        <a
          href="/"
          className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

function DriverCompletedScreen({ pedidoId }: { pedidoId: number }) {
  return (
    <main className="relative flex min-h-[100dvh] overflow-hidden bg-[#0066FF] px-6 py-10 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-full bg-white/30"
            style={{
              left: `${(i * 29) % 100}%`,
              top: `${(i * 17) % 100}%`,
              width: i % 4 === 0 ? 14 : 6,
              height: i % 4 === 0 ? 2 : 6,
            }}
            initial={{ opacity: 0, y: 16, scale: 0.7 }}
            animate={{ opacity: [0, 0.5, 0], y: [-8, -54], scale: [0.7, 1, 0.9] }}
            transition={{ duration: 2.6, delay: (i % 8) * 0.14, repeat: Infinity, repeatDelay: 1.8 }}
          />
        ))}
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.72, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"
        >
          <CheckCircle className="h-20 w-20 text-white" strokeWidth={1.6} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-8 text-3xl font-bold tracking-tight"
        >
          Entrega completada
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-3 text-sm font-medium text-white/75"
        >
          Pedido #{pedidoId} registrado
        </motion.p>
        <motion.a
          href="/repartidor/dashboard"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-[#0066FF] shadow-sm"
        >
          Volver al inicio
        </motion.a>
      </section>
    </main>
  );
}

export default function RepartidorView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const envioId = params.envioId as string;
  const token = searchParams.get("token") ?? "";

  const [ctx, setCtx] = useState<RepartidorContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [gpsPermission, setGpsPermission] = useState<GpsPermission>("pending");
  const [busy, setBusy] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [stats, setStats] = useState<NavigationStats | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [confirmEntregaOpen, setConfirmEntregaOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [entregaButtonState, setEntregaButtonState] = useState<EntregaButtonState>({ kind: "idle" });
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

  const apiUrl = useCallback(
    (path: string) => {
      const base = `/api/repartidor/${envioId}${path}`;
      return token ? `${base}?token=${encodeURIComponent(token)}` : base;
    },
    [envioId, token],
  );

  const saveEntregaPendiente = useCallback(() => {
    try {
      const pending: EntregaPendiente = { envioId, token, timestamp: Date.now() };
      localStorage.setItem(ENTREGA_PENDIENTE_KEY, JSON.stringify(pending));
    } catch {
      /* ignore */
    }
  }, [envioId, token]);

  const clearEntregaPendiente = useCallback(() => {
    try {
      localStorage.removeItem(ENTREGA_PENDIENTE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchCtx = useCallback(async () => {
    const url = apiUrl("");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(url, { credentials: "include", signal: controller.signal });
      let json: { error?: string } & Partial<RepartidorContext>;
      try {
        json = (await res.json()) as { error?: string } & Partial<RepartidorContext>;
      } catch {
        setError("Respuesta inválida del servidor.");
        setCtx(null);
        return;
      }

      if (!res.ok) {
        setError(json.error ?? "No se pudo cargar el envío.");
        setCtx(null);
        return;
      }

      if (!json.envio || !json.cliente || !json.pedido) {
        setError("Faltan datos del envío o del cliente.");
        setCtx(null);
        return;
      }

      const data = json as RepartidorContext;
      setCtx(data);
      ctxRef.current = data;
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "La solicitud tardó demasiado. Reintenta."
          : "No se pudo cargar el envío.";
      console.error("[REPARTIDOR] Error cargando contexto:", err);
      setError(message);
      setCtx(null);
    } finally {
      clearTimeout(timeoutId);
    }
  }, [apiUrl]);

  const loadContext = useCallback(() => {
    setLoading(true);
    setLoadingTimedOut(false);
    void fetchCtx().finally(() => setLoading(false));
  }, [fetchCtx]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setLoadingTimedOut(true), 10_000);
    return () => clearTimeout(id);
  }, [loading]);

  const sendUbicacion = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(apiUrl("/ubicacion"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lat, lng, ...authBody() }),
        });
        if (!res.ok) throw new Error("upload failed");
        clearPendingPosition(envioId);
      } catch {
        savePendingPosition(envioId, lat, lng);
        console.warn("[REPARTIDOR] No se pudo enviar ubicación, guardada localmente");
      }
    },
    [apiUrl, authBody, envioId],
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
      if (ctxRef.current) {
        void sendUbicacion(next.lat, next.lng);
      }
    },
    [sendUbicacion],
  );

  const startTracking = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !navigator.geolocation ||
      trackingStartedRef.current ||
      watchIdRef.current != null
    ) {
      return;
    }
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
        setGeoError(
          err.code === 3
            ? "Buscando tu ubicación, asegúrate de tener GPS activado"
            : err.message,
        );
        if (err.code === 1) setGpsPermission("denied");
      },
      WATCH_GEO_OPTIONS,
    );

    intervalRef.current = setInterval(tick, INTERVAL_MS);
    tick();
  }, [applyPosition, sendUbicacion]);

  const requestCurrentPosition = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización");
      setGpsPermission("denied");
      return;
    }
    setGeoError(null);
    setGpsPermission("pending");
    startTracking();
    navigator.geolocation.getCurrentPosition(
      (p) => {
        applyPosition(p);
        setGeoError(null);
        setGpsPermission("granted");
      },
      (err) => {
        console.error("[REPARTIDOR] Error GPS:", err.code, err.message);
        setGeoError(
          err.code === 3
            ? "Buscando tu ubicación, asegúrate de tener GPS activado"
            : err.message,
        );
        if (err.code === 1) setGpsPermission("denied");
      },
      FAST_GEO_OPTIONS,
    );
  }, [applyPosition, startTracking]);

  useEffect(() => {
    requestCurrentPosition();
  }, [requestCurrentPosition]);

  useEffect(() => {
    setIsDesktop(!isLikelyMobile());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
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
    if (typeof window === "undefined" || !("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      /* permiso denegado o no soportado */
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    trackingStartedRef.current = false;
  }, []);

  const envio = ctx?.envio;
  const cliente = ctx?.cliente;
  const apiKeyAvailable = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());

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

  async function patchEstado(estadoNuevo: EstadoEnvio) {
    setBusy(true);
    const coords = lastPosRef.current;
    const res = await fetch(apiUrl("/estado"), {
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

  const marcarEntregadoConRetry = useCallback(
    async (intentos = 3): Promise<boolean> => {
      const coords = lastPosRef.current;
      setBusy(true);
      for (let i = 0; i < intentos; i += 1) {
        try {
          setEntregaButtonState(i === 0 ? { kind: "intentando" } : { kind: "reintentando", intento: i + 1, total: intentos });
          const res = await fetch(apiUrl("/estado"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              ...authBody(),
              estado: "entregado",
              ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
            }),
            signal: AbortSignal.timeout(10_000),
          });
          if (res.ok) {
            const json = await res.json();
            await releaseWakeLock();
            if (json.whatsappEntregado) {
              window.open(json.whatsappEntregado as string, "_blank", "noopener,noreferrer");
            }
            clearEntregaPendiente();
            setEntregaButtonState({ kind: "idle" });
            setBusy(false);
            await fetchCtx();
            toast("Entrega registrada correctamente");
            return true;
          }
        } catch {
          /* retry below */
        }
        if (i < intentos - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
      saveEntregaPendiente();
      setEntregaButtonState({ kind: "sin_conexion" });
      setBusy(false);
      toast("Sin conexión. Se enviará cuando haya señal");
      return false;
    },
    [apiUrl, authBody, clearEntregaPendiente, fetchCtx, releaseWakeLock, saveEntregaPendiente],
  );

  async function iniciarEntrega() {
    if (typeof window === "undefined" || !navigator.geolocation) {
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
          setGeoError(null);
          setGpsPermission("granted");
          startTracking();
          await requestWakeLock();
          await patchEstado("en_camino");
          resolve();
        },
        (err) => {
          console.error("[REPARTIDOR] Error GPS al iniciar:", err.code, err.message);
          setGeoError(
            err.code === 3
              ? "Buscando tu ubicación, asegúrate de tener GPS activado"
              : err.message,
          );
          setError(
            err.code === 1
              ? "Activa el permiso de ubicación para iniciar."
              : "No pudimos obtener tu ubicación aún. Intenta de nuevo en unos segundos.",
          );
          if (err.code === 1) setGpsPermission("denied");
          setBusy(false);
          resolve();
        },
        FAST_GEO_OPTIONS,
      );
    });
  }

  async function confirmarEntrega() {
    setConfirmEntregaOpen(false);
    await marcarEntregadoConRetry();
  }

  const reenviarEntregaPendiente = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(ENTREGA_PENDIENTE_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw) as EntregaPendiente;
      const isFresh = Date.now() - pending.timestamp < 24 * 60 * 60 * 1000;
      if (!isFresh || pending.envioId !== envioId || pending.token !== token) {
        localStorage.removeItem(ENTREGA_PENDIENTE_KEY);
        return;
      }
      const ok = await marcarEntregadoConRetry();
      if (ok) clearEntregaPendiente();
    } catch {
      /* ignore */
    }
  }, [envioId, marcarEntregadoConRetry, token]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOnline = () => {
      setIsOnline(true);
      void reenviarEntregaPendiente();
    };
    const onOffline = () => {
      setIsOnline(false);
      setEntregaButtonState({ kind: "sin_conexion" });
    };

    setIsOnline(navigator.onLine);
    if (navigator.onLine) void reenviarEntregaPendiente();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [reenviarEntregaPendiente]);

  if (loading) {
    return <LoadingScreen timedOut={loadingTimedOut} onRetry={loadContext} />;
  }

  if (error && !ctx) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
        <p className="text-xl font-bold text-red-400">
          {error.includes("acceso") ? "Sin acceso" : "No pudimos cargar el envío"}
        </p>
        <p className="mt-3 text-sm text-white/70">{error}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadContext}
            className="inline-flex h-14 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
          >
            Volver al inicio
          </a>
        </div>
        {!token ? (
          <a
            href="/repartidor/login"
            className="mt-4 text-sm font-semibold text-[#93C5FD] hover:underline"
          >
            Iniciar sesión
          </a>
        ) : null}
      </div>
    );
  }

  if (gpsPermission === "denied") {
    return <GpsBlockedScreen message={geoError} onRetry={requestCurrentPosition} />;
  }

  if (!ctx || !envio || !cliente) {
    return (
      <FatalScreen
        title="No pudimos cargar el envío"
        message="Faltan datos del envío o del cliente. Reintenta en unos segundos."
      />
    );
  }

  const estado = envio.estado;
  const entregado = estado === "entregado";
  const trackingActivo = estado === "en_camino" || estado === "llegando";
  const showWakeBanner = gpsPermission === "granted";
  const showGeoBanner = Boolean(geoError) || isDesktop;
  const topBannerText = geoError ?? "Estás en computadora. El GPS funciona mejor en celular.";
  const destino = resolveDestino(envio);
  const hasDestinoCoords = parseCoord(envio.destino_lat) != null && parseCoord(envio.destino_lng) != null;
  const hasDireccionDestino = Boolean(ctx.pedido.direccion_entrega?.trim());
  const canResolveDestino = hasDestinoCoords || hasDireccionDestino;
  const activePosition = currentPosition ?? lastPosRef.current;
  const navigationPosition =
    gpsPermission === "granted" && activePosition
      ? { lat: activePosition.lat, lng: activePosition.lng }
      : null;
  const step = stats?.currentStep;
  const distanciaEntregaMeters =
    activePosition && canResolveDestino ? distanceMeters(activePosition, destino) : null;
  const entregaLejana = distanciaEntregaMeters != null && distanciaEntregaMeters > 500;
  const routeHint = stats?.routeError ?? geoError ?? (gpsPermission === "pending" ? "Obteniendo tu ubicación..." : null);
  const actionLabel =
    estado === "pendiente"
      ? "Iniciar entrega"
      : trackingActivo && entregaButtonState.kind === "intentando"
        ? "Registrando entrega..."
        : trackingActivo && entregaButtonState.kind === "reintentando"
          ? `Reintentando... (${entregaButtonState.intento}/${entregaButtonState.total})`
        : trackingActivo && (!isOnline || entregaButtonState.kind === "sin_conexion")
          ? "Sin conexión. Se enviará cuando haya señal"
        : trackingActivo
          ? "Marcar como entregado"
        : entregado
          ? "Entrega completada"
          : "Actualizar entrega";
  const waCliente = cliente.telefono
    ? urlWhatsApp(cliente.telefono, mensajeWhatsAppEnCamino(cliente.nombre, ctx.pedido.id))
    : null;

  if (entregado) {
    return <DriverCompletedScreen pedidoId={ctx.pedido.id} />;
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-28 text-[#111827]">
      {showGeoBanner ? (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-amber-950 shadow-lg">
          <MapPin className="h-4 w-4 shrink-0" />
          {topBannerText}
        </div>
      ) : showWakeBanner ? (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          <Signal className="h-4 w-4" />
          Mantén esta pestaña abierta durante la entrega
        </div>
      ) : null}
      <header className={`sticky z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur ${showWakeBanner || showGeoBanner ? "top-9" : "top-0"}`}>
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{cliente.nombre}</p>
            <p className="truncate text-xs text-gray-500">{ctx.pedido.direccion_entrega}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {cliente.telefono ? (
              <a
                href={`tel:${cliente.telefono.replace(/\s/g, "")}`}
                aria-label="Llamar al cliente"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700"
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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0066FF] text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={voiceEnabled ? "Desactivar voz" : "Activar voz"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700"
            >
              {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl">
        <section className="h-[50vh] min-h-[320px] overflow-hidden border-b border-gray-200 bg-gray-100 sm:h-[60vh] sm:min-h-[420px]">
          {!apiKeyAvailable ? (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en Vercel.
              </div>
            </div>
          ) : navigationPosition && canResolveDestino ? (
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
          ) : !canResolveDestino ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
              No hay coordenadas ni dirección de entrega para calcular la ruta.
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gray-100 px-6 text-center">
              <div className="mb-4 h-28 w-28 animate-pulse rounded-full bg-white shadow-sm" />
              <p className="text-sm font-medium text-gray-700">
                {geoError ?? "Obteniendo tu ubicación..."}
              </p>
              <p className="mt-2 max-w-xs text-xs text-gray-500">
                Si el navegador no muestra el permiso automáticamente, toca el botón para activarlo.
              </p>
              <button
                type="button"
                onClick={requestCurrentPosition}
                className="mt-5 flex h-14 items-center justify-center rounded-2xl bg-[#0066FF] px-5 text-sm font-semibold text-white shadow-sm"
              >
                Activar ubicación
              </button>
            </div>
          )}
        </section>

        <section className="-mt-16 px-4 sm:-mt-24">
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
                <p className="mt-1 text-base font-medium leading-snug sm:text-lg">
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

      {confirmEntregaOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center sm:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-[#111827]">¿Confirmar entrega?</h2>
            <p className="mt-2 text-sm text-gray-600">Esta acción no se puede deshacer.</p>
            {entregaLejana ? (
              <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Pareces estar lejos del destino. ¿Confirmas que entregaste el pedido?
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmEntregaOpen(false)}
                className="h-14 rounded-2xl border border-gray-200 font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarEntrega()}
                className="h-14 rounded-2xl bg-emerald-500 font-medium text-white"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <ShimmerButton
            type="button"
            disabled={busy}
            onClick={() =>
              estado === "pendiente"
                ? void iniciarEntrega()
                : setConfirmEntregaOpen(true)
            }
            className={`h-16 w-full ${estado === "pendiente" ? "bg-[#0066FF]" : "bg-emerald-500"}`}
          >
            {busy ? "Guardando" : actionLabel}
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
