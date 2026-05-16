import PrivateChrome from "@/components/auth/PrivateChrome";
import SignOutButton from "@/components/auth/SignOutButton";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Mi cuenta",
  description: "Accede al dashboard, carrito y pedidos de tu cuenta en Plaza Mayoreo del Celular.",
  path: "/dashboard",
  noindex: true,
});

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user.email ||
    "Usuario";

  return (
    <PrivateChrome
      title="Dashboard"
      description="Bienvenido de nuevo. Desde aquí podrás gestionar pedidos y carrito cuando estén disponibles."
      actions={<SignOutButton />}
    >
      <p className="text-sm font-medium text-[#0066FF]">Sesión activa</p>
      <p className="mt-2 text-lg font-semibold text-white">{displayName}</p>
      <p className="mt-1 text-sm text-white/55">{user.email}</p>
      {typeof user.user_metadata?.phone === "string" && user.user_metadata.phone ? (
        <p className="mt-1 text-sm text-white/55">Tel: {user.user_metadata.phone}</p>
      ) : null}
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href="/carrito"
            className="block rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-white transition-all duration-300 hover:border-[#0066FF]/40 hover:bg-[#0066FF]/10"
          >
            Ir al carrito →
          </Link>
        </li>
        <li>
          <Link
            href="/pedidos"
            className="block rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-white transition-all duration-300 hover:border-[#0066FF]/40 hover:bg-[#0066FF]/10"
          >
            Ver pedidos →
          </Link>
        </li>
      </ul>
    </PrivateChrome>
  );
}
