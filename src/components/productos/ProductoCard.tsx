"use client";

import AgregarAlCarritoButton from "@/components/carrito/AgregarAlCarritoButton";
import FavoriteHeartButton from "@/components/favoritos/FavoriteHeartButton";
import QuitarFavoritoButton from "@/components/favoritos/QuitarFavoritoButton";
import ProductoImagen from "@/components/ProductoImagen";
import { formatoPesos } from "@/lib/format";
import type { ProductoCarritoPayload } from "@/types/carrito";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

type ProductoCardProps = {
  producto: ProductoCarritoPayload & {
    categoria: string;
    marca: string;
    modelo: string;
  };
  /** Muestra botón explícito para quitar (página /favoritos) */
  mostrarQuitar?: boolean;
};

export default function ProductoCard({ producto, mostrarQuitar = false }: ProductoCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="cult-animated-border cult-product-card group h-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm shadow-blue-500/5 transition-[border-color,box-shadow] duration-300 hover:border-blue-200"
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="cult-animated-border-inner relative flex h-full flex-row sm:flex-col">
        <Link
          href={`/productos/${producto.id}`}
          className="absolute inset-0 z-0 rounded-2xl"
          aria-label={`Ver ${producto.nombre}`}
        />

        <div className="relative z-[1] h-[100px] w-[100px] shrink-0 overflow-hidden bg-gray-100 sm:h-36 sm:w-full">
          <ProductoImagen
            className="absolute inset-0 flex h-full w-full items-center justify-center"
            categoria={producto.categoria}
            marca={producto.marca}
            nombre={producto.nombre}
            imagenUrl={producto.imagen_url}
            variant="card"
          />
          <span className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-2rem)] items-center gap-1 rounded-full bg-blue-50/95 py-0.5 pl-1.5 pr-2 text-[10px] font-semibold text-blue-600 shadow-sm backdrop-blur-sm sm:left-3 sm:top-3 sm:max-w-[calc(100%-3.5rem)] sm:gap-1.5 sm:py-1 sm:pl-2 sm:pr-2.5 sm:text-xs">
            <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0066FF] opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0066FF]" />
            </span>
            <span className="truncate">{producto.categoria}</span>
          </span>
          <FavoriteHeartButton productoId={producto.id} />
        </div>

        <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 flex-col border-l border-gray-100 p-3 sm:border-l-0 sm:border-t sm:p-5">
          <p className="border-b border-gray-100 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 sm:text-[11px]">
            {producto.marca}
            <span className="mx-1.5 font-normal text-gray-300">·</span>
            {producto.modelo}
          </p>
          <h2 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-gray-900 sm:text-base">
            {producto.nombre}
          </h2>
          <p className="mt-auto pt-2 text-lg font-bold tracking-tight text-gray-900 sm:pt-3 sm:text-2xl">
            {formatoPesos(producto.precio)}
          </p>
          <div className="pointer-events-auto relative z-[2] mt-2 w-full min-w-0 space-y-2">
            <AgregarAlCarritoButton
              className="w-full"
              producto={{
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen_url: producto.imagen_url,
                marca: producto.marca,
                modelo: producto.modelo,
                categoria: producto.categoria,
              }}
            />
            {mostrarQuitar ? <QuitarFavoritoButton productoId={producto.id} /> : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

