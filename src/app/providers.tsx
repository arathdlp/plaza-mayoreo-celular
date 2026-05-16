"use client";

import PwaRegister from "@/components/PwaRegister";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CarritoProvider } from "@/context/CarritoContext";
import { FavoritosProvider } from "@/context/FavoritosContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CarritoProvider>
      <FavoritosProvider>
        {children}
        <WhatsAppFloat />
        <PwaRegister />
      </FavoritosProvider>
    </CarritoProvider>
  );
}
