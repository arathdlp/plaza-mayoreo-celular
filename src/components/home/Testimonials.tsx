"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIOS = [
  {
    nombre: "María G.",
    inicial: "M",
    texto: "Excelente servicio y refacciones originales. Mi pantalla quedó perfecta y la entrega fue muy rápida.",
  },
  {
    nombre: "Carlos R.",
    inicial: "C",
    texto: "Los mejores precios de Morelia. El equipo siempre resuelve dudas y el seguimiento del pedido es clarísimo.",
  },
  {
    nombre: "Ana L.",
    inicial: "A",
    texto: "Compré batería y tapa para mi Samsung. Todo llegó bien empacado y con garantía. Totalmente recomendados.",
  },
] as const;

export default function Testimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-gray-200 bg-[#f8fafc] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
        </ScrollReveal>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIOS.map((t, i) => (
            <motion.li
              key={t.nombre}
              className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0066FF]/10 text-sm font-bold text-[#0066FF]">
                  {t.inicial}
                </span>
                <div>
                  <p className="font-bold text-[#111827]">{t.nombre}</p>
                  <p className="flex gap-0.5 text-amber-500" aria-label="5 estrellas">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{t.texto}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
