"use client";

import ProductoImagen from "@/components/ProductoImagen";
import CelularConstruccion from "@/components/tracking/CelularConstruccion";
import NavigationMap from "@/components/tracking/NavigationMap";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Particles } from "@/components/ui/particles";
import { mensajeClienteARepartidor, urlWhatsApp } from "@/lib/contact-links";
import { ETIQUETAS_ESTADO_ENVIO } from "@/lib/envio-labels";
import { mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { formatoPesos } from "@/lib/format";
import { parseCoord, resolveDestino, type LatLng } from "@/lib/google-maps";
import { badgeEstadoPagoPedido, badgeMetodoPago } from "@/lib/pedido-pago";
import { maneuverLabel, type NavigationStats } from "@/lib/tracking-navigation";
import { createClient } from "@/lib/supabase/client";
import { notificarCambioEnvio, solicitarPermisoNotificaciones } from "@/lib/tracking-push";
import { REPARTIDOR_GPS_INTERVAL_MS, type EnvioRow, type EstadoEnvio } from "@/types/envio";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Bike,
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
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TrackingItem = {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  imagen_url: string | null;
};

type Props = {
  pedidoId: number;
  initialEnvio: EnvioRow;
  clienteNombre?: string;
  clienteTelefono?: string;
  total: number;
  metodoPago: string | null;
  direccionEntrega: string;
  items: TrackingItem[];
  accessToken?: string;
  backHref?: string;
};

function coordsFromEnvio(envio: EnvioRow): LatLng | null {
  const lat = parseCoord(envio.lat_actual);
  const lng = parseCoord(envio.lng_actual);
  if (lat == null || lng == null) return null;
  return { lat, lng };
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
  items,
  accessToken,
  backHref = "/pedidos",
}: Props) {
  const reduceMotion = useReducedMotion();
  const [envio, setEnvio] = useState(initialEnvio);
  const [stats, setStats] = useState<NavigationStats | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const envioPrevRef = useRef(initialEnvio);
  const guestMode = Boolean(accessToken);

  const destino = useMemo(() => resolveDestino(envio), [envio]);
  const repartidor = useMemo(() => coordsFromEnvio(envio), [envio]);
  const estado = envio.estado as EstadoEnvio;
  const metodoBadge = badgeMetodoPago(metodoPago);
  const estadoPagoBadge = badgeEstadoPagoPedido(estado === "entregado" ? "pagado" : null);

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

  const onStats = useCallback((next: NavigationStats | null) => setStats(next), []);

  useEffect(() => {
    void solicitarPermisoNotificaciones();
  }, []);

  useEffect(() => {
    notificarCambioEnvio(envioPrevRef.current, envio, pedidoId);
    envioPrevRef.current = envio;
  }, [envio, pedidoId]);

  useEffect(() => {
    if (guestMode && accessToken) {
      const poll = async () => {
        try {
          const res = await fetch(
            `/api/pedidos/${pedidoId}/tracking?token=${encodeURIComponent(accessToken)}`,
          );
          if (!res.ok) return;
          const json = (await res.json()) as { envio?: EnvioRow };
          if (json.envio) {
            setEnvio((prev) => ({
              ...json.envio!,
              direccion_destino: prev.direccion_destino,
            }));
          }
        } catch {
          /* reintento en el siguiente intervalo */
        }
      };
      void poll();
      const id = setInterval(poll, REPARTIDOR_GPS_INTERVAL_MS);
      return () => clearInterval(id);
    }

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
  }, [envio.id, guestMode, accessToken, pedidoId]);

  const step = stats?.currentStep;
  const etaMinutes = stats ? Math.max(1, Math.round(stats.durationValue / 60)) : envio.tiempo_estimado_minutos;

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
          {estado === "entregado" ? <Particles /> : null}
          <CelularConstruccion estado={estado} />
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

        <section className="h-[50vh] min-h-[360px] overflow-hidden border-y border-gray-200 bg-gray-100">
          {repartidor ? (
            <NavigationMap
              current={repartidor}
              destination={destino}
              marker="bike"
              onStats={onStats}
              className="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
              El repartidor aparecerá en el mapa cuando inicie la entrega.
            </div>
          )}
        </section>

        {envio.repartidor_nombre ? (
          <section className="px-4 pt-5">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-900/5">
              <BorderBeam />
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0066FF] font-semibold text-white">
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
