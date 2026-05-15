"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

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
  return (
    <section
      id="productos"
      className="border-t border-zinc-200/80 bg-zinc-100 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Categorías
            </h2>
            <p className="mt-3 text-lg font-normal text-zinc-600">
              Encuentra refacciones y equipos para todas las marcas.
            </p>
          </div>
        </ScrollReveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <li key={cat.name} className="h-full">
              <ScrollReveal delayMs={index * 70} className="h-full">
                <Link
                  href="/productos"
                  className="group flex h-full min-h-[200px] flex-col rounded-2xl border border-white/5 bg-[#1a1a2e] p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out hover:scale-[1.03] hover:border-[#0066FF]/50 hover:shadow-[0_12px_40px_-8px_rgba(0,102,255,0.25)] active:scale-[0.99]"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0066FF]/12 transition-colors duration-300 group-hover:bg-[#0066FF]/20">
                    {cat.icon}
                  </span>
                  <span className="mt-5 text-lg font-semibold tracking-tight text-white">
                    {cat.name}
                  </span>
                  <span className="mt-2 text-sm font-medium text-[#0066FF] transition-all duration-300 group-hover:tracking-wide">
                    Ver productos →
                  </span>
                </Link>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
