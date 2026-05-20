import PrivateChrome from "@/components/auth/PrivateChrome";
import SignOutButton from "@/components/auth/SignOutButton";
import {
  alertError,
  alertSuccess,
  alertWarning,
  badgeEstado,
  btnPrimary,
  btnSecondary,
  cardStatic,
  priceLg,
  textMuted,
  textSubtle,
} from "@/lib/design-system";
import {
  BADGE_ESTADO_ENVIO,
  ETIQUETAS_ESTADO_ENVIO,
  envioActivo,
} from "@/lib/envio-labels";
import PagoBadges from "@/components/pedidos/PagoBadges";
import PedidoTicketButtons from "@/components/pedidos/PedidoTicketButtons";
import { ENVIOS_DB_COLUMNS, mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import { pedidoTrackingHref } from "@/lib/pedido-tracking";
import type { EnvioRow, EstadoEnvio } from "@/types/envio";
import { formatoPesos } from "@/lib/format";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle } from "lucide-react";
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
  productos: ProductoNombre | ProductoNombre[] | null;
};

type PedidoRowRaw = {
  id: number;
  created_at: string;
  estado: string;
  estado_pago: string | null;
  total: number | string;
  metodo_pago: string | null;
  direccion_entrega: string;
  pedido_items: PedidoItemRow[] | null;
  envios: EnvioDbRow | EnvioDbRow[] | null;
};

type PedidoRow = Omit<PedidoRowRaw, "envios"> & { envio: EnvioRow | null };

function parseNum(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v;
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

function resolverEnvioDb(e: PedidoRowRaw["envios"]): EnvioDbRow | null {
  if (!e) return null;
  return Array.isArray(e) ? e[0] ?? null : e;
}

function mapPedidoRow(raw: PedidoRowRaw): PedidoRow {
  const envioDb = resolverEnvioDb(raw.envios);
  const envio = envioDb
    ? mapEnvioFromDb(envioDb, { direccionEntrega: raw.direccion_entrega })
    : null;
  const { envios: _envios, ...rest } = raw;
  return { ...rest, envio };
}

function PedidoTarjeta({ pedido, ticketBaseUrl }: { pedido: PedidoRow; ticketBaseUrl: string }) {
  const total = parseNum(pedido.total);
  const fecha = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(pedido.created_at));

  const items = pedido.pedido_items ?? [];
  const envio = pedido.envio;
  const envioEstado = envio?.estado as EstadoEnvio | undefined;
  const badge =
    badgeEstado[pedido.estado as keyof typeof badgeEstado] ??
    "border-gray-200 bg-gray-100 text-gray-700";
  const pagado = pedido.estado_pago === "pagado";
  const ticketUrl = `${ticketBaseUrl}/api/pedidos/${pedido.id}/ticket`;
  const puedeRastrear = envio && envioEstado && envioActivo(envioEstado);

  return (
    <article className={`${cardStatic} w-full p-4 sm:p-7`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${textSubtle}`}>Pedido</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-[#111827]">#{pedido.id}</p>
          <p className={`mt-2 break-words text-sm ${textMuted}`}>{fecha}</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <span
            className={`inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-xs font-semibold uppercase tracking-wide ${badge}`}
          >
            {etiquetaEstado(pedido.estado)}
          </span>
          <PagoBadges metodoPago={pedido.metodo_pago} estadoPago={pedido.estado_pago} />
          {envio && envioEstado ? (
            envioEstado === "entregado" ? (
              <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800">
                <CheckCircle className="h-3.5 w-3.5" />
                Entregado
              </span>
            ) : (
              <span
                className={`inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-xs font-semibold ${BADGE_ESTADO_ENVIO[envioEstado]}`}
              >
                {ETIQUETAS_ESTADO_ENVIO[envioEstado]}
              </span>
            )
          ) : null}
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <p className={`text-xs font-bold uppercase tracking-[0.15em] ${textSubtle}`}>Productos</p>
        <ul className="mt-3 divide-y divide-gray-100">
          {items.map((item) => {
            const nombre = resolverNombreProducto(item);
            const pu = parseNum(item.precio_unitario);
            const subtotal = pu * item.cantidad;
            return (
              <li
                key={`${pedido.id}-${item.producto_id}`}
                className="flex min-w-0 items-start justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium leading-snug text-[#111827]">{nombre}</p>
                  <p className={`mt-1 text-sm tabular-nums ${textSubtle}`}>
                    {item.cantidad} × {formatoPesos(pu)}
                  </p>
                </div>
                <p className="shrink-0 text-right font-semibold tabular-nums text-[#111827]">{formatoPesos(subtotal)}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
        <span className={`text-sm font-medium ${textMuted}`}>Total del pedido</span>
        <span className={priceLg}>{formatoPesos(total)}</span>
      </div>
      {puedeRastrear ? (
        <Link
          href={pedidoTrackingHref(pedido.id, envio.repartidor_token)}
          className={`mt-4 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold ${btnPrimary}`}
        >
          Rastrear pedido
        </Link>
      ) : envio && envioEstado === "entregado" ? (
        <Link
          href={pedidoTrackingHref(pedido.id, envio.repartidor_token)}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Ver entrega
        </Link>
      ) : null}
      {pagado ? <PedidoTicketButtons pedidoId={pedido.id} ticketUrl={ticketUrl} /> : null}
    </article>
  );
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const { pago } = await searchParams;
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
      estado_pago,
      total,
      metodo_pago,
      direccion_entrega,
      pedido_items (
        cantidad,
        precio_unitario,
        producto_id,
        productos ( nombre )
      ),
      envios (
        ${ENVIOS_DB_COLUMNS}
      )
    `,
    )
    .eq("cliente_id", user.id)
    .order("created_at", { ascending: false });

  const pedidos = ((pedidosRaw ?? []) as unknown as PedidoRowRaw[]).map(mapPedidoRow);
  const ticketBaseUrl = siteUrl().origin;

  return (
    <PrivateChrome
      title="Mis pedidos"
      description="Consulta el detalle de tus compras, estado de envío y método de pago."
      actions={
        <>
          <Link href="/dashboard" className={`${btnSecondary} px-5 py-2.5 text-sm`}>
            Dashboard
          </Link>
          <SignOutButton />
        </>
      }
    >
      {pago === "exitoso" ? (
        <div role="status" className={`mb-6 ${alertSuccess}`}>
          Pago recibido correctamente. Tu pedido se actualizará en cuanto Mercado Pago confirme el cobro.
        </div>
      ) : null}
      {pago === "pendiente" ? (
        <div role="status" className={`mb-6 ${alertWarning}`}>
          Tu pago está pendiente de confirmación. Te avisaremos cuando se acredite.
        </div>
      ) : null}
      {error ? (
        <div role="alert" className={alertError}>
          No se pudieron cargar los pedidos. Intenta de nuevo más tarde.
        </div>
      ) : pedidos.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-lg font-bold text-[#111827]">Aún no tienes pedidos</p>
          <p className={`mt-2 text-sm ${textMuted}`}>
            Cuando compres en la tienda, tus órdenes aparecerán aquí con el seguimiento actualizado.
          </p>
          <Link href="/productos" className={`mt-8 h-12 px-8 text-sm ${btnPrimary}`}>
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {pedidos.map((p) => (
            <li key={p.id}>
              <PedidoTarjeta pedido={p} ticketBaseUrl={ticketBaseUrl} />
            </li>
          ))}
        </ul>
      )}
    </PrivateChrome>
  );
}
