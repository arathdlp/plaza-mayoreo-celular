"use client";

import AgregarAlCarritoButton from "@/components/carrito/AgregarAlCarritoButton";
import ProductoImagen from "@/components/ProductoImagen";
import { useCarrito } from "@/hooks/useCarrito";
import { formatoPesos } from "@/lib/format";
import type { Producto } from "@/types/producto";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RecomendacionesBanner() {
  const { ultimoAgregado, mostrarRecomendaciones, cerrarRecomendaciones, lineas } =
    useCarrito();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mostrarRecomendaciones || !ultimoAgregado?.marca) {
      setProductos([]);
      return;
    }

    const categoriasEnCarrito = [
      ...new Set(
        lineas
          .map(() => ultimoAgregado.categoria)
          .filter(Boolean) as string[],
      ),
      ultimoAgregado.categoria,
    ];

    setLoading(true);
    void fetch("/api/recomendaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marca: ultimoAgregado.marca,
        modelo: ultimoAgregado.modelo,
        categoriasExcluir: categoriasEnCarrito,
      }),
    })
      .then((r) => r.json())
      .then((json: { productos?: Producto[] }) => {
        const list = json.productos ?? [];
        setProductos(list);
        if (list.length === 0) cerrarRecomendaciones();
      })
      .finally(() => setLoading(false));
  }, [mostrarRecomendaciones, ultimoAgregado, lineas, cerrarRecomendaciones]);

  const visible = mostrarRecomendaciones && !loading && productos.length > 0 && ultimoAgregado;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label="Recomendaciones"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md sm:px-6"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0066FF]">
                  Completa tu reparación
                </p>
                <h3 className="text-base font-bold text-[#111827] sm:text-lg">
                  {ultimoAgregado.marca} {ultimoAgregado.modelo}
                </h3>
              </div>
              <button
                type="button"
                onClick={cerrarRecomendaciones}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {productos.map((p) => (
                <article
                  key={p.id}
                  className="w-[min(72vw,220px)] shrink-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="relative h-24 overflow-hidden rounded-xl bg-gray-100">
                    <ProductoImagen
                      categoria={p.categoria}
                      marca={p.marca}
                      nombre={p.nombre}
                      imagenUrl={p.imagen_url}
                      variant="card"
                      className="absolute inset-0"
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold text-[#111827]">{p.nombre}</p>
                  <p className="mt-1 text-sm font-bold text-[#111827]">{formatoPesos(p.precio)}</p>
                  <AgregarAlCarritoButton
                    className="mt-2"
                    producto={{
                      id: p.id,
                      nombre: p.nombre,
                      precio: p.precio,
                      imagen_url: p.imagen_url,
                      marca: p.marca,
                      modelo: p.modelo,
                      categoria: p.categoria,
                    }}
                  />
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
