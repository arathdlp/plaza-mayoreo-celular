import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import RegistroForm from "./RegistroForm";

export const metadata: Metadata = pageMetadata({
  title: "Crear cuenta",
  description: "Regístrate para comprar, guardar pedidos y recibir soporte en Plaza Mayoreo del Celular.",
  path: "/registro",
  noindex: true,
});

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
          Cargando…
        </div>
      }
    >
      <RegistroForm />
    </Suspense>
  );
}
