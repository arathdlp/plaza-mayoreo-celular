"use client";

import { actualizarPerfil, type PerfilStats } from "@/app/perfil/actions";
import { appToast } from "@/lib/toast";
import { btnPrimary, cardStatic, labelClass, textMuted } from "@/lib/design-system";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";

type Props = {
  perfil: { nombre: string; email: string; telefono: string; direccion: string };
  stats: PerfilStats;
};

export default function PerfilForm({ perfil, stats }: Props) {
  const [nombre, setNombre] = useState(perfil.nombre);
  const [telefono, setTelefono] = useState(perfil.telefono);
  const [direccion, setDireccion] = useState(perfil.direccion);
  const [pending, startTransition] = useTransition();

  const fechaRegistro = stats.createdAt
    ? new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(stats.createdAt))
    : "—";

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await actualizarPerfil({ nombre, telefono, direccion });
      if (!res.ok) {
        appToast.error(res.error);
        return;
      }
      appToast.perfilGuardado();
    });
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_280px]">
      <motion.form
        onSubmit={guardar}
        className={`${cardStatic} p-6 sm:p-8`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-bold text-[#111827]">Datos personales</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>Estos datos se usan en checkout y entregas.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="perfil-nombre" className={labelClass}>
              Nombre completo
            </label>
            <input
              id="perfil-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0066FF]/50"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Correo</label>
            <input
              value={perfil.email}
              disabled
              className="mt-1.5 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="perfil-tel" className={labelClass}>
              Teléfono
            </label>
            <input
              id="perfil-tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0066FF]/50"
              placeholder="443 540 2474"
              required
            />
          </div>
          <div>
            <label htmlFor="perfil-dir" className={labelClass}>
              Dirección habitual
            </label>
            <textarea
              id="perfil-dir"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0066FF]/50"
              placeholder="Calle, colonia, referencias…"
            />
          </div>
        </div>

        <button type="submit" disabled={pending} className={`mt-8 h-12 w-full sm:w-auto sm:px-10 ${btnPrimary}`}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </motion.form>

      <motion.aside
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className={`${cardStatic} p-6`}>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">Resumen</p>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Pedidos</dt>
              <dd className="text-2xl font-bold text-[#111827]">{stats.totalPedidos}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Favoritos</dt>
              <dd className="text-2xl font-bold text-[#111827]">{stats.totalFavoritos}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Cliente desde</dt>
              <dd className="text-sm font-semibold text-[#111827]">{fechaRegistro}</dd>
            </div>
          </dl>
        </div>
      </motion.aside>
    </div>
  );
}
