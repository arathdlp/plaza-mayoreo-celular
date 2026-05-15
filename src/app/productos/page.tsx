"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useMemo, useState } from "react";

export type CategoriaFiltro =
  | "todos"
  | "pantallas"
  | "baterias"
  | "placas"
  | "accesorios"
  | "celulares"
  | "tapas";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  categoria: Exclude<CategoriaFiltro, "todos">;
};

const FILTROS: { id: CategoriaFiltro; etiqueta: string }[] = [
  { id: "todos", etiqueta: "Todos" },
  { id: "pantallas", etiqueta: "Pantallas" },
  { id: "baterias", etiqueta: "Baterías" },
  { id: "placas", etiqueta: "Placas" },
  { id: "accesorios", etiqueta: "Accesorios" },
  { id: "celulares", etiqueta: "Celulares" },
  { id: "tapas", etiqueta: "Tapas" },
];

const BADGE_TEXTO: Record<Exclude<CategoriaFiltro, "todos">, string> = {
  pantallas: "Pantallas",
  baterias: "Baterías",
  placas: "Placas",
  accesorios: "Accesorios",
  celulares: "Celulares",
  tapas: "Tapas",
};

const PRODUCTOS: Producto[] = [
  {
    id: "1",
    nombre: "Pantalla OLED iPhone 13",
    precio: 1899,
    categoria: "pantallas",
  },
  {
    id: "2",
    nombre: "Pantalla AMOLED Samsung Galaxy A54",
    precio: 1650,
    categoria: "pantallas",
  },
  {
    id: "3",
    nombre: "Batería original iPhone 12",
    precio: 459,
    categoria: "baterias",
  },
  {
    id: "4",
    nombre: "Batería Xiaomi Redmi Note 11",
    precio: 329,
    categoria: "baterias",
  },
  {
    id: "5",
    nombre: "Placa de carga iPhone 11",
    precio: 890,
    categoria: "placas",
  },
  {
    id: "6",
    nombre: "Módulo de carga USB-C universal",
    precio: 219,
    categoria: "placas",
  },
  {
    id: "7",
    nombre: "Funda uso rudo transparente",
    precio: 149,
    categoria: "accesorios",
  },
  {
    id: "8",
    nombre: "Protector de cristal templado 6.5\"",
    precio: 89,
    categoria: "accesorios",
  },
  {
    id: "9",
    nombre: "Smartphone reacondicionado 128 GB",
    precio: 4499,
    categoria: "celulares",
  },
  {
    id: "10",
    nombre: "Tapa trasera iPhone XR",
    precio: 299,
    categoria: "tapas",
  },
  {
    id: "11",
    nombre: "Pantalla LCD Motorola Moto G84",
    precio: 1420,
    categoria: "pantallas",
  },
  {
    id: "12",
    nombre: "Cable USB-C carga rápida 2 m",
    precio: 249,
    categoria: "accesorios",
  },
];

function formatoPesos(valor: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(valor);
}

function PlaceholderFoto() {
  return (
    <div
      className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-[#0066FF]/40"
      aria-hidden
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export default function ProductosPage() {
  const [filtro, setFiltro] = useState<CategoriaFiltro>("todos");

  const visibles = useMemo(() => {
    if (filtro === "todos") return PRODUCTOS;
    return PRODUCTOS.filter((p) => p.categoria === filtro);
  }, [filtro]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-zinc-100 bg-zinc-50/80">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Productos
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-zinc-600">
              Refacciones y accesorios con la misma calidad que en tienda. Filtra por categoría.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div
            className="flex flex-wrap gap-2 pb-2 sm:gap-3"
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
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    activo
                      ? "bg-[#0066FF] text-white shadow-sm shadow-[#0066FF]/25"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {f.etiqueta}
                </button>
              );
            })}
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((p) => (
              <li key={p.id}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0066FF]/25 hover:shadow-md">
                  <div className="relative overflow-hidden">
                    <PlaceholderFoto />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-[#0066FF] shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
                      {BADGE_TEXTO[p.categoria]}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-base font-semibold leading-snug text-black">
                      {p.nombre}
                    </h2>
                    <p className="mt-3 text-xl font-semibold tracking-tight text-black">
                      {formatoPesos(p.precio)}
                    </p>
                    <button
                      type="button"
                      className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0066FF] text-sm font-medium text-white transition-all duration-200 hover:bg-[#0052cc] active:scale-[0.98]"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {visibles.length === 0 ? (
            <p className="mt-12 text-center text-zinc-500">No hay productos en esta categoría.</p>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
