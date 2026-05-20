"use client";

import { logoutRepartidorAction } from "@/app/repartidor/login/actions";
import type { RepartidorDashboardData } from "@/lib/repartidor-dashboard";
import type { RepartidorSession } from "@/lib/repartidor-session";
import { formatoPesos } from "@/lib/format";
import { badgesPagoPedido } from "@/lib/pedido-pago";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  session: RepartidorSession;
  data: RepartidorDashboardData;
};

export default function RepartidorDashboardClient({ session, data }: Props) {
  const [filtro, setFiltro] = useState<"todos" | "7" | "30">("todos");

  const historialFiltrado = useMemo(() => {
    if (filtro === "todos") return data.historial;
    const days = filtro === "7" ? 7 : 30;
    const desde = new Date();
    desde.setDate(desde.getDate() - days);
    return data.historial.filter((h) => new Date(h.updatedAt) >= desde);
  }, [data.historial, filtro]);

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0066FF]">Repartidor</p>
            <h1 className="text-lg font-bold text-[#111827]">{session.nombre}</h1>
          </div>
          <form action={logoutRepartidorAction}>
            <button
              type="submit"
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">Entregas hoy</p>
            <p className="mt-1 text-3xl font-bold text-[#111827]">{data.entregasHoy}</p>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-orange-800">Efectivo a entregar hoy</p>
            <p className="mt-1 text-3xl font-bold text-orange-900">{formatoPesos(data.efectivoHoy)}</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#111827]">Envíos activos</h2>
          <div className="mt-4 space-y-3">
            {data.activos.length === 0 ? (
              <p className="text-sm text-gray-500">No tienes entregas activas.</p>
            ) : (
              data.activos.map((e) => (
                <article key={e.envioId} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="font-bold text-[#111827]">{e.clienteNombre}</p>
                  <p className="mt-1 text-sm text-gray-600">{e.direccion}</p>
                  <p className="mt-2 text-sm font-semibold text-[#111827]">{formatoPesos(e.total)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {badgesPagoPedido(
                      e.metodoPago,
                      e.metodoPago === "contra_entrega" ? "pendiente" : "pagado",
                    ).map((b) => (
                      <span
                        key={b.label}
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${b.className}`}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/repartidor/${e.envioId}`}
                    className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-[#0066FF] text-sm font-bold text-white"
                  >
                    Ver entrega →
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#111827]">Historial</h2>
            <select
              value={filtro}
              onChange={(ev) => setFiltro(ev.target.value as typeof filtro)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="todos">Últimos 30 días</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
            </select>
          </div>
          <ul className="mt-4 space-y-2">
            {historialFiltrado.map((h) => (
              <li
                key={h.envioId}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm"
              >
                <span>
                  #{h.pedidoId} · {h.clienteNombre}
                </span>
                <span className="text-gray-500">{formatoPesos(h.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
