"use client";

import CartIcon from "@/components/cult/CartIcon";
import PageReveal from "@/components/PageReveal";
import { accentLabel, btnPrimary, headingPage, textMuted, textSubtle } from "@/lib/design-system";
import { formatoPesos } from "@/lib/format";
import { useCarrito } from "@/hooks/useCarrito";
import { appToast } from "@/lib/toast";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function PlaceholderThumb() {
  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[#0066FF]"
      aria-hidden
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

function QtyButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:border-[#0066FF]/40 hover:text-[#0066FF]"
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}

export default function CarritoVista() {
  const { lineas, totalPrecio, listo, incrementar, decrementar, eliminar } = useCarrito();
  const reduceMotion = useReducedMotion();

  if (!listo) {
    return (
      <PageReveal as="main" className="flex-1 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-10 w-48 rounded-lg bg-gray-200" />
          <div className="h-32 rounded-2xl bg-gray-200" />
          <div className="h-32 rounded-2xl bg-gray-200" />
        </div>
      </PageReveal>
    );
  }

  return (
    <PageReveal as="main" className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className={accentLabel}>Tu pedido</p>
        <h1 className={`mt-2 ${headingPage}`}>Carrito</h1>

        {lineas.length === 0 ? (
          <motion.div
            className="mt-12 rounded-2xl border border-gray-200 bg-white px-8 py-14 text-center shadow-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className={`text-lg ${textMuted}`}>Tu carrito está vacío.</p>
            <Link href="/productos" className={`mt-6 h-12 px-8 text-sm ${btnPrimary}`}>
              Ver productos
            </Link>
          </motion.div>
        ) : (
          <>
            <ul className="mt-10 space-y-4">
              {lineas.map((linea, index) => {
                const subtotal = linea.precio * linea.cantidad;
                return (
                  <motion.li
                    key={linea.productoId}
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                    className="flex flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5"
                  >
                    <Link
                      href={`/productos/${linea.productoId}`}
                      className="shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200/80 transition-opacity hover:opacity-90"
                    >
                      {linea.imagen_url ? (
                        <div className="relative h-20 w-20">
                          <Image
                            src={linea.imagen_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <PlaceholderThumb />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/productos/${linea.productoId}`}
                        className="cursor-pointer font-bold leading-snug text-gray-900 transition-colors hover:text-[#0066FF]"
                      >
                        {linea.nombre}
                      </Link>
                      <p className={`mt-1 text-sm ${textSubtle}`}>{formatoPesos(linea.precio)} c/u</p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2">
                          <QtyButton label="Menos una unidad" onClick={() => decrementar(linea.productoId)}>
                            −
                          </QtyButton>
                          <span className="min-w-[2rem] text-center text-sm font-bold text-gray-900">
                            {linea.cantidad}
                          </span>
                          <QtyButton label="Más una unidad" onClick={() => incrementar(linea.productoId)}>
                            +
                          </QtyButton>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            eliminar(linea.productoId);
                            appToast.eliminadoCarrito();
                          }}
                          className="cursor-pointer text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums text-gray-900">{formatoPesos(subtotal)}</p>
                      <p className={`text-xs ${textSubtle}`}>Subtotal</p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <motion.div
              className="mt-10 rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200/80 sm:p-8"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between gap-4">
                <span className={`text-lg font-semibold ${textMuted}`}>Total</span>
                <span className="text-2xl font-bold tabular-nums text-gray-900">
                  {formatoPesos(totalPrecio)}
                </span>
              </div>
              <p className={`mt-1 text-xs ${textSubtle}`}>Precios en MXN · envío calculado al pagar</p>

              <Link
                href="/checkout"
                className="cult-btn-shimmer mt-6 flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-gray-900 text-base font-semibold text-white shadow-md shadow-gray-900/20 transition-all duration-300 hover:bg-gray-800 hover:shadow-lg"
              >
                <CartIcon />
                Proceder al pago
              </Link>

              <Link
                href="/productos"
                className="mt-4 block cursor-pointer text-center text-sm font-semibold text-gray-500 transition-colors hover:text-[#0066FF]"
              >
                Seguir comprando
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </PageReveal>
  );
}
