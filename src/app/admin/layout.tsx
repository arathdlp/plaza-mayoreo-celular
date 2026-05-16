import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminSupabase } from "./_lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Administración",
  description: "Gestión de catálogo y pedidos (solo personal autorizado).",
  path: "/admin",
  noindex: true,
});

const navLink =
  "rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/85 transition-all hover:border-[#0066FF]/45 hover:bg-[#0066FF]/12 hover:text-white";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const r = await getAdminSupabase();

  if (!r.ok) {
    if (r.reason === "unauthenticated") {
      redirect("/login?next=/admin");
    }
    if (r.reason === "forbidden") {
      redirect("/dashboard");
    }

    return (
      <>
        <Header />
        <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a] px-4 py-16 sm:px-6 lg:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,102,255,0.18), transparent 55%)",
            }}
          />
          <div className="relative mx-auto max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/10 px-8 py-10 text-center backdrop-blur-sm">
            <h1 className="text-xl font-semibold text-white">Configura el acceso admin</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Tu correo está en <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">ADMIN_EMAILS</code> pero aún no
              tienes <span className="font-medium text-white">is_admin</span> en la tabla{" "}
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">clientes</code>. Añade la variable de entorno{" "}
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> en el servidor,
              o ejecuta en Supabase:{" "}
              <code className="mt-2 block rounded-lg bg-black/40 p-3 text-left text-xs text-amber-100/90">
                update public.clientes set is_admin = true where email = &apos;tu@correo.com&apos;;
              </code>
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white hover:bg-white/10"
            >
              Volver al dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a]">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,102,255,0.15), transparent 55%)",
          }}
        />
        <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-4 sm:gap-3 sm:px-6 lg:px-8">
            <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0066FF]/90">
              Admin
            </span>
            <Link href="/admin" className={navLink}>
              Inicio
            </Link>
            <Link href="/admin/productos" className={navLink}>
              Productos
            </Link>
            <Link href="/admin/pedidos" className={navLink}>
              Pedidos
            </Link>
            <Link
              href="/"
              className="ml-auto rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/55 transition-colors hover:border-[#0066FF]/35 hover:text-[#0066FF]"
            >
              Ver tienda
            </Link>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}
