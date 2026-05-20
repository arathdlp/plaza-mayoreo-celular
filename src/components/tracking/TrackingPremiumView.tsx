"use client";

import ProductoImagen from "@/components/ProductoImagen";
import CelularConstruccion, { mapCelularVisualEstado } from "@/components/tracking/CelularConstruccion";
import EntregaCompletada from "@/components/tracking/EntregaCompletada";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { mensajeClienteARepartidor, urlWhatsApp } from "@/lib/contact-links";
import { ETIQUETAS_ESTADO_ENVIO } from "@/lib/envio-labels";
import { mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { formatoPesos } from "@/lib/format";
import { coordsFromPosition, parseCoord, resolveDestino, type LatLng } from "@/lib/coords";
import { badgeEstadoPagoPedido, badgeMetodoPago } from "@/lib/pedido-pago";
import { maneuverLabel, type NavigationStats } from "@/lib/tracking-navigation";
import { createClient } from "@/lib/supabase/client";
import { notificarCambioEnvio, solicitarPermisoNotificaciones } from "@/lib/tracking-push";
import { REPARTIDOR_GPS_INTERVAL_MS, type EnvioRow, type EstadoEnvio } from "@/types/envio";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Star,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TrackingItem = {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  imagen_url: string | null;
};

type RealtimeStatus = "connecting" | "live" | "reconnecting" | "offline";

const NavigationMap = dynamic(() => import("@/components/tracking/NavigationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full animate-pulse items-center justify-center bg-gray-100 px-6 text-center text-sm font-medium text-gray-500">
      Obteniendo tu ubicación...
    </div>
  ),
});

type Props = {
  pedidoId: number;
  initialEnvio: EnvioRow | null;
  clienteNombre?: string;
  clienteTelefono?: string;
  total: number;
  metodoPago: string | null;
  direccionEntrega: string;
  pedidoEstado: string;
  items: TrackingItem[];
  accessToken?: string;
  backHref?: string;
};

function repartidorPosition(envio: EnvioRow | null): LatLng | null {
  if (!envio) return null;
  return coordsFromPosition(envio.lat_actual, envio.lng_actual);
}

function estadoTexto(estado: EstadoEnvio): string {
  if (estado === "pendiente") return "Pedido recibido";
  if (estado === "en_camino") return "Tu repartidor está en camino";
  if (estado === "llegando") return "Llegando a tu ubicación";
  if (estado === "entregado") return "Pedido entregado";
  return "Preparando tu pedido";
}

function inicial(nombre?: string): string {
  return nombre?.trim()?.charAt(0)?.toUpperCase() || "R";
}

