"use client";

import PageReveal from "@/components/PageReveal";
import ProductoCard from "@/components/productos/ProductoCard";
import {
  accentLabel,
  btnPrimary,
  headingPage,
  paginationBtn,
  paginationBtnDisabled,
  pillActive,
  pillBase,
  searchInput,
  textMuted,
  textSubtle,
} from "@/lib/design-system";
import { staggerContainer, staggerItem } from "@/lib/motion-landing";
import { productosListHref } from "@/lib/productos-url";
import { createClient } from "@/lib/supabase/client";
import {
  categoriasEquivalentes,
  type CategoriaFiltro,
  type Producto,
} from "@/types/producto";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SearchX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const FILTROS: { id: CategoriaFiltro; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  { id: "Pantalla", etiqueta: "Pantalla" },
  { id: "Bateria", etiqueta: "Bateria" },
  { id: "Tapa Trasera", etiqueta: "Tapa Trasera" },
  { id: "Placa de Carga", etiqueta: "Placa de Carga" },
  { id: "Accesorio", etiqueta: "Accesorio" },
  { id: "Celular", etiqueta: "Celular" },
];

export type ProductosCatalogProps = {
  productos: Producto[];
  total: number;
  page: number;
  perPage: number;
  q: string;
  categoria: CategoriaFiltro;
};

type ResultadoBusqueda = {
  id: number;
  marca: string | null;
  modelo: string | null;
  categoria: string | null;
  precio: number | string | null;
  imagen_url: string | null;
};

