"use client";

import type { CarritoLinea, ProductoCarritoPayload } from "@/types/carrito";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "plaza-mayoreo-carrito-v1";

type CarritoContextValue = {
  lineas: CarritoLinea[];
  /** Unidades totales (suma de cantidades) para badge */
  totalItems: number;
  /** Importe total MXN */
  totalPrecio: number;
  /** Ya hidratado desde localStorage */
  listo: boolean;
  agregar: (p: ProductoCarritoPayload) => void;
  incrementar: (productoId: number) => void;
  decrementar: (productoId: number) => void;
  eliminar: (productoId: number) => void;
  vaciar: () => void;
};

const CarritoContext = createContext<CarritoContextValue | null>(null);

function leerStorage(): CarritoLinea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is CarritoLinea =>
          row &&
          typeof row === "object" &&
          typeof (row as CarritoLinea).productoId === "number" &&
          typeof (row as CarritoLinea).nombre === "string" &&
          typeof (row as CarritoLinea).precio === "number" &&
          typeof (row as CarritoLinea).cantidad === "number",
      )
      .map((row) => ({
        ...row,
        imagen_url:
          row.imagen_url === null || typeof row.imagen_url === "string"
            ? row.imagen_url
            : null,
        cantidad: Math.max(1, Math.floor(row.cantidad)),
      }));
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [lineas, setLineas] = useState<CarritoLinea[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setLineas(leerStorage());
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lineas));
    } catch {
      /* ignore quota */
    }
  }, [lineas, listo]);

  const agregar = useCallback((p: ProductoCarritoPayload) => {
    setLineas((prev) => {
      const idx = prev.findIndex((l) => l.productoId === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productoId: p.id,
          nombre: p.nombre,
          precio: p.precio,
          imagen_url: p.imagen_url,
          cantidad: 1,
        },
      ];
    });
  }, []);

  const incrementar = useCallback((productoId: number) => {
    setLineas((prev) =>
      prev.map((l) =>
        l.productoId === productoId ? { ...l, cantidad: l.cantidad + 1 } : l,
      ),
    );
  }, []);

  const decrementar = useCallback((productoId: number) => {
    setLineas((prev) =>
      prev.flatMap((l) => {
        if (l.productoId !== productoId) return [l];
        if (l.cantidad <= 1) return [];
        return [{ ...l, cantidad: l.cantidad - 1 }];
      }),
    );
  }, []);

  const eliminar = useCallback((productoId: number) => {
    setLineas((prev) => prev.filter((l) => l.productoId !== productoId));
  }, []);

  const vaciar = useCallback(() => setLineas([]), []);

  const totalItems = useMemo(
    () => lineas.reduce((s, l) => s + l.cantidad, 0),
    [lineas],
  );

  const totalPrecio = useMemo(
    () => lineas.reduce((s, l) => s + l.precio * l.cantidad, 0),
    [lineas],
  );

  const value = useMemo<CarritoContextValue>(
    () => ({
      lineas,
      totalItems,
      totalPrecio,
      listo,
      agregar,
      incrementar,
      decrementar,
      eliminar,
      vaciar,
    }),
    [
      lineas,
      totalItems,
      totalPrecio,
      listo,
      agregar,
      incrementar,
      decrementar,
      eliminar,
      vaciar,
    ],
  );

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

export function useCarrito(): CarritoContextValue {
  const ctx = useContext(CarritoContext);
  if (!ctx) {
    throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  }
  return ctx;
}
