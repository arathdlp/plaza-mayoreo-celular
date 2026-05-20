"use client";

import { btnPrimary, btnSecondary } from "@/lib/design-system";
import { FileText, Send } from "lucide-react";

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
        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold ${btnPrimary}`}
      >
        <FileText className="h-4 w-4" />
        Descargar ticket
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold ${btnSecondary}`}
      >
        <Send className="h-4 w-4" />
        Enviar por WhatsApp
      </a>
    </div>
  );
}
