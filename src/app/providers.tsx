"use client";

import { CarritoProvider } from "@/context/CarritoContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <CarritoProvider>{children}</CarritoProvider>;
}
