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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-[#0a1628] to-[#0c2848] text-white/50">
          Cargando…
        </div>
      }
    >
      <RegistroForm />
    </Suspense>
  );
}
