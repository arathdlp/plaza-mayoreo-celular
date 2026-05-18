import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PedidoConfirmadoView from "./PedidoConfirmadoView";

export const metadata: Metadata = pageMetadata({
  title: "Pedido confirmado",
  description: "Tu compra en Plaza Mayoreo del Celular fue registrada correctamente.",
  path: "/pedido-confirmado",
  noindex: true,
});

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

function parsePedidoId(raw: string | undefined): number | null {
  if (!raw?.trim()) return null;
  const id = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

export default async function PedidoConfirmadoPage({ searchParams }: PageProps) {
  const { id: idRaw } = await searchParams;
  const pedidoId = parsePedidoId(idRaw);

  if (pedidoId == null) {
    redirect("/productos");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/pedido-confirmado?id=${pedidoId}`)}`);
  }

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .select("id, total, metodo_pago")
    .eq("id", pedidoId)
    .eq("cliente_id", user.id)
    .maybeSingle();

  if (error || !pedido) {
    redirect("/productos");
  }

  const total =
    typeof pedido.total === "string" ? parseFloat(pedido.total) : Number(pedido.total);

  return (
    <>
      <Header />
      <PedidoConfirmadoView
        pedido={{
          id: pedido.id as number,
          total,
          metodo_pago: (pedido.metodo_pago as string | null) ?? null,
        }}
      />
      <Footer />
    </>
  );
}
