"use client";

import AgregarAlCarritoButton from "@/components/carrito/AgregarAlCarritoButton";
import { formatoPesos } from "@/lib/format";
import {
  categoriasEquivalentes,
  type CategoriaFiltro,
  type Producto,
} from "@/types/producto";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

const FILTROS: { id: CategoriaFiltro; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  { id: "Pantalla", etiqueta: "Pantalla" },
  { id: "Bateria", etiqueta: "Bateria" },
  { id: "Tapa Trasera", etiqueta: "Tapa Trasera" },
  { id: "Placa de Carga", etiqueta: "Placa de Carga" },
  { id: "Accesorio", etiqueta: "Accesorio" },
  { id: "Celular", etiqueta: "Celular" },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function ProductoImagen({ producto }: { producto: Producto }) {
  if (producto.imagen_url) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0a1628]">
        <Image
          src={producto.imagen_url}
          alt={producto.nombre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div
      className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#12121c] text-[#0066FF]/35"
      aria-hidden
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

type ProductosCatalogProps = {
  productos: Producto[];
};

export default function ProductosCatalog({ productos }: ProductosCatalogProps) {
  const [filtro, setFiltro] = useState<CategoriaFiltro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const busquedaDeferred = useDeferredValue(busqueda);

  const visibles = useMemo(() => {
    const q = normalize(busquedaDeferred.trim());

    return productos.filter((p) => {
      const matchCategoria =
        filtro === "todos" || categoriasEquivalentes(p.categoria, filtro);
      if (!matchCategoria) return false;
      if (!q) return true;

      const haystack = normalize(`${p.nombre} ${p.modelo} ${p.marca}`);
      return haystack.includes(q);
    });
  }, [productos, filtro, busquedaDeferred]);

  const buscando = busqueda !== busquedaDeferred;

  return (
    <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,102,255,0.18), transparent 55%)",
        }}
      />

      <div className="relative border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">
            Catálogo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Productos
          </h1>
          <p className="mt-2 max-w-2xl text-lg font-normal text-white/60">
            {productos.length} refacciones disponibles · filtra y busca por modelo
          </p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="relative max-w-xl">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o modelo…"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-12 pr-4 text-sm text-white outline-none backdrop-blur-md transition-all duration-300 placeholder:text-white/40 focus:border-[#0066FF]/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.15)]"
            aria-label="Buscar productos"
          />
        </div>

        <div
          className="mt-6 flex flex-wrap gap-2 sm:gap-3"
          role="tablist"
          aria-label="Filtrar por categoría"
        >
          {FILTROS.map((f) => {
            const activo = filtro === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setFiltro(f.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-out active:scale-[0.98] ${
                  activo
                    ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25"
                    : "border border-white/15 bg-white/5 text-white/75 backdrop-blur-sm hover:border-[#0066FF]/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f.etiqueta}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-white/45" aria-live="polite">
          {buscando ? "Buscando…" : `${visibles.length} resultado${visibles.length === 1 ? "" : "s"}`}
        </p>

        <ul
          className={`mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${buscando ? "opacity-70" : ""}`}
        >
          {visibles.map((p) => (
            <li key={p.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#0066FF]/35 hover:bg-white/[0.08] hover:shadow-[0_16px_48px_-12px_rgba(0,102,255,0.15)]">
                <Link
                  href={`/productos/${p.id}`}
                  className="absolute inset-0 z-0 rounded-2xl"
                  aria-label={`Ver ${p.nombre}`}
                />
                <div className="relative z-[1] pointer-events-none overflow-hidden">
                  <ProductoImagen producto={p} />
                  <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-medium text-[#0066FF] backdrop-blur-md">
                    {p.categoria}
                  </span>
                </div>
                <div className="relative z-[1] flex flex-1 flex-col p-5 pointer-events-none">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                    {p.marca} · {p.modelo}
                  </p>
                  <h2 className="mt-1 text-base font-semibold leading-snug text-white">{p.nombre}</h2>
                  <p className="mt-3 text-xl font-semibold tracking-tight text-white">
                    {formatoPesos(p.precio)}
                  </p>
                  <AgregarAlCarritoButton
                    producto={{
                      id: p.id,
                      nombre: p.nombre,
                      precio: p.precio,
                      imagen_url: p.imagen_url,
                    }}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>

        {visibles.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center backdrop-blur-sm">
            <p className="text-white/70">No encontramos productos con esos criterios.</p>
            <button
              type="button"
              onClick={() => {
                setFiltro("todos");
                setBusqueda("");
              }}
              className="mt-4 text-sm font-semibold text-[#0066FF] transition-colors hover:text-[#4d94ff]"
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
