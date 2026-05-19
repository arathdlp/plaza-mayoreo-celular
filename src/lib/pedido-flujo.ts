import type { EstadoEnvio } from "@/types/envio";

export type MetodoPagoPedido = "mercado_pago" | "contra_entrega" | string | null;

/** Estado operativo del pedido según el envío (null = sin cambio). */
export function estadoPedidoPorEnvio(envioEstado: EstadoEnvio): string | null {
  if (envioEstado === "en_camino") return "enviado";
  if (envioEstado === "entregado") return "entregado";
  return null;
}

export function patchPedidoAlEntregar(metodoPago: MetodoPagoPedido): {
  estado: "entregado";
  estado_pago?: "pagado";
} {
  const patch: { estado: "entregado"; estado_pago?: "pagado" } = { estado: "entregado" };
  if (metodoPago === "contra_entrega") {
    patch.estado_pago = "pagado";
  }
  return patch;
}
