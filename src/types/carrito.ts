export type CarritoLinea = {
  productoId: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  cantidad: number;
};

/** Snapshot mínimo para agregar al carrito desde tarjetas o detalle */
export type ProductoCarritoPayload = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  marca?: string;
  modelo?: string;
  categoria?: string;
};
