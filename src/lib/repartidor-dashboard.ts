import { createServiceRoleClient } from "@/lib/supabase/service";

export type EnvioDashboardItem = {
  envioId: number;
  pedidoId: number;
  estado: string;
  clienteNombre: string;
  direccion: string;
  total: number;
  metodoPago: string | null;
  updatedAt: string;
};

export type RepartidorDashboardData = {
  activos: EnvioDashboardItem[];
  historial: EnvioDashboardItem[];
  entregasHoy: number;
  efectivoHoy: number;
};

function mapEnvioRow(
  row: {
    id: number;
    pedido_id: number;
    estado: string;
    updated_at: string;
    pedidos: {
      total: number | string;
      metodo_pago: string | null;
      direccion_entrega: string;
      clientes: { nombre: string } | { nombre: string }[] | null;
    } | null;
  },
): EnvioDashboardItem | null {
  const p = row.pedidos;
  if (!p) return null;
  const c = Array.isArray(p.clientes) ? p.clientes[0] : p.clientes;
  const total = typeof p.total === "string" ? parseFloat(p.total) : Number(p.total);
  return {
    envioId: row.id,
    pedidoId: row.pedido_id,
    estado: row.estado,
    clienteNombre: c?.nombre?.trim() || "Cliente",
    direccion: p.direccion_entrega,
    total,
    metodoPago: p.metodo_pago,
    updatedAt: row.updated_at,
  };
}

export async function loadRepartidorDashboard(
  repartidorId: string,
): Promise<RepartidorDashboardData> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { activos: [], historial: [], entregasHoy: 0, efectivoHoy: 0 };
  }

  const { data } = await supabase
    .from("envios")
    .select(
      `
      id,
      pedido_id,
      estado,
      updated_at,
      pedidos (
        total,
        metodo_pago,
        direccion_entrega,
        clientes ( nombre )
      )
    `,
    )
    .eq("repartidor_id", repartidorId)
    .order("updated_at", { ascending: false });

  const items = (data ?? [])
    .map((r) => mapEnvioRow(r as unknown as Parameters<typeof mapEnvioRow>[0]))
    .filter((x): x is EnvioDashboardItem => x != null);

  const activos = items.filter((i) =>
    ["pendiente", "en_camino", "llegando"].includes(i.estado),
  );

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyIso = hoy.toISOString();

  const entregadosHoy = items.filter(
    (i) => i.estado === "entregado" && i.updatedAt >= hoyIso,
  );

  const historial = items
    .filter((i) => i.estado === "entregado")
    .slice(0, 50);

  const efectivoHoy = entregadosHoy
    .filter((i) => i.metodoPago === "contra_entrega")
    .reduce((s, i) => s + i.total, 0);

  return {
    activos,
    historial,
    entregasHoy: entregadosHoy.length,
    efectivoHoy,
  };
}
