"use client";

import { productosListHref } from "@/lib/productos-url";
import type { CategoriaProducto } from "@/types/producto";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import ScrollReveal, { staggerContainer, staggerItem } from "@/components/ScrollReveal";

const iconClass = "text-[#0066FF]";

type Category = {
  name: string;
  categoria: CategoriaProducto;
  icon: React.ReactNode;
};

function IconPantalla() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <rect x="5" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.65" />
      <path d="M9 21h6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

function IconBateria() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <rect x="6" y="7" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.65" />
      <path d="M9 5h6v2H9z" fill="currentColor" />
    </svg>
  );
}

function IconPlaca() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.65" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

function IconAccesorio() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.65" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

function IconCelular() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.65" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconTapa() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.65" />
      <path d="M5 10h14" stroke="currentColor" strokeWidth="1.65" />
    </svg>
  );
}

const categories: Category[] = [
  { name: "Pantallas", categoria: "Pantalla", icon: <IconPantalla /> },
  { name: "Baterías", categoria: "Bateria", icon: <IconBateria /> },
  { name: "Tapas Traseras", categoria: "Tapa Trasera", icon: <IconTapa /> },
  { name: "Placas de Carga", categoria: "Placa de Carga", icon: <IconPlaca /> },
  { name: "Accesorios", categoria: "Accesorio", icon: <IconAccesorio /> },
  { name: "Celulares", categoria: "Celular", icon: <IconCelular /> },
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
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">Categorías</h2>
            <p className="mt-3 text-base font-medium text-gray-600 sm:text-lg">
              Encuentra refacciones y equipos para todas las marcas.
            </p>
          </div>
        </ScrollReveal>

        <motion.ul
          className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-3"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px" }}
        >
          {categories.map((cat) => (
            <motion.li key={cat.name} variants={reduceMotion ? undefined : staggerItem} className="h-full">
              <Link
                href={productosListHref({ categoria: cat.categoria })}
                className="flex h-full min-h-[150px] flex-col rounded-2xl border border-gray-200 bg-white p-4 transition-shadow duration-[600ms] ease-out hover:shadow-[0_12px_40px_-12px_rgba(17,24,39,0.1)] sm:p-8"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-[#0066FF]/5">
                  {cat.icon}
                </div>
                <h3 className="mt-4 break-words text-base font-bold tracking-tight text-gray-900 sm:mt-5 sm:text-xl">{cat.name}</h3>
                <span className="mt-3 text-sm font-semibold text-[#0066FF]">Ver productos</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
