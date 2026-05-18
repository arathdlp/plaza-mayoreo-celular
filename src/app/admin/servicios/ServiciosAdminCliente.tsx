"use client";

import { actualizarEstadoSolicitud } from "@/app/admin/servicios/actions";
import type { SolicitudAdminRow } from "@/app/admin/servicios/types";
import {
  BADGE_ESTADO_SOLICITUD,
  ETIQUETAS_ESTADO_SOLICITUD,
  ETIQUETAS_TIPO_SERVICIO,
} from "@/lib/servicios-labels";
import { ESTADOS_SOLICITUD, type EstadoSolicitud } from "@/types/servicio";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Props = {
  initialSolicitudes: SolicitudAdminRow[];
  loadError: boolean;
};

function textoEquipo(marca: string | null, modelo: string | null): string {
  const parts = [marca?.trim(), modelo?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

export default function ServiciosAdminCliente({ initialSolicitudes, loadError }: Props) {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setSolicitudes(initialSolicitudes);
  }, [initialSolicitudes]);

  function onEstadoChange(solicitudId: number, nuevo: EstadoSolicitud) {
    const prev = solicitudes;
    setSolicitudes((rows) =>
      rows.map((r) => (r.id === solicitudId ? { ...r, estado: nuevo } : r)),
    );
    setPendingId(solicitudId);
    startTransition(async () => {
      const res = await actualizarEstadoSolicitud(solicitudId, nuevo);
      setPendingId(null);
      if (!res.ok) {
        setSolicitudes(prev);
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
          No se pudieron cargar las solicitudes desde Supabase.
        </div>
      ) : null}

      <div className="mt-10 overflow-x-auto rounded-2xl border border-gray-200 bg-white backdrop-blur-sm">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-4 py-4">#ID</th>
              <th className="px-4 py-4">Nombre</th>
              <th className="px-4 py-4">Teléfono</th>
              <th className="px-4 py-4">Tipo</th>
              <th className="px-4 py-4">Equipo</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4">Cambiar estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-gray-500">
                  No hay solicitudes de servicio todavía.
                </td>
              </tr>
            ) : (
              solicitudes.map((s) => {
                const fecha = new Intl.DateTimeFormat("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(s.created_at));
                const estado = s.estado as EstadoSolicitud;

                return (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold tabular-nums text-[#111827]">#{s.id}</td>
                    <td className="max-w-[180px] px-4 py-4">
                      <p className="truncate font-medium text-[#111827]">{s.nombre}</p>
                      <p className="truncate text-xs text-gray-400">{s.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600">{s.telefono}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {ETIQUETAS_TIPO_SERVICIO[s.tipo_servicio]}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-4 text-gray-600">
                      {textoEquipo(s.marca_equipo, s.modelo_equipo)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${BADGE_ESTADO_SOLICITUD[estado]}`}
                      >
                        {ETIQUETAS_ESTADO_SOLICITUD[estado]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600">{fecha}</td>
                    <td className="px-4 py-4">
                      <select
                        value={s.estado}
                        disabled={pendingId === s.id}
                        onChange={(e) => onEstadoChange(s.id, e.target.value as EstadoSolicitud)}
                        className="w-full max-w-[180px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#111827] outline-none transition-colors focus:border-[#0066FF]/50 disabled:opacity-50"
                      >
                        {ESTADOS_SOLICITUD.map((est) => (
                          <option key={est} value={est}>
                            {ETIQUETAS_ESTADO_SOLICITUD[est]}
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
    </>
  );
}
