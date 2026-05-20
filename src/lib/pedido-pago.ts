import { badgeEstadoPago } from "@/lib/design-system";

export type MetodoPago = "mercado_pago" | "contra_entrega" | string;
export type EstadoPago = "pendiente" | "pagado" | "fallido";

export type PagoBadge = { label: string; className: string; icon: "card" | "cash" | "check" | "clock" | "alert" };

const metodoBadges: Record<string, PagoBadge> = {
  mercado_pago: {
    label: "Mercado Pago",
    className: "border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF]",
    icon: "card",
  },
  contra_entrega: {
    label: "Efectivo al recibir",
    className: "border-orange-200 bg-orange-50 text-orange-800",
    icon: "cash",
  },
};

const estadoBadges: Record<string, PagoBadge> = {
  pagado: {
    label: "Pagado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "check",
  },
  pendiente: {
    label: "Pendiente",
    className: "border-gray-200 bg-gray-100 text-gray-600",
    icon: "clock",
  },
  fallido: {
    label: "Pago fallido",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: "alert",
  },
};

export function badgeMetodoPago(metodo: string | null | undefined): PagoBadge | null {
  if (!metodo) return null;
  return metodoBadges[metodo] ?? null;
}

export function badgeEstadoPagoPedido(estado: string | null | undefined): PagoBadge | null {
  if (!estado) return null;
  return (
    estadoBadges[estado] ?? {
      label: estado,
      className: "border-gray-200 bg-gray-100 text-gray-700",
      icon: "clock",
    }
  );
}

/** Badges de método + estado de pago para listados de pedidos. */
export function badgesPagoPedido(
  metodoPago: string | null | undefined,
  estadoPago: string | null | undefined,
): PagoBadge[] {
  const out: PagoBadge[] = [];
  const metodo = badgeMetodoPago(metodoPago);
  if (metodo) out.push(metodo);

  if (metodoPago === "mercado_pago" && estadoPago) {
    const estado = badgeEstadoPagoPedido(estadoPago);
    if (estado) out.push(estado);
  } else if (metodoPago === "contra_entrega") {
    if (estadoPago === "pagado") {
      out.push(estadoBadges.pagado);
    } else {
      out.push(estadoBadges.pendiente);
    }
  }

  return out;
}

export function etiquetaEstadoPago(estado: string | null | undefined): string {
  return badgeEstadoPagoPedido(estado)?.label ?? "—";
}

export function claseBadgeEstadoPago(estado: string | null | undefined): string {
  if (!estado) return "border-gray-200 bg-gray-100 text-gray-600";
  return (
    badgeEstadoPago[estado as keyof typeof badgeEstadoPago] ??
    badgeEstadoPagoPedido(estado)?.className ??
    "border-gray-200 bg-gray-100 text-gray-700"
  );
}

/** @deprecated Usar badgesPagoPedido */
export function mostrarEstadoPago(
  metodoPago: string | null | undefined,
  estadoPago: string | null | undefined,
): boolean {
  return badgesPagoPedido(metodoPago, estadoPago).length > 1;
}
