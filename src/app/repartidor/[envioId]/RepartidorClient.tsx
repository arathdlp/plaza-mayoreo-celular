"use client";

import ErrorBoundary from "@/components/ErrorBoundary";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

function ChunkLoadingScreen({ timedOut }: { timedOut: boolean }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
      <div className="mb-5 h-16 w-16 animate-pulse rounded-full bg-white/10" />
      <p className="text-lg font-medium">
        {timedOut ? "Tardamos más de lo esperado" : "Cargando envío..."}
      </p>
      {timedOut ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
          >
            Volver al inicio
          </a>
        </div>
      ) : null}
    </div>
  );
}

function ChunkLoadError() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
      <h1 className="text-xl font-bold text-red-400">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-sm text-white/70">
        No pudimos cargar la app del repartidor. Reintenta o vuelve al inicio.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
        <a
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}

const RepartidorView = dynamic(
  () =>
    import("./RepartidorView").catch((err) => {
      console.error("[REPARTIDOR] Error cargando módulo de la app", err);
      return { default: ChunkLoadError };
    }),
  {
    ssr: false,
    loading: () => <ChunkLoader />,
  },
);

function ChunkLoader() {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(id);
  }, []);
  return <ChunkLoadingScreen timedOut={timedOut} />;
}

export default function RepartidorClient() {
  return (
    <ErrorBoundary>
      <RepartidorView />
    </ErrorBoundary>
  );
}
