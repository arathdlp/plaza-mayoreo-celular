import AgregarAlCarritoButton from "@/components/carrito/AgregarAlCarritoButton";
import { formatoPesos } from "@/lib/format";
import type { Producto } from "@/types/producto";
import Image from "next/image";
import Link from "next/link";

function ProductoImagenGrande({ producto }: { producto: Producto }) {
  if (producto.imagen_url) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)]">
        <Image
          src={producto.imagen_url}
          alt={producto.nombre}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1628] to-[#12121c] text-[#0066FF]/30 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)]"
      aria-hidden
    >
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300">
        Agotado
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-200">
        Últimas {stock} unidades
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
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
    <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,102,255,0.18), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors duration-300 hover:text-[#0066FF]">
                Inicio
              </Link>
            </li>
            <li aria-hidden className="text-white/30">
              /
            </li>
            <li>
              <Link
                href="/productos"
                className="transition-colors duration-300 hover:text-[#0066FF]"
              >
                Productos
              </Link>
            </li>
            <li aria-hidden className="text-white/30">
              /
            </li>
            <li className="font-medium text-white/90" aria-current="page">
              {producto.nombre}
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <ProductoImagenGrande producto={producto} />

          <div className="flex flex-col">
            <span className="inline-flex w-fit rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 px-3 py-1 text-sm font-medium text-[#0066FF]">
              {producto.categoria}
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {producto.nombre}
            </h1>

            <p className="mt-3 text-lg text-white/60">
              <span className="font-medium text-white/80">{producto.marca}</span>
              <span className="mx-2 text-white/30">·</span>
              <span>{producto.modelo}</span>
            </p>

            {descripcion ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/45">
                  Descripción
                </h2>
                <p className="mt-2 leading-relaxed text-white/70">{descripcion}</p>
              </div>
            ) : null}

            <p className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {formatoPesos(producto.precio)}
            </p>

            {producto.stock != null ? (
              <div className="mt-4">
                <StockBadge stock={producto.stock} />
              </div>
            ) : null}

            <AgregarAlCarritoButton
              size="lg"
              producto={{
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen_url: producto.imagen_url,
              }}
            />
          </div>
        </div>

        <Link
          href="/productos"
          className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors duration-300 hover:text-[#0066FF]"
        >
          <span aria-hidden>←</span>
          Volver a productos
        </Link>
      </div>
    </main>
  );
}
