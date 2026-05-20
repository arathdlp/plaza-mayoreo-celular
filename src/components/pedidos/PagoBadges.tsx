import { badgesPagoPedido } from "@/lib/pedido-pago";
import { AlertCircle, Banknote, Check, Clock, CreditCard } from "lucide-react";

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
      {badges.map((b) => {
        const Icon =
          b.icon === "card"
            ? CreditCard
            : b.icon === "cash"
              ? Banknote
              : b.icon === "check"
                ? Check
                : b.icon === "alert"
                  ? AlertCircle
                  : Clock;
        return (
          <span
            key={b.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${b.className}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {b.label}
          </span>
        );
      })}
    </div>
  );
}
