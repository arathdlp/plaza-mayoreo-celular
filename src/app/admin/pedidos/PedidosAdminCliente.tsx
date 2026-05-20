"use client";

import PedidosEnvioModal from "@/app/admin/pedidos/PedidosEnvioModal";
import type { PedidoAdminRow } from "@/app/admin/pedidos/types";
import AdminEnvioMiniMap from "@/components/tracking/AdminEnvioMiniMap";
import { formatoPesos } from "@/lib/format";
import {
  BADGE_ESTADO_ENVIO,
  ETIQUETAS_ESTADO_ENVIO,
  envioActivo,
} from "@/lib/envio-labels";
import { mapEnvioFromDb, type EnvioDbRow } from "@/lib/envio-db";
import PagoBadges from "@/components/pedidos/PagoBadges";
import { createClient } from "@/lib/supabase/client";
import type { EnvioRow, EstadoEnvio } from "@/types/envio";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [envioModal, setEnvioModal] = useState<{
    pedidoId: number;
    envio: EnvioRow | null;
  } | null>(null);

  useEffect(() => {
    setPedidos(initialPedidos);
  }, [initialPedidos]);

  useEffect(() => {
    if (loadError && loadErrorMessage) {
      console.error("[admin/pedidos] Error al cargar pedidos:", loadErrorMessage);
    }
  }, [loadError, loadErrorMessage]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-pedidos-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "envios" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const row = mapEnvioFromDb(payload.new as EnvioDbRow);
            setPedidos((prev) =>
              prev.map((p) => (p.id === row.pedido_id ? { ...p, envio: row } : p)),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos" },
        (payload) => {
          const row = payload.new as {
            id: number;
            estado: string;
            estado_pago: string | null;
          };
          setPedidos((prev) =>
            prev.map((p) =>
              p.id === row.id
                ? { ...p, estado: row.estado, estado_pago: row.estado_pago }
                : p,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

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
        </div>
      ) : null}

      <div className="mt-10 overflow-x-auto rounded-2xl border border-gray-200 bg-white backdrop-blur-sm">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-4 py-4">ID</th>
              <th className="px-4 py-4">Cliente</th>
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4 text-right">Total</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Envío / mapa</th>
              <th className="px-4 py-4">Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-gray-500">
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
                const mapaActivo = envio && envioEstado && envioActivo(envioEstado);

                return (
                  <tr key={p.id} className="align-top transition-colors hover:bg-gray-50">
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
                      {envio ? (
                        <p className="mt-1 text-[10px] text-gray-400">Actualización automática</p>
                      ) : null}
                    </td>
                    <td className="min-w-[200px] px-4 py-4">
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
                      {envio ? (
                        <a
                          href={`/pedidos/${p.id}/tracking`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-xs font-semibold text-gray-600 hover:text-[#0066FF]"
                        >
                          Ver tracking en vivo
                        </a>
                      ) : null}
                      {mapaActivo && envio ? (
                        <div className="mt-3 w-[200px]">
                          <AdminEnvioMiniMap envio={envio} />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <PagoBadges metodoPago={p.metodo_pago} estadoPago={p.estado_pago} />
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
          onClose={() => {
            setEnvioModal(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
