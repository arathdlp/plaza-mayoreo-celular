"use client";

import {
  actualizarRepartidor,
  crearRepartidor,
  toggleRepartidorActivo,
  type RepartidorAdminRow,
} from "@/app/admin/repartidores/actions";
import { cardStatic } from "@/lib/design-system";
import { appToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { initialRepartidores: RepartidorAdminRow[] };

type FormState = {
  nombre: string;
  telefono: string;
  email: string;
  password: string;
};

const emptyForm: FormState = { nombre: "", telefono: "", email: "", password: "" };

export default function RepartidoresAdminCliente({ initialRepartidores }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RepartidorAdminRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(r: RepartidorAdminRow) {
    setEditing(r);
    setForm({ nombre: r.nombre, telefono: r.telefono, email: r.email, password: "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = editing
      ? await actualizarRepartidor({
          id: editing.id,
          nombre: form.nombre,
          telefono: form.telefono,
          email: form.email,
          password: form.password || undefined,
        })
      : await crearRepartidor(form);
    setSaving(false);
    if (!res.ok) {
      appToast.error(res.error);
      return;
    }
    appToast.perfilGuardado();
    setModalOpen(false);
    router.refresh();
  }

  async function handleToggle(r: RepartidorAdminRow) {
    const res = await toggleRepartidorActivo(r.id, !r.activo);
    if (!res.ok) {
      appToast.error(res.error);
      return;
    }
    appToast.perfilGuardado();
    router.refresh();
  }

  return (
    <main className="relative px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Operaciones</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">Repartidores</h1>
            <p className="mt-2 text-sm text-gray-500">Cuentas para la app de entregas y métricas por repartidor.</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0066FF]/25"
          >
            + Nuevo repartidor
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {initialRepartidores.map((r) => (
            <article key={r.id} className={`${cardStatic} p-6`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">{r.nombre}</h2>
                  <p className="mt-1 text-sm text-gray-600">{r.email}</p>
                  <p className="text-sm text-gray-500">{r.telefono}</p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    r.activo
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                <div className="rounded-xl bg-gray-50 p-2">
                  <p className="font-bold text-[#111827]">{r.entregasHoy}</p>
                  <p className="text-gray-500">Hoy</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-2">
                  <p className="font-bold text-[#111827]">{r.entregasSemana}</p>
                  <p className="text-gray-500">Semana</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-2">
                  <p className="font-bold text-[#111827]">{r.entregasMes}</p>
                  <p className="text-gray-500">Mes</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-2">
                  <p className="font-bold text-[#111827]">{r.totalEntregados}</p>
                  <p className="text-gray-500">Total</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(r)}
                  className="flex-1 rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleToggle(r)}
                  className="flex-1 rounded-full border border-[#0066FF]/30 py-2 text-sm font-semibold text-[#0066FF] hover:bg-[#0066FF]/5"
                >
                  {r.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {initialRepartidores.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">Aún no hay repartidores registrados.</p>
        ) : null}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-[#111827]">
              {editing ? "Editar repartidor" : "Nuevo repartidor"}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Teléfono"
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                required
                type="tel"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                type="email"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required={!editing}
                type="password"
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-[#0066FF] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
