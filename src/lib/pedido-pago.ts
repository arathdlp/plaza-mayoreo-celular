import { badgeEstadoPago } from "@/lib/design-system";

export type EstadoPago = "pendiente" | "pagado" | "fallido";

export function etiquetaEstadoPago(estado: string | null | undefined): string {
  const labels: Record<string, string> = {
    pendiente: "Pago pendiente",
    pagado: "Pagado",
    fallido: "Pago fallido",
  };
  if (!estado) return "—";
  return labels[estado] ?? estado;
}

export function claseBadgeEstadoPago(estado: string | null | undefined): string {
  if (!estado) return "border-gray-200 bg-gray-100 text-gray-600";
  return (
    badgeEstadoPago[estado as keyof typeof badgeEstadoPago] ??
    "border-gray-200 bg-gray-100 text-gray-700"
  );
}

export function mostrarEstadoPago(
  metodoPago: string | null | undefined,
  estadoPago: string | null | undefined,
): boolean {
  return metodoPago === "mercado_pago" && !!estadoPago;
}
