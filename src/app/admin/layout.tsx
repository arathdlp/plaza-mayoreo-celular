import Header from "@/components/Header";
import { adminNavLink, alertWarning, btnSecondary, pageMainMuted } from "@/lib/design-system";
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
        <main className={`${pageMainMuted} px-4 py-16 sm:px-6 lg:px-8`}>
          <div className={`mx-auto max-w-lg ${alertWarning} px-8 py-10 text-center`}>
            <h1 className="text-xl font-bold text-[#111827]">Configura el acceso admin</h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Tu correo está en <code className="rounded bg-white px-1.5 py-0.5 text-xs">ADMIN_EMAILS</code> pero aún no
              tienes <span className="font-semibold text-[#111827]">is_admin</span> en la tabla{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">clientes</code>. Añade la variable de entorno{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> en el servidor,
              o ejecuta en Supabase:{" "}
              <code className="mt-2 block rounded-lg bg-white p-3 text-left text-xs text-amber-900">
                update public.clientes set is_admin = true where email = &apos;tu@correo.com&apos;;
              </code>
            </p>
            <Link href="/dashboard" className={`mt-8 ${btnSecondary} h-11 px-6 text-sm`}>
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
      <div className={pageMainMuted}>
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-4 sm:gap-3 sm:px-6 lg:px-8">
            <span className="mr-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0066FF]">Admin</span>
            <Link href="/admin" className={adminNavLink}>
              Inicio
            </Link>
            <Link href="/admin/productos" className={adminNavLink}>
              Productos
            </Link>
            <Link href="/admin/pedidos" className={adminNavLink}>
              Pedidos
            </Link>
            <Link href="/admin/repartidores" className={adminNavLink}>
              Repartidores
            </Link>
            <Link href="/admin/servicios" className={adminNavLink}>
              Servicios
            </Link>
            <Link href="/" className={`ml-auto ${adminNavLink}`}>
              Ver tienda
            </Link>
          </div>
        </header>
        {children}
      </div>
    </>
  );
}
