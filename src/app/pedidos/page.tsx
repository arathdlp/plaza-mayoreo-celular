import { createClient } from "@/lib/supabase/server";
import PrivateChrome from "@/components/auth/PrivateChrome";
import SignOutButton from "@/components/auth/SignOutButton";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pedidos | Plaza Mayoreo del Celular",
  description: "Historial de tus pedidos.",
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <PrivateChrome
      title="Pedidos"
      description="Consulta el estado de tus compras y envíos."
      actions={
        <>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:border-[#0066FF]/40 hover:bg-[#0066FF]/10"
          >
            Dashboard
          </Link>
          <SignOutButton />
        </>
      }
    >
      <p className="text-white/60">
        Aún no hay pedidos registrados en esta cuenta. Cuando completes una compra, aparecerán aquí.
      </p>
    </PrivateChrome>
  );
}
