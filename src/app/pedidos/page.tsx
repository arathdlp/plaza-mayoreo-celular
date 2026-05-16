import PrivateChrome from "@/components/auth/PrivateChrome";
import SignOutButton from "@/components/auth/SignOutButton";
import { formatoPesos } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Mis pedidos",
  description: "Consulta el estado, total y detalle de tus compras en Plaza Mayoreo del Celular.",
  path: "/pedidos",
  noindex: true,
});

type ProductoNombre = { nombre: string };

type PedidoItemRow = {
  cantidad: number;
  precio_unitario: number | string;
  producto_id: number;
  /** Supabase puede tipar la FK como objeto o arreglo de un elemento */
  productos: ProductoNombre | ProductoNombre[] | null;
};

type PedidoRow = {
  id: number;
  created_at: string;
  estado: string;
  total: number | string;
  metodo_pago: string | null;
  pedido_items: PedidoItemRow[] | null;
};

function parseNum(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

function etiquetaMetodo(m: string | null): string {
  if (m === "mercado_pago") return "Mercado Pago";
  return "Pagar al recibir";
}

function etiquetaEstado(estado: string): string {
  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    preparando: "Preparando",
    enviado: "Enviado",
    entregado: "Entregado",
  };
  return labels[estado] ?? estado;
}

function resolverNombreProducto(item: PedidoItemRow): string {
  const p = item.productos;
  const row = Array.isArray(p) ? p[0] : p;
  return row?.nombre?.trim() || `Producto #${item.producto_id}`;
}

function badgeEstadoClass(estado: string): string {
  const map: Record<string, string> = {
    pendiente: "border-amber-400/40 bg-amber-500/[0.14] text-amber-100",
    preparando: "border-sky-400/40 bg-sky-500/[0.14] text-sky-100",
    enviado: "border-violet-400/40 bg-violet-500/[0.14] text-violet-100",
    entregado: "border-emerald-400/40 bg-emerald-500/[0.14] text-emerald-100",
  };
  return (
    map[estado] ??
    "border-white/20 bg-white/[0.08] text-white/80"
  );
}

function PedidoTarjeta({ pedido }: { pedido: PedidoRow }) {
  const total = parseNum(pedido.total);
  const fecha = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(pedido.created_at));

  const items = pedido.pedido_items ?? [];

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">Pedido</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-white">#{pedido.id}</p>
          <p className="mt-2 text-sm text-white/55">{fecha}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeEstadoClass(pedido.estado)}`}
          >
            {etiquetaEstado(pedido.estado)}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-medium text-white/75">
            {etiquetaMetodo(pedido.metodo_pago)}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/45">Productos</p>
        <ul className="mt-3 divide-y divide-white/[0.08]">
          {items.map((item) => {
            const nombre = resolverNombreProducto(item);
            const pu = parseNum(item.precio_unitario);
            const subtotal = pu * item.cantidad;
            return (
              <li
                key={`${pedido.id}-${item.producto_id}`}
                className="flex items-start justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-white">{nombre}</p>
                  <p className="mt-1 text-xs tabular-nums text-white/45">
                    {item.cantidad} × {formatoPesos(pu)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums text-white">{formatoPesos(subtotal)}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <span className="text-sm font-medium text-white/65">Total del pedido</span>
        <span className="text-xl font-semibold tabular-nums tracking-tight text-white">{formatoPesos(total)}</span>
      </div>
    </article>
  );
}

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/pedidos");
  }

  const { data: pedidosRaw, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      created_at,
      estado,
      total,
      metodo_pago,
      pedido_items (
        cantidad,
        precio_unitario,
        producto_id,
        productos ( nombre )
      )
    `,
    )
    .eq("cliente_id", user.id)
    .order("created_at", { ascending: false });

  const pedidos = (pedidosRaw ?? []) as unknown as PedidoRow[];

  return (
    <PrivateChrome
      title="Mis pedidos"
      description="Consulta el detalle de tus compras, estado de envío y método de pago."
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
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          No se pudieron cargar los pedidos. Intenta de nuevo más tarde.
        </div>
      ) : pedidos.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-lg font-medium text-white/75">Aún no tienes pedidos</p>
          <p className="mt-2 text-sm text-white/50">
            Cuando compres en la tienda, tus órdenes aparecerán aquí con el seguimiento actualizado.
          </p>
          <Link
            href="/productos"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-all duration-300 hover:bg-[#3385ff]"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {pedidos.map((p) => (
            <li key={p.id}>
              <PedidoTarjeta pedido={p} />
            </li>
          ))}
        </ul>
      )}
    </PrivateChrome>
  );
}
