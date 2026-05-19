import TrackingView from "@/app/pedidos/[id]/tracking/TrackingView";
import { ENVIOS_DB_SELECT, mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: `Rastreo pedido #${id}`,
    description: "Sigue tu entrega en tiempo real.",
    path: `/pedidos/${id}/tracking`,
    noindex: true,
  });
}

export default async function PedidoTrackingPage({ params }: Props) {
  const { id: raw } = await params;
  const pedidoId = Number.parseInt(raw, 10);
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/pedidos/${pedidoId}/tracking`);

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, direccion_entrega, clientes ( nombre, telefono )")
    .eq("id", pedidoId)
    .eq("cliente_id", user.id)
    .maybeSingle();

  if (!pedido) notFound();

  const { data: envioRaw } = await supabase
    .from("envios")
    .select(ENVIOS_DB_SELECT)
    .eq("pedido_id", pedidoId)
    .maybeSingle();

  if (!envioRaw) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold text-[#111827]">Sin envío asignado</h1>
        <p className="mt-2 text-sm text-gray-600">
          Este pedido aún no tiene seguimiento activo.
        </p>
        <Link href="/pedidos" className="mt-6 text-sm font-semibold text-[#0066FF] hover:underline">
          Volver a mis pedidos
        </Link>
      </main>
    );
  }

  const envio = mapEnvioFromDb(envioRaw as unknown as EnvioDbRow, {
    direccionEntrega: pedido.direccion_entrega as string,
  });

  const clientes = pedido.clientes as
    | { nombre: string; telefono: string }
    | { nombre: string; telefono: string }[]
    | null;
  const cli = Array.isArray(clientes) ? clientes[0] : clientes;

  return (
    <TrackingView
      pedidoId={pedidoId}
      initialEnvio={envio}
      clienteNombre={cli?.nombre}
      clienteTelefono={cli?.telefono}
    />
  );
}
