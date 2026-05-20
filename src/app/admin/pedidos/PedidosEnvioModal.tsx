"use client";

import {
  asignarEnvioPedido,
  getRepartidoresSelect,
  type AsignarEnvioInput,
} from "@/app/admin/pedidos/envio-actions";
import { appToast } from "@/lib/toast";
import {
  BADGE_ESTADO_ENVIO,
  ETIQUETAS_ESTADO_ENVIO,
  linkRepartidor,
} from "@/lib/envio-labels";
import { createClient } from "@/lib/supabase/client";
import type { EnvioRow, EstadoEnvio, TipoEnvio } from "@/types/envio";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  pedidoId: number;
  envio: EnvioRow | null;
  onClose: () => void;
};

export default function PedidosEnvioModal({ pedidoId, envio, onClose }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoEnvio>((envio?.tipo as TipoEnvio) ?? "local");
  const [repartidorId, setRepartidorId] = useState(envio?.repartidor_id ?? "");
  const [repartidorNombre, setRepartidorNombre] = useState(envio?.repartidor_nombre ?? "");
  const [repartidorTelefono, setRepartidorTelefono] = useState(envio?.repartidor_telefono ?? "");
  const [repartidores, setRepartidores] = useState<
    { id: string; nombre: string; telefono: string; email: string }[]
  >([]);
  const [paqueteriaEmpresa, setPaqueteriaEmpresa] = useState(envio?.paqueteria_empresa ?? "");
  const [numeroGuia, setNumeroGuia] = useState(envio?.numero_guia ?? "");
  const [tiempoEstimado, setTiempoEstimado] = useState(
    envio?.tiempo_estimado_minutos?.toString() ?? "",
  );
  const [liveEnvio, setLiveEnvio] = useState<EnvioRow | null>(envio);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tokenLink, setTokenLink] = useState<{ envioId: number; token: string } | null>(
    envio ? { envioId: envio.id, token: envio.repartidor_token } : null,
  );

  useEffect(() => {
    if (tipo !== "local") return;
    void getRepartidoresSelect().then((list) => setRepartidores(list));
  }, [tipo]);

  useEffect(() => {
    if (!liveEnvio?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-envio-${liveEnvio.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "envios",
          filter: `id=eq.${liveEnvio.id}`,
        },
        (payload) => {
          setLiveEnvio((prev) => (prev ? { ...prev, ...(payload.new as EnvioRow) } : prev));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [liveEnvio?.id]);

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const input: AsignarEnvioInput = {
      pedidoId,
      tipo,
      repartidorId: repartidorId || undefined,
      repartidorNombre,
      repartidorTelefono,
      paqueteriaEmpresa,
      numeroGuia,
      tiempoEstimadoMinutos: tiempoEstimado ? Number.parseInt(tiempoEstimado, 10) : null,
    };
    const res = await asignarEnvioPedido(input);
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    appToast.success(liveEnvio ? "Envío actualizado" : "Envío asignado");
    setTokenLink({ envioId: res.envioId, token: res.token });
    router.refresh();
  }

  async function copiarLink() {
    if (!tokenLink) return;
    const url = linkRepartidor(tokenLink.envioId, tokenLink.token);
    await navigator.clipboard.writeText(url);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  const estado = (liveEnvio?.estado ?? "pendiente") as EstadoEnvio;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Envío · Pedido #{pedidoId}</h2>
            {liveEnvio ? (
              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE_ESTADO_ENVIO[estado]}`}
              >
                {ETIQUETAS_ESTADO_ENVIO[estado]}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleGuardar} className="mt-6 space-y-4">
          {error ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoEnvio)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#111827]"
            >
              <option value="local">Entrega local (GPS)</option>
              <option value="paqueteria">Paquetería</option>
            </select>
          </div>

          {tipo === "local" ? (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600">Repartidor</label>
                <select
                  value={repartidorId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setRepartidorId(id);
                    const rep = repartidores.find((r) => r.id === id);
                    if (rep) {
                      setRepartidorNombre(rep.nombre);
                      setRepartidorTelefono(rep.telefono);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar repartidor…</option>
                  {repartidores.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} · {r.telefono}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Nombre del repartidor</label>
                <input
                  value={repartidorNombre}
                  onChange={(e) => setRepartidorNombre(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Teléfono del repartidor</label>
                <input
                  value={repartidorTelefono}
                  onChange={(e) => setRepartidorTelefono(e.target.value)}
                  required
                  type="tel"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600">Empresa</label>
                <input
                  value={paqueteriaEmpresa}
                  onChange={(e) => setPaqueteriaEmpresa(e.target.value)}
                  required
                  placeholder="DHL, FedEx…"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Número de guía</label>
                <input
                  value={numeroGuia}
                  onChange={(e) => setNumeroGuia(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600">Tiempo estimado (min, opcional)</label>
            <input
              value={tiempoEstimado}
              onChange={(e) => setTiempoEstimado(e.target.value)}
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-[#0066FF] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando…" : liveEnvio ? "Actualizar envío" : "Asignar envío"}
          </button>
        </form>

        {tokenLink && tipo === "local" ? (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => void copiarLink()}
              className="w-full rounded-full border border-[#0066FF]/40 bg-[#0066FF]/5 py-3 text-sm font-semibold text-[#0066FF]"
            >
              {linkCopiado ? "¡Link copiado!" : "Copiar link del repartidor"}
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Envíalo por WhatsApp al repartidor
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
