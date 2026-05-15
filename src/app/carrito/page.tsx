import { createClient } from "@/lib/supabase/server";
import PrivateChrome from "@/components/auth/PrivateChrome";
import SignOutButton from "@/components/auth/SignOutButton";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Carrito | Plaza Mayoreo del Celular",
  description: "Tu carrito de compras.",
};

export default async function CarritoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <PrivateChrome
      title="Carrito"
      description="Aquí verás los productos que agregues. La lógica de carrito se conectará después."
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
        Tu carrito está vacío. Visita la{" "}
        <Link href="/productos" className="font-medium text-[#0066FF] hover:text-[#4d94ff]">
          tienda
        </Link>{" "}
        para agregar productos.
      </p>
    </PrivateChrome>
  );
}
