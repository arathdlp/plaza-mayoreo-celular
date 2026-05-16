"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import ScrollReveal, { staggerContainer, staggerItem } from "@/components/ScrollReveal";

type Category = { name: string; icon: React.ReactNode };

function IconPantalla() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="5" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconBateria() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="6" y="7" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5h6v2H9z" fill="currentColor" />
    </svg>
  );
}

function IconPlaca() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconAccesorio() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCelular() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconTapa() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 10h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const categories: Category[] = [
  { name: "Pantallas", icon: <IconPantalla /> },
  { name: "Baterías", icon: <IconBateria /> },
  { name: "Placas de Carga", icon: <IconPlaca /> },
  { name: "Accesorios", icon: <IconAccesorio /> },
  { name: "Celulares", icon: <IconCelular /> },
  { name: "Tapas Traseras", icon: <IconTapa /> },
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
                href="/productos"
                className="group flex h-full min-h-[200px] flex-col rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-500 ease-out hover:scale-[1.02] hover:border-[#0066FF]/40 hover:shadow-[0_12px_40px_-12px_rgba(0,102,255,0.12)] active:scale-[0.99]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0066FF]/8 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:bg-[#0066FF]/12">
                  {cat.icon}
                </span>
                <span className="mt-5 text-lg font-bold tracking-tight text-gray-900">{cat.name}</span>
                <span className="mt-2 text-sm font-semibold text-[#0066FF]">Ver productos →</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
