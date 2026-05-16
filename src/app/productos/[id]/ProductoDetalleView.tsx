"use client";

import AgregarAlCarritoButton from "@/components/carrito/AgregarAlCarritoButton";
import PageReveal from "@/components/PageReveal";
import ProductoImagen from "@/components/ProductoImagen";
import { cardStatic, headingPage, textMuted, textSubtle } from "@/lib/design-system";
import { formatoPesos } from "@/lib/format";
import { TRANSITION_BASE } from "@/lib/motion-landing";
import type { Producto } from "@/types/producto";
import { motion } from "framer-motion";
import Link from "next/link";

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
        Agotado
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
        Últimas {stock} unidades
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
      {stock} en stock
    </span>
  );
}

type ProductoDetalleViewProps = {
  producto: Producto;
};

export default function ProductoDetalleView({ producto }: ProductoDetalleViewProps) {
  const descripcion = producto.descripcion?.trim();

  return (
    <PageReveal as="main" className="flex-1 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav aria-label="Breadcrumb" className={`text-sm ${textSubtle}`}>
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors duration-300 hover:text-[#0066FF]">
                Inicio
              </Link>
            </li>
            <li aria-hidden className="text-gray-300">
              /
            </li>
            <li>
              <Link href="/productos" className="transition-colors duration-300 hover:text-[#0066FF]">
                Productos
              </Link>
            </li>
            <li aria-hidden className="text-gray-300">
              /
            </li>
            <li className="font-medium text-gray-700" aria-current="page">
              {producto.nombre}
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <motion.div
            className="cult-animated-border"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={TRANSITION_BASE}
          >
            <div className="cult-animated-border-inner overflow-hidden bg-gray-100 p-1">
              <ProductoImagen
                categoria={producto.categoria}
                marca={producto.marca}
                nombre={producto.nombre}
                imagenUrl={producto.imagen_url}
                variant="detail"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...TRANSITION_BASE, delay: 0.12 }}
          >
            <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
              {producto.categoria}
            </span>

            <h1 className={`mt-4 ${headingPage}`}>{producto.nombre}</h1>

            <p className={`mt-3 text-lg ${textMuted}`}>
              <span className="font-semibold text-gray-800">{producto.marca}</span>
              <span className="mx-2 text-gray-300">·</span>
              <span>{producto.modelo}</span>
            </p>

            {descripcion ? (
              <div className={`mt-6 ${cardStatic} p-5`}>
                <h2 className={`text-sm font-bold uppercase tracking-wider ${textSubtle}`}>Descripción</h2>
                <p className={`mt-2 leading-relaxed ${textMuted}`}>{descripcion}</p>
              </div>
            ) : null}

            <p className="mt-8 text-4xl font-bold tracking-tight text-gray-900">
              {formatoPesos(producto.precio)}
            </p>

            {producto.stock != null ? (
              <div className="mt-4">
                <StockBadge stock={producto.stock} />
              </div>
            ) : null}

            <AgregarAlCarritoButton
              size="lg"
              className="mt-8"
              producto={{
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen_url: producto.imagen_url,
              }}
            />
          </motion.div>
        </div>

        <Link
          href="/productos"
          className={`mt-12 inline-flex items-center gap-2 text-sm font-semibold ${textSubtle} transition-colors duration-300 hover:text-[#0066FF]`}
        >
          <span aria-hidden>←</span>
          Volver a productos
        </Link>
      </div>
    </PageReveal>
  );
}
