"use client";

import PwaRegister from "@/components/PwaRegister";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CarritoProvider } from "@/context/CarritoContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CarritoProvider>
      {children}
      <WhatsAppFloat />
      <PwaRegister />
    </CarritoProvider>
  );
}
