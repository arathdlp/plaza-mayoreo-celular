"use client";

import HeaderProfileMenu, { type HeaderProfile } from "@/components/HeaderProfileMenu";
import { useCarrito } from "@/hooks/useCarrito";
import { useFavoritos } from "@/hooks/useFavoritos";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

function CarritoBadge() {
  const { totalItems, listo } = useCarrito();
  if (!listo || totalItems <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-[5px] text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white">
      {totalItems > 99 ? "99+" : totalItems}
    </span>
  );
}

function FavoritosBadge() {
  const { total, listo } = useFavoritos();
  if (!listo || total <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0066FF] px-[5px] text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white">
      {total > 99 ? "99+" : total}
    </span>
  );
}

function HeartIcon({ className }: { className?: string }) {
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
      <path d="M12 20.25l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5 4 3 6.5 3c1.74 0 3.41.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 18 3 20 5 20 7.5c0 3.78-3.4 6.86-8.55 11.43L12 20.25z" />
    </svg>
  );
}

const nav = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/servicios", label: "Servicios" },
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

type HeaderClientProps = {
  isAdmin: boolean;
  profile: HeaderProfile | null;
};

export default function HeaderClient({ isAdmin, profile }: HeaderClientProps) {
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
        className="relative mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-2 px-4 sm:h-[4.5rem] sm:gap-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/#inicio"
          className="inline-flex max-w-[9.75rem] shrink-0 items-center truncate rounded-lg bg-[#0066FF] px-3 py-2 text-[0.8125rem] font-bold leading-tight tracking-tight text-white shadow-md shadow-[#0066FF]/25 transition-opacity hover:opacity-90 min-[390px]:max-w-[11rem] sm:max-w-none sm:px-4 sm:py-2 sm:text-sm"
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
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Link
            href="/favoritos"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:bg-gray-100 hover:text-[#0066FF] active:scale-95 md:hidden"
            aria-label="Favoritos"
          >
            <Heart className="h-6 w-6" />
            <FavoritosBadge />
          </Link>
          <Link
            href="/favoritos"
            className="relative hidden h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:bg-gray-100 hover:text-red-500 active:scale-95 md:flex"
            aria-label="Favoritos"
          >
            <HeartIcon />
            <FavoritosBadge />
          </Link>
          <Link
            href="/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-300 ease-out hover:bg-gray-100 hover:text-[#0066FF] active:scale-95 md:h-11 md:w-11"
            aria-label="Carrito de compras"
          >
            <ShoppingCart className="h-6 w-6 md:hidden" />
            <CartIcon className="hidden md:block" />
            <CarritoBadge />
          </Link>
          {profile ? (
            <>
              <div className="md:hidden">
                <HeaderProfileMenu profile={profile} size="sm" />
              </div>
              <div className="hidden md:block">
                <HeaderProfileMenu profile={profile} />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 ease-out hover:text-[#0066FF] active:scale-[0.97] md:hidden"
                aria-label="Iniciar sesión"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="hidden rounded-full bg-[#0066FF] px-5 py-2.5 text-[0.9375rem] font-bold text-white shadow-md shadow-[#0066FF]/25 transition-all duration-300 ease-out hover:bg-[#3385ff] hover:shadow-lg active:scale-[0.97] md:inline-flex"
              >
                Iniciar Sesión
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
