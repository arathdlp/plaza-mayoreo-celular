import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import VerificadoView from "./VerificadoView";

export const metadata: Metadata = pageMetadata({
  title: "Email verificado",
  description: "Tu correo fue confirmado. Inicia sesión en Plaza Mayoreo del Celular.",
  path: "/verificado",
  noindex: true,
});

export default function VerificadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
          Cargando…
        </div>
      }
    >
      <VerificadoView />
    </Suspense>
  );
}