function precioResultado(precio: ResultadoBusqueda["precio"]): string {
  const value = typeof precio === "string" ? Number(precio) : precio;
  if (!Number.isFinite(value)) return "$0.00";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export default function ProductosCatalog({
  productos,
  total,
  page,
  perPage,
  q,
  categoria,
}: ProductosCatalogProps) {
  const [busquedaDraft, setBusquedaDraft] = useState(q);
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLFormElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const desde = total === 0 ? 0 : (page - 1) * perPage + 1;
  const hasta = Math.min(page * perPage, total);
  const instantQuery = busquedaDraft.trim();

  const hrefFor = useMemo(
    () => (opts: { page?: number; categoria?: CategoriaFiltro; q?: string }) =>
      productosListHref({
        page: opts.page,
        categoria: opts.categoria ?? categoria,
        q: opts.q ?? q,
      }),
    [categoria, q],
  );

  useEffect(() => {
    if (instantQuery.length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    let cancelled = false;
    const searchTerm = instantQuery.replace(/[%,]/g, " ");
    const timer = setTimeout(async () => {
      setBuscando(true);
      const { data } = await supabase
        .from("productos")
        .select("id, marca, modelo, categoria, precio, imagen_url")
        .or(`marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`)
        .eq("activo", true)
        .gt("stock", 0)
        .limit(8);

      if (!cancelled) {
        setResultados((data ?? []) as ResultadoBusqueda[]);
        setBuscando(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [instantQuery, supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = dropdownOpen && instantQuery.length >= 2;

  return (
    <PageReveal as="main" className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <p className={accentLabel}>Catálogo</p>
          <h1 className={`mt-2 ${headingPage}`}>Productos</h1>
          <p className={`mt-2 max-w-2xl text-base sm:text-lg ${textMuted}`}>
            {total.toLocaleString("es-MX")} refacciones en catálogo · {perPage} por página · filtra y
            busca
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <form ref={searchRef} action="/productos" method="get" className="relative max-w-xl" role="search">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4"
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
            onChange={(e) => {
              setBusquedaDraft(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Buscar por nombre o modelo…"
            className={searchInput}
            aria-label="Buscar productos"
            autoComplete="off"
          />
          <button
            type="submit"
            className={`absolute right-2 top-1/2 h-9 -translate-y-1/2 px-3 text-xs sm:px-4 sm:text-sm ${btnPrimary}`}
          >
            Buscar
          </button>
          <AnimatePresence>
            {showDropdown ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                {buscando ? (
                  <div className="space-y-3 p-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex animate-pulse items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-2/3 rounded bg-gray-100" />
                          <div className="h-3 w-1/3 rounded bg-gray-100" />
                        </div>
                        <div className="h-3 w-14 rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                ) : resultados.length > 0 ? (
                  <ul className="max-h-[420px] overflow-y-auto py-2">
                    {resultados.map((producto) => {
                      const title = [producto.marca, producto.modelo].filter(Boolean).join(" ") || `Producto #${producto.id}`;
                      return (
                        <li key={producto.id}>
                          <Link
                            href={`/productos/${producto.id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex min-h-[64px] items-center gap-3 px-3 py-2 transition-colors hover:bg-[#F9FAFB]"
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {producto.imagen_url ? (
                                <Image src={producto.imagen_url} alt="" fill sizes="40px" className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#0066FF]">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                                    <rect x="7" y="3" width="10" height="18" rx="2" />
                                    <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-[#111827]">{title}</p>
                              <p className="truncate text-xs text-gray-500">{producto.categoria ?? "Producto"}</p>
                            </div>
                            <p className="shrink-0 text-sm font-bold tabular-nums text-[#0066FF]">
                              {precioResultado(producto.precio)}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-5 text-sm text-gray-500">
                    <SearchX className="h-5 w-5 shrink-0 text-gray-400" />
                    <span>No encontramos productos para &quot;{instantQuery}&quot;</span>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </form>

        <div
          className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3"
          role="tablist"
          aria-label="Filtrar por categoría"
        >
          {FILTROS.map((f) => {
            const match =
              f.id === "todos" ? categoria === "todos" : categoriasEquivalentes(categoria, f.id);
            return (
              <Link
                key={f.id}
                href={productosListHref({ page: 1, categoria: f.id, q: q || undefined })}
                role="tab"
                aria-selected={match}
                className={match ? pillActive : pillBase}
              >
                {f.etiqueta}
              </Link>
            );
          })}
        </div>

        <p className={`mt-5 text-sm sm:mt-6 ${textSubtle}`} aria-live="polite">
          {total === 0
            ? "Sin resultados con estos criterios."
            : `Mostrando ${desde}–${hasta} de ${total.toLocaleString("es-MX")} · Página ${page} de ${totalPages}`}
        </p>

        <motion.ul
          className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6"
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "show"}
        >
          {productos.map((p) => (
            <motion.li key={p.id} variants={reduceMotion ? undefined : staggerItem} className="min-h-0">
              <ProductoCard
                producto={{
                  id: p.id,
                  nombre: p.nombre,
                  precio: p.precio,
                  imagen_url: p.imagen_url,
                  categoria: p.categoria,
                  marca: p.marca,
                  modelo: p.modelo,
                }}
              />
            </motion.li>
          ))}
        </motion.ul>

        {productos.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-10 text-center sm:px-6 sm:py-12">
            <p className={textMuted}>No encontramos productos con esos criterios.</p>
            <Link
              href="/productos"
              className="mt-4 inline-block cursor-pointer text-sm font-semibold text-[#0066FF] hover:text-[#3385ff]"
            >
              Limpiar filtros
            </Link>
          </div>
        ) : null}

        {totalPages > 1 ? (
          <nav
            className="mt-10 flex flex-col items-stretch justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center"
            aria-label="Paginación"
          >
            <Link
              href={hrefFor({ page: page - 1 })}
              aria-disabled={page <= 1}
              className={page <= 1 ? paginationBtnDisabled : paginationBtn}
            >
              ← Anterior
            </Link>
            <p className={`text-center text-sm ${textMuted}`}>
              Página <span className="font-bold text-[#111827]">{page}</span> de{" "}
              <span className="font-bold text-[#111827]">{totalPages}</span>
            </p>
            <Link
              href={hrefFor({ page: page + 1 })}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? paginationBtnDisabled : paginationBtn}
            >
              Siguiente →
            </Link>
          </nav>
        ) : null}
      </div>
    </PageReveal>
  );
}
