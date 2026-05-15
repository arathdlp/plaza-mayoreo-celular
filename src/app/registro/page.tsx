import { Suspense } from "react";
import type { Metadata } from "next";
import RegistroForm from "./RegistroForm";

export const metadata: Metadata = {
  title: "Registro | Plaza Mayoreo del Celular",
  description: "Crea tu cuenta en Plaza Mayoreo del Celular.",
};

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
