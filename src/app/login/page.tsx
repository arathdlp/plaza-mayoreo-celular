import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = pageMetadata({
  title: "Iniciar sesión",
  description: "Accede a tu cuenta para ver pedidos, checkout y historial en Plaza Mayoreo del Celular.",
  path: "/login",
  noindex: true,
});

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
