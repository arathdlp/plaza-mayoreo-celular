"use client";

import AgregarAlCarritoButton from "@/components/carrito/AgregarAlCarritoButton";
import { formatoPesos } from "@/lib/format";
import { productosListHref } from "@/lib/productos-url";
import {
  categoriasEquivalentes,
  type CategoriaFiltro,
  type Producto,
} from "@/types/producto";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const FILTROS: { id: CategoriaFiltro; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  { id: "Pantalla", etiqueta: "Pantalla" },
  { id: "Bateria", etiqueta: "Bateria" },
  { id: "Tapa Trasera", etiqueta: "Tapa Trasera" },
  { id: "Placa de Carga", etiqueta: "Placa de Carga" },
  { id: "Accesorio", etiqueta: "Accesorio" },
  { id: "Celular", etiqueta: "Celular" },
];

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

export type ProductosCatalogProps = {
  productos: Producto[];
  total: number;
  page: number;
  perPage: number;
  q: string;
  categoria: CategoriaFiltro;
};

export default function ProductosCatalog({
  productos,
  total,
  page,
  perPage,
  q,
  categoria,
}: ProductosCatalogProps) {
  const [busquedaDraft, setBusquedaDraft] = useState(q);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const desde = total === 0 ? 0 : (page - 1) * perPage + 1;
  const hasta = Math.min(page * perPage, total);

  const hrefFor = useMemo(
    () => (opts: { page?: number; categoria?: CategoriaFiltro; q?: string }) =>
      productosListHref({
        page: opts.page,
        categoria: opts.categoria ?? categoria,
        q: opts.q ?? q,
      }),
    [categoria, q],
  );

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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">Catálogo</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Productos
          </h1>
          <p className="mt-2 max-w-2xl text-base font-normal text-white/60 sm:text-lg">
            {total.toLocaleString("es-MX")} refacciones en catálogo · {perPage} por página · filtra y busca
          </p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <form
          action="/productos"
          method="get"
          className="relative max-w-xl"
          role="search"
        >
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 sm:left-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
          <input type="hidden" name="page" value="1" />
          {categoria !== "todos" ? <input type="hidden" name="categoria" value={categoria} /> : null}
          <input
            type="search"
            name="q"
            value={busquedaDraft}
            onChange={(e) => setBusquedaDraft(e.target.value)}
            placeholder="Buscar por nombre o modelo…"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-11 pr-24 text-sm text-white outline-none backdrop-blur-md transition-all duration-300 placeholder:text-white/40 focus:border-[#0066FF]/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.15)] sm:pl-12 sm:pr-28"
            aria-label="Buscar productos"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-lg bg-[#0066FF] px-3 text-xs font-semibold text-white shadow-md shadow-[#0066FF]/20 transition-colors hover:bg-[#3385ff] sm:px-4 sm:text-sm"
          >
            Buscar
          </button>
        </form>

        <div
          className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3"
          role="tablist"
          aria-label="Filtrar por categoría"
        >
          {FILTROS.map((f) => {
            const match =
              f.id === "todos"
                ? categoria === "todos"
                : categoriasEquivalentes(categoria, f.id);
            return (
              <Link
                key={f.id}
                href={productosListHref({
                  page: 1,
                  categoria: f.id,
                  q: q || undefined,
                })}
                role="tab"
                aria-selected={match}
                className={`rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 ease-out active:scale-[0.98] sm:px-4 sm:text-sm ${
                  match
                    ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25"
                    : "border border-white/15 bg-white/5 text-white/75 backdrop-blur-sm hover:border-[#0066FF]/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f.etiqueta}
              </Link>
            );
          })}
        </div>

        <p className="mt-5 text-sm text-white/45 sm:mt-6" aria-live="polite">
          {total === 0
            ? "Sin resultados con estos criterios."
            : `Mostrando ${desde}–${hasta} de ${total.toLocaleString("es-MX")} · Página ${page} de ${totalPages}`}
        </p>

        <ul
          className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6"
        >
          {productos.map((p) => (
            <li key={p.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#0066FF]/35 hover:bg-white/[0.08] hover:shadow-[0_16px_48px_-12px_rgba(0,102,255,0.15)]">
                <Link
                  href={`/productos/${p.id}`}
                  className="absolute inset-0 z-0 rounded-2xl"
                  aria-label={`Ver ${p.nombre}`}
                />
                <div className="relative z-[1] pointer-events-none overflow-hidden">
                  <ProductoImagen producto={p} />
                  <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-medium text-[#0066FF] backdrop-blur-md">
                    {p.categoria}
                  </span>
                </div>
                <div className="relative z-[1] flex flex-1 flex-col p-4 pointer-events-none sm:p-5">
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

        {productos.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-10 text-center backdrop-blur-sm sm:px-6 sm:py-12">
            <p className="text-white/70">No encontramos productos con esos criterios.</p>
            <Link
              href="/productos"
              className="mt-4 inline-block text-sm font-semibold text-[#0066FF] transition-colors hover:text-[#4d94ff]"
            >
              Limpiar filtros
            </Link>
          </div>
        ) : null}

        {totalPages > 1 ? (
          <nav
            className="mt-10 flex flex-col items-stretch justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center"
            aria-label="Paginación"
          >
            <Link
              href={hrefFor({ page: page - 1 })}
              aria-disabled={page <= 1}
              className={`inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors sm:min-w-[8rem] ${
                page <= 1
                  ? "pointer-events-none border-white/10 text-white/30"
                  : "border-white/20 text-white hover:border-[#0066FF]/40 hover:bg-[#0066FF]/10"
              }`}
            >
              ← Anterior
            </Link>
            <p className="text-center text-sm text-white/55">
              Página <span className="font-semibold text-white">{page}</span> de{" "}
              <span className="font-semibold text-white">{totalPages}</span>
            </p>
            <Link
              href={hrefFor({ page: page + 1 })}
              aria-disabled={page >= totalPages}
              className={`inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors sm:min-w-[8rem] ${
                page >= totalPages
                  ? "pointer-events-none border-white/10 text-white/30"
                  : "border-white/20 text-white hover:border-[#0066FF]/40 hover:bg-[#0066FF]/10"
              }`}
            >
              Siguiente →
            </Link>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
