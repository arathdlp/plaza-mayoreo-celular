import { getAdminSupabase } from "@/app/admin/_lib/supabase-admin";
import PedidosAdminCliente from "@/app/admin/pedidos/PedidosAdminCliente";
import type { PedidoAdminRow } from "@/app/admin/pedidos/types";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Pedidos | Plaza Mayoreo del Celular",
  description: "Gestión de pedidos.",
};

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
    .select("id, cliente_id, created_at, total, estado, metodo_pago, clientes ( nombre, email )")
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
      metodo_pago: (row.metodo_pago as string | null) ?? null,
      clienteNombre: cli.nombre,
      clienteEmail: cli.email,
    };
  });

  return (
    <main className="relative px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Operaciones</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Pedidos</h1>
          <p className="mt-2 text-sm text-white/55">
            Actualiza el estado operativo de cada pedido; los clientes lo ven en su historial.
          </p>
        </div>

        <PedidosAdminCliente initialPedidos={pedidos} loadError={!!error} />
      </div>
    </main>
  );
}
