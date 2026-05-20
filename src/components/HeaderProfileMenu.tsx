"use client";

import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type HeaderProfile = {
  nombre: string;
  email: string;
  isAdmin: boolean;
};

function inicial(nombre: string): string {
  const t = nombre.trim();
  return (t[0] ?? "?").toUpperCase();
}

type HeaderProfileMenuProps = {
  profile: HeaderProfile;
  size?: "sm" | "md";
};

export default function HeaderProfileMenu({ profile, size = "md" }: HeaderProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center rounded-full bg-[#0066FF] font-bold text-white shadow-md shadow-[#0066FF]/25 transition-transform hover:scale-105 active:scale-95 ${
          size === "sm" ? "h-10 w-10 text-xs" : "h-11 w-11 text-sm"
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de cuenta"
      >
        {inicial(profile.nombre)}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 shadow-xl shadow-gray-900/10"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-bold text-[#111827]">{profile.nombre}</p>
              <p className="truncate text-xs text-gray-500">{profile.email}</p>
            </div>
            <nav className="py-1">
              {[
                { href: "/pedidos", label: "Mis pedidos" },
                { href: "/favoritos", label: "Mis favoritos" },
                { href: "/perfil", label: "Mi perfil" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="flex min-h-11 items-center px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0066FF]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {profile.isAdmin ? (
                <Link
                  href="/admin"
                  role="menuitem"
                  className="flex min-h-11 items-center px-4 py-2.5 text-sm font-semibold text-[#0066FF] hover:bg-[#0066FF]/5"
                  onClick={() => setOpen(false)}
                >
                  Panel admin
                </Link>
              ) : null}
            </nav>
            <div className="border-t border-gray-100 pt-1">
              <button
                type="button"
                role="menuitem"
                className="min-h-11 w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                onClick={() => void cerrarSesion()}
              >
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
