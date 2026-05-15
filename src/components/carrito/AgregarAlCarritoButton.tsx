"use client";

import { useCarrito } from "@/hooks/useCarrito";
import type { ProductoCarritoPayload } from "@/types/carrito";

type Props = {
  producto: ProductoCarritoPayload;
  size?: "sm" | "lg";
  className?: string;
};

export default function AgregarAlCarritoButton({
  producto,
  size = "sm",
  className = "",
}: Props) {
  const { agregar } = useCarrito();

  const base =
    size === "lg"
      ? "mt-10 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#0066FF] text-base font-semibold text-white shadow-lg shadow-[#0066FF]/30 transition-all duration-300 hover:bg-[#3385ff] hover:shadow-xl active:scale-[0.97] sm:w-auto sm:min-w-[280px]"
      : "pointer-events-auto relative z-[2] mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0066FF] text-sm font-semibold text-white shadow-md shadow-[#0066FF]/20 transition-all duration-300 hover:bg-[#3385ff] hover:shadow-lg active:scale-[0.97]";

  return (
    <button
      type="button"
      className={`${base} ${className}`.trim()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        agregar(producto);
      }}
    >
      Agregar al carrito
    </button>
  );
}
