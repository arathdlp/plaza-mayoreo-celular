import type { EnvioRow } from "@/types/envio";

export type RepartidorPedidoItem = {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  imagen_url: string | null;
};

export type RepartidorContext = {
  envio: EnvioRow;
  pedido: {
    id: number;
    total: number;
    metodo_pago: string | null;
    estado_pago: string | null;
    estado: string;
    direccion_entrega: string;
  };
  cliente: {
    nombre: string;
    telefono: string;
  };
  items: RepartidorPedidoItem[];
};
