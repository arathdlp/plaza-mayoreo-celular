import TrackingClient from "./TrackingClient";
import { loadPedidoTracking, pedidoTrackingHref } from "@/lib/pedido-tracking";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: `Rastreo pedido #${id}`,
    description: "Sigue tu entrega en tiempo real.",
    path: `/pedidos/${id}/tracking`,
    noindex: true,
  });
}

function SinEnvio({ pedidoId, signedIn }: { pedidoId: number; signedIn: boolean }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-bold text-[#111827]">Sin envío asignado</h1>
      <p className="mt-2 text-sm text-gray-600">
        El pedido #{pedidoId} aún no tiene seguimiento activo.
      </p>
      {signedIn ? (
        <Link href="/pedidos" className="mt-6 text-sm font-semibold text-[#0066FF] hover:underline">
          Volver a mis pedidos
        </Link>
      ) : (
        <Link href="/" className="mt-6 text-sm font-semibold text-[#0066FF] hover:underline">
          Ir al inicio
        </Link>
      )}
    </main>
  );
}

function AccesoDenegado({ pedidoId, signedIn }: { pedidoId: number; signedIn: boolean }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-bold text-[#111827]">No pudimos abrir el rastreo</h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        Usa el enlace completo que te enviamos (incluye el código de seguimiento) o inicia sesión con la
        cuenta que realizó el pedido #{pedidoId}.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {!signedIn ? (
          <Link
            href={`/login?next=${encodeURIComponent(pedidoTrackingHref(pedidoId))}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
          >
            Iniciar sesión
          </Link>
        ) : null}
        <Link
          href={signedIn ? "/pedidos" : "/"}
          className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-800"
        >
          {signedIn ? "Mis pedidos" : "Inicio"}
        </Link>
      </div>
    </main>
  );
}

export default async function PedidoTrackingPage({ params, searchParams }: Props) {
  const { id: raw } = await params;
  const { token } = await searchParams;
  const pedidoId = Number.parseInt(raw, 10);
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await loadPedidoTracking(pedidoId, {
    userId: user?.id,
    token,
  });

  if (!result.ok) {
    if (result.reason === "pedido_not_found") notFound();
    if (result.reason === "no_envio") {
      return <SinEnvio pedidoId={pedidoId} signedIn={Boolean(user)} />;
    }
    return <AccesoDenegado pedidoId={pedidoId} signedIn={Boolean(user)} />;
  }

  const { data } = result;
  const guest = !user;

  return (
    <TrackingClient
      pedidoId={pedidoId}
      initialEnvio={data.envio}
      clienteNombre={data.clienteNombre}
      clienteTelefono={data.clienteTelefono}
      total={data.total}
      metodoPago={data.metodoPago}
      direccionEntrega={data.direccionEntrega}
      pedidoEstado={data.pedidoEstado}
      items={data.items}
      accessToken={guest ? data.accessToken : undefined}
      backHref={guest ? "/" : "/pedidos"}
    />
  );
}
