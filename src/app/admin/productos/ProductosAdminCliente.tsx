"use client";

import {
  actualizarProducto,
  crearProducto,
  setProductoActivo,
} from "@/app/admin/productos/actions";
import type { ProductoAdminRow } from "@/app/admin/productos/types";
import { authFieldClass, authLabelClass } from "@/components/auth/AuthShell";
import { formatoPesos } from "@/lib/format";
import { CATEGORIAS_PRODUCTO } from "@/types/producto";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

function emptyForm(): Omit<ProductoAdminRow, "id"> {
  return {
    nombre: "",
    marca: "",
    modelo: "",
    categoria: CATEGORIAS_PRODUCTO[0],
    precio: 0,
    costo: 0,
    activo: true,
    imagen_url: null,
    descripcion: null,
    stock: null,
  };
}

type Props = {
  initialProductos: ProductoAdminRow[];
  loadError: boolean;
};

export default function ProductosAdminCliente({ initialProductos, loadError }: Props) {
  const router = useRouter();
  const [productos, setProductos] = useState(initialProductos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<ProductoAdminRow, "id">>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<number | null>(null);
  const [pendingSave, startSaveTransition] = useTransition();

  useEffect(() => {
    setProductos(initialProductos);
  }, [initialProductos]);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(p: ProductoAdminRow) {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre,
      marca: p.marca,
      modelo: p.modelo,
      categoria: p.categoria,
      precio: p.precio,
      costo: p.costo,
      activo: p.activo,
      imagen_url: p.imagen_url,
      descripcion: p.descripcion,
      stock: p.stock,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleToggleActivo(id: number, next: boolean) {
    setPendingToggleId(id);
    const prev = productos;
    setProductos((rows) => rows.map((r) => (r.id === id ? { ...r, activo: next } : r)));
    const res = await setProductoActivo(id, next);
    setPendingToggleId(null);
    if (!res.ok) {
      setProductos(prev);
      alert(res.error);
      return;
    }
    router.refresh();
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("nombre", form.nombre);
    fd.set("marca", form.marca);
    fd.set("modelo", form.modelo);
    fd.set("categoria", form.categoria);
    fd.set("costo", String(form.costo));
    fd.set("precio", String(form.precio));
    fd.set("imagen_url", form.imagen_url ?? "");
    fd.set("descripcion", form.descripcion ?? "");
    fd.set("stock", form.stock === null || form.stock === undefined ? "" : String(form.stock));
    fd.set("activo", form.activo ? "true" : "false");
    return fd;
  }

  function handleSubmit() {
    setFormError(null);
    startSaveTransition(async () => {
      const fd = buildFormData();
      const res =
        editingId === null ? await crearProducto(fd) : await actualizarProducto(editingId, fd);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setModalOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-colors hover:bg-[#3385ff]"
        >
          Agregar producto
        </button>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          No se pudieron cargar los productos desde Supabase.
        </div>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white backdrop-blur-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-4 py-4">Nombre</th>
              <th className="px-4 py-4">Marca</th>
              <th className="px-4 py-4">Categoría</th>
              <th className="px-4 py-4 text-right">Precio</th>
              <th className="px-4 py-4 text-center">Activo</th>
              <th className="px-4 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No hay productos. Usa &quot;Agregar producto&quot; para crear el primero.
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id} className="text-gray-800 transition-colors hover:bg-gray-50">
                  <td className="max-w-[220px] px-4 py-4 font-medium text-white">
                    <span className="line-clamp-2">{p.nombre}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{p.marca}</td>
                  <td className="px-4 py-4 text-gray-600">{p.categoria}</td>
                  <td className="px-4 py-4 text-right tabular-nums font-semibold text-white">
                    {formatoPesos(p.precio)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.activo}
                      disabled={pendingToggleId === p.id}
                      onClick={() => handleToggleActivo(p.id, !p.activo)}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                        p.activo
                          ? "border-[#0066FF]/50 bg-[#0066FF]/25"
                          : "border-gray-200 bg-white/[0.06]"
                      } ${pendingToggleId === p.id ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`ml-0.5 inline-block size-5 rounded-full bg-white shadow transition-transform ${
                          p.activo ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="text-sm font-semibold text-[#0066FF] hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Cerrar"
            onClick={() => setModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-[#0c1629] p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] sm:p-8"
          >
            <h2 className="text-xl font-bold text-[#111827]">
              {editingId === null ? "Nuevo producto" : `Editar #${editingId}`}
            </h2>

            {formError ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="adm-nombre" className={authLabelClass}>
                  Nombre
                </label>
                <input
                  id="adm-nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className={authFieldClass}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="adm-marca" className={authLabelClass}>
                    Marca
                  </label>
                  <input
                    id="adm-marca"
                    value={form.marca}
                    onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))}
                    className={authFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="adm-modelo" className={authLabelClass}>
                    Modelo
                  </label>
                  <input
                    id="adm-modelo"
                    value={form.modelo}
                    onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))}
                    className={authFieldClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="adm-cat" className={authLabelClass}>
                  Categoría
                </label>
                <select
                  id="adm-cat"
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  className={`${authFieldClass} appearance-none bg-white`}
                >
                  {CATEGORIAS_PRODUCTO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="adm-costo" className={authLabelClass}>
                    Costo
                  </label>
                  <input
                    id="adm-costo"
                    inputMode="decimal"
                    value={String(form.costo)}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, costo: parseFloat(e.target.value) || 0 }))
                    }
                    className={authFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="adm-precio" className={authLabelClass}>
                    Precio venta
                  </label>
                  <input
                    id="adm-precio"
                    inputMode="decimal"
                    value={String(form.precio)}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, precio: parseFloat(e.target.value) || 0 }))
                    }
                    className={authFieldClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="adm-img" className={authLabelClass}>
                  URL de imagen (opcional)
                </label>
                <input
                  id="adm-img"
                  value={form.imagen_url ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      imagen_url: e.target.value.trim() || null,
                    }))
                  }
                  className={authFieldClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="adm-desc" className={authLabelClass}>
                  Descripción (opcional)
                </label>
                <textarea
                  id="adm-desc"
                  rows={3}
                  value={form.descripcion ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      descripcion: e.target.value.trim() || null,
                    }))
                  }
                  className={`${authFieldClass} resize-y`}
                />
              </div>
              <div>
                <label htmlFor="adm-stock" className={authLabelClass}>
                  Stock (opcional)
                </label>
                <input
                  id="adm-stock"
                  inputMode="numeric"
                  value={form.stock === null || form.stock === undefined ? "" : String(form.stock)}
                  onChange={(e) => {
                    const t = e.target.value.trim();
                    setForm((f) => ({
                      ...f,
                      stock: t === "" ? null : parseInt(t, 10) || 0,
                    }));
                  }}
                  className={authFieldClass}
                  placeholder="Vacío = sin control"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                  className="size-4 accent-[#0066FF]"
                />
                <span className="text-sm font-medium text-gray-800">Visible en tienda (activo)</span>
              </label>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pendingSave}
                onClick={handleSubmit}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white hover:bg-[#3385ff] disabled:opacity-50 sm:flex-none"
              >
                {pendingSave ? "Guardando…" : editingId === null ? "Crear" : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
