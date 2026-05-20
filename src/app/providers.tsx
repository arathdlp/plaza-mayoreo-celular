"use client";

import RecomendacionesBanner from "@/components/carrito/RecomendacionesBanner";
import PwaRegister from "@/components/PwaRegister";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Toaster } from "sonner";
import { CarritoProvider } from "@/context/CarritoContext";
import { FavoritosProvider } from "@/context/FavoritosContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CarritoProvider>
      <FavoritosProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
        <RecomendacionesBanner />
        <WhatsAppFloat />
        <PwaRegister />
      </FavoritosProvider>
    </CarritoProvider>
  );
}
