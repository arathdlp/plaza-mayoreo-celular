import { badgesPagoPedido } from "@/lib/pedido-pago";

type Props = {
  metodoPago: string | null | undefined;
  estadoPago: string | null | undefined;
  className?: string;
};

export default function PagoBadges({ metodoPago, estadoPago, className = "" }: Props) {
  const badges = badgesPagoPedido(metodoPago, estadoPago);
  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((b) => (
        <span
          key={b.label}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${b.className}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
