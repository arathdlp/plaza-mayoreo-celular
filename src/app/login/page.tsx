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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
