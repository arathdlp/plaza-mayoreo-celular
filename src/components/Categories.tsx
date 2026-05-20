"use client";

import { productosListHref } from "@/lib/productos-url";
import type { CategoriaProducto } from "@/types/producto";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import ScrollReveal, { staggerContainer, staggerItem } from "@/components/ScrollReveal";

const categories: {
  name: string;
  emoji: string;
  categoria: CategoriaProducto;
}[] = [
  { name: "Pantallas", emoji: "📱", categoria: "Pantalla" },
  { name: "Baterías", emoji: "🔋", categoria: "Bateria" },
  { name: "Tapas Traseras", emoji: "📦", categoria: "Tapa Trasera" },
  { name: "Placas de Carga", emoji: "🔌", categoria: "Placa de Carga" },
  { name: "Accesorios", emoji: "🎧", categoria: "Accesorio" },
  { name: "Celulares", emoji: "📲", categoria: "Celular" },
];

export default function Categories() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="productos"
      className="border-t border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Categorías</h2>
            <p className="mt-3 text-lg font-medium text-gray-600">
              Encuentra refacciones y equipos para todas las marcas.
            </p>
          </div>
        </ScrollReveal>

        <motion.ul
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
        >
          {categories.map((cat) => (
            <motion.li key={cat.name} variants={reduceMotion ? undefined : staggerItem} className="h-full">
              <Link
                href={productosListHref({ categoria: cat.categoria })}
                className="group flex h-full min-h-[180px] flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-7 transition-all duration-300 ease-out hover:scale-[1.05] hover:border-[#0066FF]/30 hover:shadow-[0_16px_48px_-16px_rgba(0,102,255,0.2)] active:scale-[0.99]"
              >
                <span className="text-4xl" aria-hidden>
                  {cat.emoji}
                </span>
                <span className="mt-4 text-lg font-bold tracking-tight text-gray-900">{cat.name}</span>
                <span className="mt-2 text-sm font-semibold text-[#0066FF]">Ver productos →</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
