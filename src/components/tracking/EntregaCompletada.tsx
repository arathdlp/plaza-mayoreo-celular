"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

type EntregaCompletadaProps = {
  pedidoId: number;
  horaEntrega?: string | null;
  repartidorNombre?: string | null;
  ticketHref?: string;
  backHref?: string;
};

const BLUE = "#0066FF";

function formatHora(value?: string | null): string {
  if (!value) return "Hace unos momentos";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Hace unos momentos";
  }
}

function CelebrationParticles() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const x = Math.cos(angle) * (72 + (i % 3) * 18);
        const y = Math.sin(angle) * (52 + (i % 4) * 12);
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 block rounded-full"
            style={{
              width: i % 4 === 0 ? 12 : 5,
              height: i % 4 === 0 ? 2 : 5,
              backgroundColor: i % 3 === 0 ? "#FFFFFF" : BLUE,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.55, 0], x, y, scale: [0.6, 1, 0.8] }}
            transition={{ duration: 0.8, delay: 2.2 + (i % 6) * 0.06, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

function CompletedPhone({ mini = false }: { mini?: boolean }) {
  const scale = mini ? 0.32 : 1;

  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: 180 * scale, height: 240 * scale }}
      initial={mini ? false : { opacity: 0, y: 48, scale: 0.92 }}
      animate={mini ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 18, duration: 0.8 }}
    >
      {!mini ? <CelebrationParticles /> : null}
      <svg viewBox="0 0 180 240" className="relative h-full w-full drop-shadow-sm" role="img" aria-label="Celular completado">
        <defs>
          <linearGradient id="screen-on" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#003399" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
          <clipPath id="phone-screen-clip">
            <rect x="49" y="38" width="82" height="156" rx="14" />
          </clipPath>
        </defs>

        <rect x="38" y="14" width="104" height="212" rx="26" fill={BLUE} />
        <rect x="45" y="26" width="90" height="176" rx="18" fill="#111827" />
        <motion.rect
          x="49"
          y="38"
          width="82"
          height="156"
          rx="14"
          fill="url(#screen-on)"
          initial={mini ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: mini ? 0 : 0.8, duration: 0.7 }}
        />
        {!mini ? (
          <motion.rect
            x="49"
            y="38"
            width="82"
            height="28"
            rx="14"
            fill="rgba(255,255,255,0.22)"
            clipPath="url(#phone-screen-clip)"
            initial={{ y: -34, opacity: 0 }}
            animate={{ y: 142, opacity: [0, 0.85, 0] }}
            transition={{ delay: 0.85, duration: 0.7, ease: "easeInOut" }}
          />
        ) : null}
        <circle cx="90" cy="215" r="5" fill="#FFFFFF" opacity="0.9" />
        <rect x="76" y="25" width="28" height="4" rx="2" fill="#FFFFFF" opacity="0.9" />

        <text x="90" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">
          Plaza Mayoreo
        </text>
        <text x="90" y="105" textAnchor="middle" fill="#FFFFFF" fontSize="6" opacity="0.86">
          del Celular
        </text>

        <motion.path
          d="M68 134 L83 149 L113 118"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={mini ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: mini ? 0 : 1.5, duration: 0.7, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}

export function MiniEntregaBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 rounded-full border border-[#0066FF]/20 bg-[#0066FF]/5 px-3 py-1 text-xs font-semibold text-[#0066FF]"
    >
      <span className="relative h-6 w-5">
        <CompletedPhone mini />
      </span>
      Entregado
    </motion.div>
  );
}

export default function EntregaCompletada({
  pedidoId,
  horaEntrega,
  repartidorNombre,
  ticketHref,
  backHref = "/",
}: EntregaCompletadaProps) {
  return (
    <main
      className="min-h-[100dvh] bg-white px-5 py-8 text-[#111827]"
      style={{
        backgroundImage:
          "linear-gradient(#F3F4F6 1px, transparent 1px), linear-gradient(90deg, #F3F4F6 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col items-center justify-center text-center"
      >
        <CompletedPhone />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.45 }}
          className="mt-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Pedido entregado</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Tu pedido #{pedidoId} fue entregado exitosamente
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.12, duration: 0.45 }}
          className="mt-6 w-full rounded-3xl border border-gray-200 bg-white/90 p-5 text-left shadow-sm backdrop-blur"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6B7280]">Hora de entrega</span>
              <span className="font-semibold text-[#111827]">{formatHora(horaEntrega)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6B7280]">Repartidor</span>
              <span className="font-semibold text-[#111827]">{repartidorNombre || "Equipo de entrega"}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {ticketHref ? (
              <a
                href={ticketHref}
                download
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0066FF] text-sm font-semibold text-white"
              >
                <FileText className="h-4 w-4" />
                Descargar ticket
              </a>
            ) : null}
            <Link
              href={backHref}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-[#111827]"
            >
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
