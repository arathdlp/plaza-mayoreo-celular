import { getAdminServiceSupabase } from "@/app/admin/_lib/supabase-admin";
import PedidosAdminCliente from "@/app/admin/pedidos/PedidosAdminCliente";
import type { PedidoAdminRow } from "@/app/admin/pedidos/types";
import { ENVIOS_DB_SELECT, mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { pageMetadata } from "@/lib/seo";
import type { EnvioRow } from "@/types/envio";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Admin · Pedidos",
  description: "Listado global de pedidos y cambio de estado operativo.",
  path: "/admin/pedidos",
  noindex: true,
});

const PEDIDOS_SELECT = `
  id,
  cliente_id,
  created_at,
  total,
  estado,
  estado_pago,
  metodo_pago,
  direccion_entrega,
  clientes ( nombre, email )
`;

const PEDIDOS_SELECT_LEGACY = `
  id,
  cliente_id,
  created_at,
  total,
  estado,
  direccion_entrega,
  clientes ( nombre, email )
`;

function logSupabaseError(scope: string, error: PostgrestError) {
  console.error(`[admin/pedidos] ${scope}`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function num(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

type ClienteEmbed = { nombre: string; email: string } | { nombre: string; email: string }[] | null;

type PedidoQueryRow = {
  id: number;
  cliente_id: string;
  created_at: string;
  total: number | string;
  estado: string;
  estado_pago?: string | null;
  metodo_pago?: string | null;
  direccion_entrega: string;
  clientes: ClienteEmbed;
};

function resolverCliente(c: ClienteEmbed): { nombre: string; email: string } {
  if (!c) return { nombre: "—", email: "" };
  const row = Array.isArray(c) ? c[0] : c;
  return {
    nombre: row?.nombre?.trim() || "—",
    email: row?.email?.trim() || "",
  };
}

async function fetchPedidosRows(supabase: SupabaseClient) {
  const full = await supabase.from("pedidos").select(PEDIDOS_SELECT).order("created_at", {
    ascending: false,
  });

  if (!full.error) return full;

  logSupabaseError("pedidos (select completo)", full.error);
  const legacy = await supabase.from("pedidos").select(PEDIDOS_SELECT_LEGACY).order("created_at", {
    ascending: false,
  });
  if (legacy.error) {
    logSupabaseError("pedidos (select legacy)", legacy.error);
  }
  return legacy;
}

async function fetchEnviosByPedidoIds(
  supabase: SupabaseClient,
  pedidoIds: number[],
): Promise<{ map: Map<number, EnvioRow>; error: PostgrestError | null }> {
  const map = new Map<number, EnvioRow>();
  if (pedidoIds.length === 0) return { map, error: null };

  const { data, error } = await supabase
    .from("envios")
    .select(ENVIOS_DB_SELECT)
    .in("pedido_id", pedidoIds);

  if (error) {
    logSupabaseError("envios", error);
    return { map, error };
  }

  for (const row of data ?? []) {
    const mapped = mapEnvioFromDb(row as unknown as EnvioDbRow);
    map.set(mapped.pedido_id, mapped);
  }
  return { map, error: null };
}

export default async function AdminPedidosPage() {
  const r = await getAdminServiceSupabase();
  if (!r.ok) {
    redirect("/dashboard");
  }

  const pedidosResult = await fetchPedidosRows(r.supabase);
  const loadError = pedidosResult.error;
  const rows = (pedidosResult.data ?? []) as PedidoQueryRow[];

  const pedidoIds = rows.map((p) => p.id);
  const { map: envioByPedidoId, error: enviosError } = await fetchEnviosByPedidoIds(
    r.supabase,
    pedidoIds,
  );

  if (enviosError) {
    console.warn("[admin/pedidos] Pedidos cargados sin datos de envío.");
  }

  const pedidos: PedidoAdminRow[] = rows.map((row) => {
    const cli = resolverCliente(row.clientes);
    return {
      id: row.id,
      cliente_id: row.cliente_id,
      created_at: row.created_at,
      total: num(row.total),
      estado: row.estado,
      estado_pago: row.estado_pago ?? null,
      metodo_pago: row.metodo_pago ?? null,
      clienteNombre: cli.nombre,
      clienteEmail: cli.email,
      envio: envioByPedidoId.get(row.id) ?? null,
    };
  });

  const loadErrorMessage = loadError
    ? `${loadError.message}${loadError.hint ? ` (${loadError.hint})` : ""}`
    : null;

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

        <PedidosAdminCliente
          initialPedidos={pedidos}
          loadError={!!loadError}
          loadErrorMessage={loadErrorMessage}
        />
      </div>
    </main>
  );
}
