import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Plaza Mayoreo del Celular",
  description: "Accede a tu cuenta en Plaza Mayoreo del Celular.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-[#0a1628] to-[#0c2848] text-white/50">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
