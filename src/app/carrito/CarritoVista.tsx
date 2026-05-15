"use client";

import { formatoPesos } from "@/lib/format";
import { useCarrito } from "@/hooks/useCarrito";
import Image from "next/image";
import Link from "next/link";

function PlaceholderThumb() {
  return (
    <div
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#0a1628] to-[#12121c] text-[#0066FF]/35 sm:h-28 sm:w-28"
      aria-hidden
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export default function CarritoVista() {
  const {
    lineas,
    totalPrecio,
    listo,
    incrementar,
    decrementar,
    eliminar,
  } = useCarrito();

  if (!listo) {
    return (
      <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-10 w-48 rounded-lg bg-white/10" />
          <div className="h-32 rounded-2xl bg-white/10" />
          <div className="h-32 rounded-2xl bg-white/10" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,102,255,0.18), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">
          Tu pedido
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Carrito</h1>

        {lineas.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-14 text-center backdrop-blur-sm">
            <p className="text-lg text-white/70">Tu carrito está vacío.</p>
            <Link
              href="/productos"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-all duration-300 hover:bg-[#3385ff]"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 space-y-4">
              {lineas.map((linea) => {
                const subtotal = linea.precio * linea.cantidad;
                return (
                  <li
                    key={linea.productoId}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-5"
                  >
                    <Link
                      href={`/productos/${linea.productoId}`}
                      className="shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 transition-opacity hover:opacity-90"
                    >
                      {linea.imagen_url ? (
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                          <Image
                            src={linea.imagen_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        </div>
                      ) : (
                        <PlaceholderThumb />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/productos/${linea.productoId}`}
                        className="font-semibold leading-snug text-white transition-colors hover:text-[#0066FF]"
                      >
                        {linea.nombre}
                      </Link>
                      <p className="mt-1 text-sm text-white/50">
                        {formatoPesos(linea.precio)} c/u
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-black/30 p-1">
                          <button
                            type="button"
                            onClick={() => decrementar(linea.productoId)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium text-white transition-colors hover:bg-white/10"
                            aria-label="Menos una unidad"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold text-white">
                            {linea.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementar(linea.productoId)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium text-white transition-colors hover:bg-white/10"
                            aria-label="Más una unidad"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => eliminar(linea.productoId)}
                          className="text-sm font-medium text-red-400 transition-colors hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end justify-between">
                      <p className="text-lg font-semibold tabular-nums text-white">
                        {formatoPesos(subtotal)}
                      </p>
                      <p className="text-xs text-white/40">Subtotal</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 rounded-2xl border border-[#0066FF]/25 bg-[#0066FF]/10 px-6 py-6 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-medium text-white/80">Total</span>
                <span className="text-2xl font-semibold tabular-nums tracking-tight text-white">
                  {formatoPesos(totalPrecio)}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/45">Precios en MXN · envío calculado al pagar</p>

              <Link
                href="/checkout"
                className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-[#0066FF] text-base font-semibold text-white shadow-lg shadow-[#0066FF]/30 transition-all duration-300 hover:bg-[#3385ff] hover:shadow-xl active:scale-[0.98]"
              >
                Proceder al pago
              </Link>

              <Link
                href="/productos"
                className="mt-4 block text-center text-sm font-medium text-white/55 transition-colors hover:text-[#0066FF]"
              >
                Seguir comprando
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