export default function TrackingPremiumView({
  pedidoId,
  initialEnvio,
  clienteNombre,
  clienteTelefono,
  total,
  metodoPago,
  direccionEntrega,
  pedidoEstado,
  items,
  accessToken,
  backHref = "/pedidos",
}: Props) {
  const reduceMotion = useReducedMotion();
  const [envio, setEnvio] = useState<EnvioRow | null>(initialEnvio);
  const [stats, setStats] = useState<NavigationStats | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [segundosDesdeUpdate, setSegundosDesdeUpdate] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("connecting");
  const [repartidorPos, setRepartidorPos] = useState<LatLng | null>(() => repartidorPosition(initialEnvio));
  const envioPrevRef = useRef(initialEnvio);
  const guestMode = Boolean(accessToken);
  const apiKeyAvailable = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());

  const destino = useMemo(() => (envio ? resolveDestino(envio) : null), [envio]);
  const envioPos = useMemo(() => repartidorPosition(envio), [envio]);
  const repartidor = repartidorPos ?? envioPos;
  const hasDestinoCoords =
    parseCoord(envio?.destino_lat) != null && parseCoord(envio?.destino_lng) != null;
  const canShowMap = apiKeyAvailable && Boolean(destino) && (hasDestinoCoords || Boolean(direccionEntrega?.trim()));
  const estado = (envio?.estado ?? "pendiente") as EstadoEnvio;
  const visualCelular = mapCelularVisualEstado(pedidoEstado, estado);
  const metodoBadge = badgeMetodoPago(metodoPago);
  const estadoPagoBadge = badgeEstadoPagoPedido(estado === "entregado" ? "pagado" : null);

  const telRepartidor = envio?.repartidor_telefono
    ? `tel:${envio.repartidor_telefono.replace(/\s/g, "")}`
    : null;

  const waRepartidor = useMemo(() => {
    if (!envio?.repartidor_telefono) return null;
    return urlWhatsApp(
      envio.repartidor_telefono,
      mensajeClienteARepartidor(clienteNombre ?? "cliente", pedidoId),
    );
  }, [envio?.repartidor_telefono, clienteNombre, pedidoId]);

  const onStats = useCallback((next: NavigationStats | null) => setStats(next), []);

  useEffect(() => {
    if (envioPos) setRepartidorPos(envioPos);
  }, [envioPos]);

  useEffect(() => {
    console.log("[TRACKING] Componente montado");
    console.log("[TRACKING] Envío:", envio);
    console.log("[TRACKING] API Key disponible:", apiKeyAvailable);
    void solicitarPermisoNotificaciones();
  }, [envio, apiKeyAvailable]);

  useEffect(() => {
    if (!envio) return;
    console.log("[TRACKING] Estado envío:", envio.estado, "pedido:", pedidoEstado);
    if (!envioPrevRef.current) {
      envioPrevRef.current = envio;
      return;
    }
    notificarCambioEnvio(envioPrevRef.current, envio, pedidoId);
    envioPrevRef.current = envio;
  }, [envio, pedidoEstado, pedidoId]);

  useEffect(() => {
    if (!envio?.updated_at) return;
    const tick = () => {
      const t = new Date(envio.updated_at).getTime();
      setSegundosDesdeUpdate(Math.max(0, Math.floor((Date.now() - t) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [envio?.updated_at]);

  useEffect(() => {
    if (!envio?.id) return;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const applyEnvioUpdate = (next: EnvioRow) => {
      const nextPos = repartidorPosition(next);
      if (nextPos) setRepartidorPos(nextPos);
      setEnvio((prev) => ({
        ...next,
        direccion_destino: prev?.direccion_destino ?? next.direccion_destino,
      }));
    };

    if (guestMode && accessToken) {
      const poll = async () => {
        try {
          const res = await fetch(
            `/api/pedidos/${pedidoId}/tracking?token=${encodeURIComponent(accessToken)}`,
          );
          if (!res.ok) return;
          const json = (await res.json()) as { envio?: EnvioRow };
          if (json.envio) applyEnvioUpdate(json.envio);
        } catch {
          /* reintento en el siguiente intervalo */
        }
      };
      void poll();
      pollId = setInterval(poll, REPARTIDOR_GPS_INTERVAL_MS);
    }

    const supabase = createClient();
    const channel = supabase
      // Requiere Supabase Dashboard -> Database -> Replication -> envios habilitado.
      .channel(`envio-${envio.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "envios",
          filter: `id=eq.${envio.id}`,
        },
        (payload) => {
          console.log("[TRACKING] Realtime update:", payload.new);
          const row = mapEnvioFromDb(payload.new as EnvioDbRow);
          applyEnvioUpdate(row);
        },
      )
      .subscribe((status) => {
        console.log("[TRACKING] Realtime status:", status);
        if (status === "SUBSCRIBED") setRealtimeStatus("live");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRealtimeStatus("reconnecting");
        if (status === "CLOSED") {
          setRealtimeStatus("reconnecting");
          reconnectTimer = setTimeout(() => {
            void channel.subscribe();
          }, 3000);
        }
      });

    return () => {
      if (pollId) clearInterval(pollId);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      void supabase.removeChannel(channel);
      setRealtimeStatus("offline");
    };
  }, [envio?.id, guestMode, accessToken, pedidoId]);

  const step = stats?.currentStep;
  const etaMinutes = stats ? Math.max(1, Math.round(stats.durationValue / 60)) : envio?.tiempo_estimado_minutos;
  const liveBadge =
    realtimeStatus === "live" && segundosDesdeUpdate <= 30
      ? { text: "En vivo", dot: "bg-emerald-500 animate-pulse" }
      : realtimeStatus === "reconnecting" || segundosDesdeUpdate <= 60
        ? { text: "Reconectando...", dot: "bg-amber-400" }
        : { text: "Sin señal", dot: "bg-red-500" };

  if (!envio) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-[#111827]">No pudimos cargar el rastreo</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Faltan datos del envío. Reintenta en unos segundos o vuelve al inicio.
        </p>
        <Link href={backHref} className="mt-6 rounded-full bg-[#0066FF] px-6 py-3 text-sm font-semibold text-white">
          Volver
        </Link>
      </main>
    );
  }

  if (estado === "entregado") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="entrega-completada"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <EntregaCompletada
            pedidoId={pedidoId}
            horaEntrega={envio.updated_at}
            repartidorNombre={envio.repartidor_nombre}
            ticketHref={`/api/pedidos/${pedidoId}/ticket`}
            backHref={backHref}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href={backHref}
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="font-medium">Pedido #{pedidoId}</p>
          <div className="h-10 w-10" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-2xl pb-10">
        <section className="relative overflow-hidden px-6 py-8 text-center">
          <CelularConstruccion visualEstado={visualCelular} />
          <h1 className="mt-5 text-2xl font-medium tracking-tight">{estadoTexto(estado)}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {etaMinutes ? (
              <>
                Tiempo estimado: <NumberTicker value={etaMinutes} suffix=" min" />
              </>
            ) : (
              ETIQUETAS_ESTADO_ENVIO[estado]
            )}
          </p>
        </section>

        <section className="relative h-[50vh] min-h-[360px] overflow-hidden border-y border-gray-200 bg-gray-100">
          {!apiKeyAvailable ? (
            <div className="absolute inset-x-4 top-4 z-10 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 shadow-sm">
              Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en Vercel.
            </div>
          ) : null}
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${liveBadge.dot}`}
              aria-hidden
            />
            {liveBadge.text}
          </div>
          {canShowMap && repartidor ? (
            <NavigationMap
              current={repartidor}
              destination={destino!}
              destinationAddress={direccionEntrega}
              marker="bike"
              onStats={onStats}
              className="h-full"
            />
          ) : canShowMap ? (
            <NavigationMap
              current={null}
              destination={destino!}
              destinationAddress={direccionEntrega}
              marker="bike"
              onStats={onStats}
              className="h-full"
            />
          ) : !apiKeyAvailable ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
              El mapa estará disponible cuando se configure la API key de Google Maps.
            </div>
          ) : !hasDestinoCoords && !direccionEntrega?.trim() ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
              No hay dirección de entrega para mostrar el mapa.
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
              El repartidor aparecerá en el mapa cuando inicie la entrega.
            </div>
          )}
          {stats?.routeError ? (
            <div className="absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-sm">
              {stats.routeError}
            </div>
          ) : null}
        </section>

        {envio.repartidor_nombre ? (
          <section className="px-4 pt-5">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <BorderBeam />
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0066FF] text-base font-semibold text-white">
                  {inicial(envio.repartidor_nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{envio.repartidor_nombre}</p>
                  <p className="text-xs text-gray-500">Tu repartidor</p>
                  <div className="mt-1 flex gap-0.5" aria-label="Calificación 5 de 5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {telRepartidor ? (
                    <a
                      href={telRepartidor}
                      aria-label="Llamar al repartidor"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700"
                    >
                      <Phone className="h-5 w-5" />
                    </a>
                  ) : null}
                  {waRepartidor ? (
                    <a
                      href={waRepartidor}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Enviar mensaje al repartidor"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0066FF] text-white"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="px-4 pt-5">
          <button
            type="button"
            onClick={() => setOpenDetails((v) => !v)}
            className="flex w-full items-center justify-between rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm"
          >
            <span className="flex items-center gap-3 font-medium">
              <Package className="h-5 w-5 text-[#0066FF]" />
              Detalles del pedido
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-500 transition ${openDetails ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {openDetails ? (
              <motion.div
                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <ul className="space-y-3">
                    {items.map((item, i) => (
                      <li key={`${item.nombre}-${i}`} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {item.imagen_url ? (
                            <Image src={item.imagen_url} alt="" fill className="object-cover" sizes="48px" />
                          ) : (
                            <ProductoImagen
                              categoria="Accesorio"
                              marca=""
                              nombre={item.nombre}
                              variant="card"
                              className="absolute inset-0 scale-150"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.cantidad} x {item.nombre}</p>
                          <p className="text-xs text-gray-500">{formatoPesos(item.precio_unitario * item.cantidad)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-2xl font-semibold">{formatoPesos(total)}</span>
                    </div>
                    <p className="mt-3 flex gap-2 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0066FF]" />
                      {direccionEntrega}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {metodoBadge ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${metodoBadge.className}`}>
                          <CreditCard className="h-3.5 w-3.5" />
                          {metodoBadge.label}
                        </span>
                      ) : null}
                      {estadoPagoBadge ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${estadoPagoBadge.className}`}>
                          <CheckCircle className="h-3.5 w-3.5" />
                          {estadoPagoBadge.label}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section className="px-4 pt-5">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Ruta</p>
            <p className="mt-2 text-lg font-medium">{maneuverLabel(step?.maneuver)}</p>
            <p className="mt-1 text-sm text-gray-500">{step?.instruction ?? "Esperando indicaciones de ruta"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-3">
                <MapPin className="h-4 w-4 text-[#0066FF]" />
                <p className="mt-1 font-semibold">{stats?.distanceText ?? "Sin ruta"}</p>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <Clock className="h-4 w-4 text-[#0066FF]" />
                <p className="mt-1 font-semibold">{stats?.durationText ?? "Calculando"}</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-4 pt-5">
          <a
            href="https://wa.me/524435402474"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white font-medium text-gray-800"
          >
            Soporte
          </a>
        </footer>
      </main>
    </div>
  );
}
