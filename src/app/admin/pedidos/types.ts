import type { EnvioRow } from "@/types/envio";

export type PedidoAdminRow = {
  id: number;
  cliente_id: string;
  created_at: string;
  total: number;
  estado: string;
  estado_pago: string | null;
  metodo_pago: string | null;
  clienteNombre: string;
  clienteEmail: string;
  envio: EnvioRow | null;
};
