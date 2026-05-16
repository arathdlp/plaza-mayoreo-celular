"use client";

import { useCarrito } from "@/hooks/useCarrito";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

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

const navLinkClass =
  "relative text-[0.9375rem] font-semibold text-gray-600 transition-colors duration-300 ease-out hover:text-[#0066FF] after:absolute after:bottom-[-6px] after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-[#0066FF] after:transition-all after:duration-300 after:ease-out hover:after:w-full";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={navLinkClass}>
      {children}
    </Link>
  );
}

const adminNavClassDesktop =
  "text-[0.9375rem] font-semibold text-[#0066FF] transition-colors duration-300 ease-out hover:text-[#3385ff]";
const adminNavClassMobile =
  "rounded-lg px-3 py-2.5 text-[0.9375rem] font-semibold text-[#0066FF] transition-colors hover:bg-[#0066FF]/8 hover:text-[#3385ff]";

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

type HeaderClientProps = {
  isAdmin: boolean;
};

export default function HeaderClient({ isAdmin }: HeaderClientProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <motion.header
      className={`sticky top-0 z-50 border-b transition-[border-color,box-shadow,background-color] duration-300 ${
        solid ? "border-gray-200/95 bg-white/90 shadow-[0_4px_24px_-8px_rgba(17,24,39,0.08)] backdrop-blur-md" : "border-transparent bg-white/0 shadow-none"
      }`}
      initial={false}
      animate={{
        backgroundColor: solid ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0)",
        borderColor: solid ? "rgba(229, 231, 235, 0.95)" : "rgba(229, 231, 235, 0)",
        boxShadow: solid ? "0 4px 24px -8px rgba(17, 24, 39, 0.08)" : "0 0 0 rgba(17, 24, 39, 0)",
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0"
        animate={{ opacity: solid ? 0 : isHome ? 0.6 : 0 }}
        transition={{ duration: 0.35 }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/#inicio"
          className="max-w-[11rem] shrink-0 truncate text-[0.9375rem] font-bold tracking-tight text-gray-900 transition-opacity hover:opacity-80 sm:max-w-none sm:text-base"
        >
          Plaza Mayoreo del Celular
        </Link>

        <nav className="hidden items-center gap-8 lg:gap-9 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          {isAdmin ? (
            <Link href="/admin" className={adminNavClassDesktop}>
              Admin
            </Link>
          ) : null}
        </nav>

        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Link
            href="/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:bg-gray-100 hover:text-[#0066FF] active:scale-95"
            aria-label="Carrito de compras"
          >
            <CartIcon />
            <CarritoBadge />
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full bg-[#0066FF] px-5 py-2.5 text-[0.9375rem] font-bold text-white shadow-md shadow-[#0066FF]/25 transition-all duration-300 ease-out hover:bg-[#3385ff] hover:shadow-lg active:scale-[0.97] sm:inline-flex"
          >
            Iniciar Sesión
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <MenuIcon open={open} />
          </button>
        </motion.div>
      </motion.div>

      <div
        id="mobile-menu"
        className={`relative border-t border-gray-100 bg-white/95 backdrop-blur-md transition-all duration-300 ease-out md:hidden ${
          open ? "max-h-[28rem] opacity-100" : "max-h-0 overflow-hidden border-t-transparent opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Móvil">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-[0.9375rem] font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0066FF]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link href="/admin" className={adminNavClassMobile} onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : null}
          <Link
            href="/carrito"
            className="rounded-lg px-3 py-2.5 text-[0.9375rem] font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0066FF]"
            onClick={() => setOpen(false)}
          >
            Carrito
          </Link>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[#0066FF] px-4 py-3 text-[0.9375rem] font-bold text-white transition-all duration-300 ease-out hover:bg-[#3385ff] active:scale-[0.97]"
            onClick={() => setOpen(false)}
          >
            Iniciar Sesión
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
