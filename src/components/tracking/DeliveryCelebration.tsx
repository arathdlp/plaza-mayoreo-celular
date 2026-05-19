"use client";

import SuccessCheckBurst from "@/components/auth/SuccessCheckBurst";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#0066FF", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function DeliveryCelebration() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 to-white px-6 py-12">
      {!reduceMotion ? (
        <motion.div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 36 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-sm"
              style={{
                left: `${(i * 17) % 100}%`,
                top: "-8%",
                backgroundColor: COLORS[i % COLORS.length],
              }}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: "110vh",
                opacity: [1, 1, 0],
                rotate: 360 + i * 20,
              }}
              transition={{
                duration: 2.8 + (i % 5) * 0.3,
                delay: (i % 8) * 0.08,
                ease: "easeIn",
              }}
            />
          ))}
        </motion.div>
      ) : null}

      <SuccessCheckBurst
        size="lg"
        title="¡Tu pedido fue entregado!"
        description="Gracias por comprar en Plaza Mayoreo del Celular"
      />
    </div>
  );
}
