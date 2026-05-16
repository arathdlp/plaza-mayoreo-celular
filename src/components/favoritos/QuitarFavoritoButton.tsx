"use client";

import { useFavoritos } from "@/hooks/useFavoritos";

export default function QuitarFavoritoButton({ productoId }: { productoId: number }) {
  const { quitar } = useFavoritos();

  return (
    <button
      type="button"
      className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2 text-center text-xs font-semibold text-gray-600 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void quitar(productoId);
      }}
    >
      Quitar de favoritos
    </button>
  );
}
