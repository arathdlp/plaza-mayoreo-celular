"use client";

import ErrorBoundary from "@/components/ErrorBoundary";
import type { EnvioRow } from "@/types/envio";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

type TrackingItem = {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  imagen_url: string | null;
};

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

function TrackingLoadError({ backHref }: { backHref: string }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-[#111827]">Algo salió mal</h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        No pudimos cargar el rastreo en tu dispositivo. Reintenta o vuelve al inicio.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
        <Link
          href={backHref}
          className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-800"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

function TrackingChunkLoader() {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(id);
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 h-16 w-16 animate-pulse rounded-full bg-gray-100" />
      <p className="text-sm font-medium text-gray-700">
        {timedOut ? "Tardamos más de lo esperado" : "Cargando rastreo..."}
      </p>
      {timedOut ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-800"
          >
            Volver al inicio
          </Link>
        </div>
      ) : null}
    </main>
  );
}

const TrackingPremiumView = dynamic(
  () =>
    import("@/components/tracking/TrackingPremiumView").catch((err) => {
      console.error("[TRACKING] Error cargando vista", err);
      return {
        default: function TrackingPremiumLoadError({
          backHref = "/",
        }: {
          backHref?: string;
        }) {
          return <TrackingLoadError backHref={backHref} />;
        },
      };
    }),
  {
    ssr: false,
    loading: () => <TrackingChunkLoader />,
  },
);

export default function TrackingClient(props: Props) {
  return (
    <ErrorBoundary>
      <TrackingPremiumView {...props} />
    </ErrorBoundary>
  );
}
