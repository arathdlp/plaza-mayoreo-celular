import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import RepartidorClient from "./RepartidorClient";

export const metadata: Metadata = pageMetadata({
  title: "App repartidor",
  description: "Seguimiento de entrega en tiempo real.",
  path: "/repartidor",
  noindex: true,
});

export default function RepartidorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0f] text-white">
          Cargando…
        </div>
      }
    >
      <RepartidorClient />
    </Suspense>
  );
}
