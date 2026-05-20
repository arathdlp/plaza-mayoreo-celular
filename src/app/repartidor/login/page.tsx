import RepartidorLoginForm from "@/app/repartidor/login/RepartidorLoginForm";
import { getRepartidorSession } from "@/lib/repartidor-session";
import { pageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Repartidor · Iniciar sesión",
  description: "Acceso para repartidores de Plaza Mayoreo del Celular.",
  path: "/repartidor/login",
  noindex: true,
});

export default async function RepartidorLoginPage() {
  const session = await getRepartidorSession();
  if (session) redirect("/repartidor/dashboard");

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-900/5">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#0066FF]">
          Repartidor
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold text-[#111827]">Iniciar sesión</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Plaza Mayoreo del Celular
        </p>
        <div className="mt-8">
          <RepartidorLoginForm />
        </div>
      </div>
    </main>
  );
}
