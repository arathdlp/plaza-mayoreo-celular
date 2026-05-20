"use client";

import { btnPrimary, btnSecondary } from "@/lib/design-system";

type Props = {
  pedidoId: number;
  /** URL absoluta del ticket (p. ej. desde siteUrl() en el servidor). */
  ticketUrl: string;
};

export default function PedidoTicketButtons({ pedidoId, ticketUrl }: Props) {
  const downloadHref = `/api/pedidos/${pedidoId}/ticket`;
  const mensaje = `Aquí está tu ticket: ${ticketUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <a
        href={downloadHref}
        download
        className={`flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold ${btnPrimary}`}
      >
        📄 Descargar ticket
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold ${btnSecondary}`}
      >
        📱 Enviar por WhatsApp
      </a>
    </div>
  );
}
