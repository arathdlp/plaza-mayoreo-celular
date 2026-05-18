"use client";

import { actualizarEstadoSolicitud } from "@/app/admin/servicios/actions";
import type { SolicitudAdminRow } from "@/app/admin/servicios/types";
import {
  BADGE_ESTADO_SOLICITUD,
  ETIQUETAS_ESTADO_SOLICITUD,
  ETIQUETAS_TIPO_SERVICIO,
} from "@/lib/servicios-labels";
import { urlWhatsAppSolicitudServicio } from "@/lib/whatsapp-servicio";
import { ESTADOS_SOLICITUD, type EstadoSolicitud } from "@/types/servicio";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
        <table className="w-full min-w-[1120px] text-left text-sm">
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
              <th className="px-4 py-4">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center text-gray-500">
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
                const whatsappUrl = urlWhatsAppSolicitudServicio({
                  telefono: s.telefono,
                  nombre: s.nombre,
                  tipo_servicio: s.tipo_servicio,
                  marca_equipo: s.marca_equipo,
                  modelo_equipo: s.modelo_equipo,
                });

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
                    <td className="px-4 py-4">
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                        >
                          <WhatsAppIcon className="shrink-0" />
                          Contactar por WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Sin teléfono</span>
                      )}
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
