"use client";

import ShimmerButton from "@/components/cult/ShimmerButton";
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

  return (
    <ShimmerButton
      size={size === "lg" ? "lg" : "md"}
      fullWidth
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        agregar(producto);
      }}
    >
      Agregar al carrito
    </ShimmerButton>
  );
}
