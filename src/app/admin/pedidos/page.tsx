import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import PedidosAdminCliente from "@/app/admin/pedidos/PedidosAdminCliente";
import type { PedidoAdminRow } from "@/app/admin/pedidos/types";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Admin · Pedidos",
  description: "Listado global de pedidos y cambio de estado operativo.",
  path: "/admin/pedidos",
  noindex: true,
});

function num(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

type ClienteEmbed = { nombre: string; email: string } | { nombre: string; email: string }[] | null;

function resolverCliente(c: ClienteEmbed): { nombre: string; email: string } {
  if (!c) return { nombre: "—", email: "" };
  const row = Array.isArray(c) ? c[0] : c;
  return {
    nombre: row?.nombre?.trim() || "—",
    email: row?.email?.trim() || "",
  };
}

export default async function AdminPedidosPage() {
  const r = await getAdminSupabase();
  if (!r.ok) {
    redirect("/dashboard");
  }

  const { data, error } = await r.supabase
    .from("pedidos")
    .select(
      `id, cliente_id, created_at, total, estado, estado_pago, metodo_pago,
       clientes ( nombre, email ),
       envios (
         id, pedido_id, tipo, estado, lat_actual, lng_actual, destino_lat, destino_lng,
         direccion_destino, repartidor_nombre, repartidor_telefono, paqueteria_empresa,
         numero_guia, repartidor_token, tiempo_estimado_minutos, updated_at
       )`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/pedidos]", error.message);
  }

  const pedidos: PedidoAdminRow[] = (data ?? []).map((row: Record<string, unknown>) => {
    const cli = resolverCliente(row.clientes as ClienteEmbed);
    return {
      id: row.id as number,
      cliente_id: row.cliente_id as string,
      created_at: row.created_at as string,
      total: num(row.total as number | string),
      estado: row.estado as string,
      estado_pago: (row.estado_pago as string | null) ?? null,
      metodo_pago: (row.metodo_pago as string | null) ?? null,
      clienteNombre: cli.nombre,
      clienteEmail: cli.email,
      envio: (() => {
        const e = row.envios;
        if (!e) return null;
        const rowE = Array.isArray(e) ? e[0] : e;
        return rowE ? (rowE as import("@/types/envio").EnvioRow) : null;
      })(),
    };
  });

  return (
    <main className="relative px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Operaciones</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">Pedidos</h1>
          <p className="mt-2 text-sm text-gray-500">
            Actualiza el estado operativo de cada pedido; los clientes lo ven en su historial.
          </p>
        </div>

        <PedidosAdminCliente initialPedidos={pedidos} loadError={!!error} />
      </div>
    </main>
  );
}
