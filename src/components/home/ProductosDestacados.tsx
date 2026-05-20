import ProductoCard from "@/components/productos/ProductoCard";
import { getProductosDestacados } from "@/lib/recomendaciones";
import { productosListHref } from "@/lib/productos-url";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export default async function ProductosDestacados() {
  const productos = await getProductosDestacados(8);
  if (productos.length === 0) return null;

  return (
    <section className="border-t border-gray-200 bg-gray-50/80 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0066FF]">Destacados</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Productos destacados
              </h2>
            </div>
          </div>
        </ScrollReveal>

        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {productos.map((p) => (
            <li key={p.id}>
              <ProductoCard producto={p} />
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center">
          <Link
            href={productosListHref({})}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-[#0066FF] shadow-sm transition hover:border-[#0066FF]/30 hover:shadow-md"
          >
            Ver todos →
          </Link>
        </p>
      </div>
    </section>
  );
}
