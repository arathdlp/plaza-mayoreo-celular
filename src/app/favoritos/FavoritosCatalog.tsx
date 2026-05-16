"use client";

import PageReveal from "@/components/PageReveal";
import ProductoCard from "@/components/productos/ProductoCard";
import {
  accentLabel,
  btnPrimary,
  headingPage,
  textMuted,
  textSubtle,
} from "@/lib/design-system";
import { staggerContainer, staggerItem } from "@/lib/motion-landing";
import { createClient } from "@/lib/supabase/client";
import {
  canonicalizarCategoria,
  type CategoriaProducto,
  type Producto,
} from "@/types/producto";
import { useFavoritos } from "@/hooks/useFavoritos";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductoRow = {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: string;
  precio: number | string;
  imagen_url: string | null;
};

function mapRow(row: ProductoRow): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    marca: row.marca,
    modelo: row.modelo,
    categoria: canonicalizarCategoria(row.categoria) as CategoriaProducto,
    precio: typeof row.precio === "string" ? parseFloat(row.precio) : row.precio,
    imagen_url: row.imagen_url,
    descripcion: null,
    stock: null,
  };
}

export default function FavoritosCatalog() {
  const { ids, listo, sincronizando } = useFavoritos();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const reduceMotion = useReducedMotion();

  const idsKey = useMemo(() => ids.join(","), [ids]);

  useEffect(() => {
    if (!listo) return;

    if (ids.length === 0) {
      setProductos([]);
      setCargando(false);
      return;
    }

    let cancelled = false;
    setCargando(true);

    void (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, marca, modelo, categoria, precio, imagen_url")
        .eq("activo", true)
        .in("id", ids);

      if (cancelled) return;

      if (error) {
        console.error("[favoritos] productos", error.message);
        setProductos([]);
        setCargando(false);
        return;
      }

      const rows = (data ?? []) as ProductoRow[];
      const byId = new Map(rows.map((row) => [row.id, mapRow(row)]));
      const ordered = ids
        .map((id) => byId.get(id))
        .filter((p): p is Producto => p != null);

      setProductos(ordered);
      setCargando(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [ids, idsKey, listo]);

  const vacio = listo && !cargando && !sincronizando && ids.length === 0;

  return (
    <PageReveal as="main" className="flex-1 bg-white">
      <motion.div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <p className={accentLabel}>Tu lista</p>
          <h1 className={`mt-2 ${headingPage}`}>Favoritos</h1>
          <p className={`mt-2 max-w-2xl text-base sm:text-lg ${textMuted}`}>
            {listo
              ? ids.length === 0
                ? "Guarda productos con el corazón en el catálogo."
                : `${ids.length.toLocaleString("es-MX")} producto${ids.length === 1 ? "" : "s"} guardado${ids.length === 1 ? "" : "s"}`
              : "Cargando favoritos…"}
          </p>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {vacio ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center sm:py-20">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm"
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.75"
                aria-hidden
              >
                <path d="M12 20.25l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5 4 3 6.5 3c1.74 0 3.41.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 18 3 20 5 20 7.5c0 3.78-3.4 6.86-8.55 11.43L12 20.25z" />
              </svg>
            </motion.div>
            <h2 className="mt-6 text-xl font-bold text-gray-900">Aún no tienes favoritos</h2>
            <p className={`mt-2 max-w-sm ${textSubtle}`}>
              Toca el corazón en cualquier producto para guardarlo aquí y encontrarlo rápido.
            </p>
            <Link href="/productos" className={`mt-8 px-8 py-3.5 text-sm ${btnPrimary}`}>
              Explorar productos
            </Link>
          </div>
        ) : null}

        {!vacio && (cargando || !listo || sincronizando) ? (
          <p className={`text-center text-sm ${textSubtle}`}>Cargando productos…</p>
        ) : null}

        {!vacio && listo && !cargando ? (
          <motion.ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
            variants={reduceMotion ? undefined : staggerContainer}
            initial="hidden"
            animate="show"
          >
            {productos.map((p) => (
              <motion.li key={p.id} variants={reduceMotion ? undefined : staggerItem} className="min-h-0">
                <ProductoCard
                  mostrarQuitar
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
        ) : null}

        {!vacio && listo && !cargando && productos.length === 0 && ids.length > 0 ? (
          <p className={`text-center text-sm ${textSubtle}`}>
            No encontramos productos activos para tus favoritos guardados.
          </p>
        ) : null}
      </div>
    </PageReveal>
  );
}
