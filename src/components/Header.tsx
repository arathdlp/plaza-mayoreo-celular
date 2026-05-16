"use client";

import { useCarrito } from "@/hooks/useCarrito";
import Link from "next/link";
import { useState } from "react";

function CarritoBadge() {
  const { totalItems, listo } = useCarrito();
  if (!listo || totalItems <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0066FF] px-[5px] text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white">
      {totalItems > 99 ? "99+" : totalItems}
    </span>
  );
}

const nav = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#capacitaciones", label: "Capacitaciones" },
  { href: "/#contacto", label: "Contacto" },
] as const;

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="M6 6l12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md transition-[box-shadow] duration-300 supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/#inicio"
          className="max-w-[11rem] shrink-0 truncate text-sm font-semibold tracking-tight text-black transition-opacity hover:opacity-80 sm:max-w-none sm:text-base"
        >
          Plaza Mayoreo del Celular
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Principal"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-600 transition-colors duration-300 ease-out hover:text-[#0066FF]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition-all duration-300 ease-out hover:bg-zinc-100 hover:text-[#0066FF] active:scale-95"
            aria-label="Carrito de compras"
          >
            <CartIcon />
            <CarritoBadge />
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#0066FF]/20 transition-all duration-300 ease-out hover:bg-[#3385ff] hover:shadow-lg active:scale-[0.97] sm:inline-flex"
          >
            Iniciar Sesión
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition-colors hover:bg-zinc-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`border-t border-zinc-100 bg-white transition-all duration-300 ease-out md:hidden ${
          open
            ? "max-h-[24rem] opacity-100"
            : "max-h-0 overflow-hidden border-t-transparent opacity-0"
        }`}
      >
        <nav
          className="flex flex-col gap-1 px-4 py-4"
          aria-label="Móvil"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-[#0066FF]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/carrito"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-[#0066FF]"
            onClick={() => setOpen(false)}
          >
            Carrito
          </Link>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-[#3385ff] active:scale-[0.97]"
            onClick={() => setOpen(false)}
          >
            Iniciar Sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
