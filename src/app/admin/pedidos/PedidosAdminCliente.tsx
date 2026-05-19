"use client";

import { actualizarEstadoPedido } from "@/app/admin/pedidos/actions";
import PedidosEnvioModal from "@/app/admin/pedidos/PedidosEnvioModal";
import type { PedidoAdminRow } from "@/app/admin/pedidos/types";
import { formatoPesos } from "@/lib/format";
import {
  BADGE_ESTADO_ENVIO,
  ETIQUETAS_ESTADO_ENVIO,
} from "@/lib/envio-labels";
import {
  claseBadgeEstadoPago,
  etiquetaEstadoPago,
  mostrarEstadoPago,
} from "@/lib/pedido-pago";
import type { EnvioRow, EstadoEnvio } from "@/types/envio";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const ESTADOS = ["pendiente", "preparando", "enviado", "entregado"] as const;

function etiquetaMetodo(m: string | null): string {
  if (m === "mercado_pago") return "Mercado Pago";
  return "Pagar al recibir";
}

function etiquetaEstado(e: string): string {
  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    preparando: "Preparando",
    enviado: "Enviado",
    entregado: "Entregado",
  };
  return labels[e] ?? e;
}

type Props = {
  initialPedidos: PedidoAdminRow[];
  loadError: boolean;
  loadErrorMessage?: string | null;
};

export default function PedidosAdminCliente({
  initialPedidos,
  loadError,
  loadErrorMessage,
}: Props) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState(initialPedidos);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [envioModal, setEnvioModal] = useState<{
    pedidoId: number;
    envio: EnvioRow | null;
  } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPedidos(initialPedidos);
  }, [initialPedidos]);

  useEffect(() => {
    if (loadError && loadErrorMessage) {
      console.error("[admin/pedidos] Error al cargar pedidos:", loadErrorMessage);
    }
  }, [loadError, loadErrorMessage]);

  function onEstadoChange(pedidoId: number, nuevo: string) {
    const prev = pedidos;
    setPedidos((rows) => rows.map((r) => (r.id === pedidoId ? { ...r, estado: nuevo } : r)));
    setPendingId(pedidoId);
    startTransition(async () => {
      const res = await actualizarEstadoPedido(pedidoId, nuevo);
      setPendingId(null);
      if (!res.ok) {
        setPedidos(prev);
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      {loadError ? (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          No se pudieron cargar los pedidos desde Supabase.
          {loadErrorMessage ? (
            <p className="mt-2 font-mono text-xs text-red-600/90">{loadErrorMessage}</p>
          ) : null}
          <p className="mt-2 text-xs text-red-600/80">
            Revisa la consola del servidor (terminal) para el detalle completo de Supabase.
          </p>
        </div>
      ) : null}

      <div className="mt-10 overflow-x-auto rounded-2xl border border-gray-200 bg-white backdrop-blur-sm">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-4 py-4">ID</th>
              <th className="px-4 py-4">Cliente</th>
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4 text-right">Total</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Envío</th>
              <th className="px-4 py-4">Estado pago</th>
              <th className="px-4 py-4">Método</th>
              <th className="px-4 py-4">Cambiar estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center text-gray-500">
                  No hay pedidos registrados todavía.
                </td>
              </tr>
            ) : (
              pedidos.map((p) => {
                const fecha = new Intl.DateTimeFormat("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(p.created_at));
                const envio = p.envio;
                const envioEstado = (envio?.estado ?? null) as EstadoEnvio | null;

                return (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold tabular-nums text-[#111827]">#{p.id}</td>
                    <td className="max-w-[220px] px-4 py-4">
                      <p className="truncate font-medium text-[#111827]">{p.clienteNombre}</p>
                      {p.clienteEmail ? (
                        <p className="truncate text-xs text-gray-400">{p.clienteEmail}</p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600">{fecha}</td>
                    <td className="px-4 py-4 text-right text-base font-semibold tabular-nums text-[#111827]">
                      {formatoPesos(p.total)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {etiquetaEstado(p.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {envio && envioEstado ? (
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${BADGE_ESTADO_ENVIO[envioEstado]}`}
                        >
                          {ETIQUETAS_ESTADO_ENVIO[envioEstado]}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin envío</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEnvioModal({ pedidoId: p.id, envio })}
                        className="mt-2 block text-xs font-semibold text-[#0066FF] hover:underline"
                      >
                        {envio ? "Gestionar envío" : "Asignar envío"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      {mostrarEstadoPago(p.metodo_pago, p.estado_pago) ? (
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${claseBadgeEstadoPago(p.estado_pago)}`}
                        >
                          {etiquetaEstadoPago(p.estado_pago)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{etiquetaMetodo(p.metodo_pago)}</td>
                    <td className="px-4 py-4">
                      <select
                        value={p.estado}
                        disabled={pendingId === p.id}
                        onChange={(e) => onEstadoChange(p.id, e.target.value)}
                        className="w-full max-w-[180px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#111827] outline-none transition-colors focus:border-[#0066FF]/50 disabled:opacity-50"
                      >
                        {ESTADOS.map((est) => (
                          <option key={est} value={est}>
                            {etiquetaEstado(est)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {envioModal ? (
        <PedidosEnvioModal
          pedidoId={envioModal.pedidoId}
          envio={envioModal.envio}
          onClose={() => setEnvioModal(null)}
        />
      ) : null}
    </>
  );
}
