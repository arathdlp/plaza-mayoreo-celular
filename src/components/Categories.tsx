import Link from "next/link";

type Category = { name: string; icon: React.ReactNode };

function IconPantalla() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="5" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 21h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconBateria() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="6" y="7" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 5h6v2H9z" fill="currentColor" />
    </svg>
  );
}

function IconPlaca() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconAccesorio() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCelular() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconTapa() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#0066FF]" aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 10h14" stroke="currentColor" strokeWidth="1.6" />
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
      className="border-t border-zinc-100 bg-zinc-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Categorías
          </h2>
          <p className="mt-3 text-lg text-zinc-600">
            Encuentra refacciones y equipos para todas las marcas.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={`#productos-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0066FF]/30 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF]/8 transition-colors duration-300 group-hover:bg-[#0066FF]/12">
                  {cat.icon}
                </span>
                <span className="mt-4 text-lg font-medium text-black">{cat.name}</span>
                <span className="mt-2 text-sm font-medium text-[#0066FF] transition-opacity group-hover:opacity-80">
                  Ver productos →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
