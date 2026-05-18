"use client";

import PageReveal from "@/components/PageReveal";
import { authFieldClass, authLabelClass } from "@/components/auth/AuthShell";
import {
  accentLabel,
  alertError,
  btnPrimary,
  cardStatic,
  headingPage,
  inputClass,
  labelClass,
  textMuted,
} from "@/lib/design-system";
import { SPRING_SOFT, staggerContainer, staggerItem } from "@/lib/motion-landing";
import { ETIQUETAS_TIPO_SERVICIO } from "@/lib/servicios-labels";
import { TIPOS_SERVICIO, type TipoServicio } from "@/types/servicio";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { crearSolicitudServicio } from "./actions";

const iconClass = "text-[#0066FF]";

const SERVICIOS_CARDS: {
  tipo: TipoServicio;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    tipo: "reparacion",
    title: "Reparaciones",
    description: "Diagnóstico claro y reparación profesional de pantallas, carga, audio y más.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path
          d="m14.7 6.3 1.4 1.4L8.8 15H7v-1.8l7.7-7.7ZM4 20h16"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    tipo: "desbloqueo",
    title: "Desbloqueos y Liberaciones",
    description: "Liberamos tu equipo para cualquier compañía con proceso seguro y respaldo.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path d="M7 11V8a5 5 0 0 1 9.9-1" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.65" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    tipo: "instalacion",
    title: "Instalaciones a Domicilio",
    description: "Pantallas, baterías y accesorios instalados donde tú estés en Morelia.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path
          d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    tipo: "asesoria",
    title: "Asesorías Técnicas",
    description: "Te orientamos en compatibilidad, compra de refacciones y mejores opciones para tu negocio.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path
          d="M7 18a8 8 0 1 1 3.2-6.4M7 18H4m3 0v3m9-3a3 3 0 0 0-5.2-2.1M16 18h3m-3 0v3"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function SuccessAnimation({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-12 text-center"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING_SOFT}
    >
      <motion.div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { ...SPRING_SOFT, delay: 0.1 }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <h2 className="mt-6 text-xl font-bold text-[#111827]">¡Solicitud enviada!</h2>
      <p className={`mt-2 text-sm ${textMuted}`}>
        Nos pondremos en contacto contigo pronto para coordinar tu servicio.
      </p>
    </motion.div>
  );
}

export default function ServiciosPage() {
  const reduceMotion = useReducedMotion();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>("reparacion");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await crearSolicitudServicio({
      nombre,
      telefono,
      email,
      tipo_servicio: tipoServicio,
      marca_equipo: marca,
      modelo_equipo: modelo,
      descripcion,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setEnviado(true);
  }

  return (
    <PageReveal as="main" className="flex-1 bg-white">
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-[#0066FF]/8 via-white to-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,102,255,0.15), transparent 70%)",
          }}
          aria-hidden
        />
        <motion.div
          className="relative mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={accentLabel}>Servicio técnico</p>
          <motion.h1
            className={`mt-3 ${headingPage}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { ...SPRING_SOFT, delay: 0.15 }}
          >
            Soluciones para tu celular
          </motion.h1>
          <p className={`mx-auto mt-4 max-w-2xl text-base sm:text-lg ${textMuted}`}>
            Reparaciones, liberaciones, instalación a domicilio y asesoría. Cuéntanos qué necesitas y te
            respondemos a la brevedad.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.ul
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={reduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8%" }}
        >
          {SERVICIOS_CARDS.map((s) => (
            <motion.li key={s.tipo} variants={reduceMotion ? undefined : staggerItem}>
              <motion.div
                className={`${cardStatic} cult-product-card flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-md hover:shadow-blue-500/10`}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0066FF]/10"
                  whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                >
                  {s.icon}
                </motion.div>
                <h2 className="mt-4 text-base font-bold text-[#111827]">{s.title}</h2>
                <p className={`mt-2 flex-1 text-sm leading-relaxed ${textMuted}`}>{s.description}</p>
              </motion.div>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <section id="solicitud" className="border-t border-gray-200 bg-gray-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-center text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
            Solicita tu servicio
          </h2>
          <p className={`mt-2 text-center text-sm ${textMuted}`}>
            Completa el formulario y nuestro equipo te contactará.
          </p>

          {enviado ? (
            <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SuccessAnimation reduceMotion={!!reduceMotion} />
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className={`mt-10 ${cardStatic} space-y-5 p-6 sm:p-8`}>
              {error ? (
                <motion.div
                  role="alert"
                  className={alertError}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              ) : null}

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <label htmlFor="svc-nombre" className={authLabelClass}>
                  Nombre completo
                </label>
                <input
                  id="svc-nombre"
                  name="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={authFieldClass}
                  placeholder="Tu nombre"
                />
              </motion.div>

              <motion.div
                className="grid gap-5 sm:grid-cols-2"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
              >
                <motion.div>
                  <label htmlFor="svc-telefono" className={authLabelClass}>
                    Teléfono
                  </label>
                  <input
                    id="svc-telefono"
                    name="telefono"
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className={authFieldClass}
                    placeholder="443 540 2474"
                  />
                </motion.div>
                <motion.div>
                  <label htmlFor="svc-email" className={authLabelClass}>
                    Email
                  </label>
                  <input
                    id="svc-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={authFieldClass}
                    placeholder="tu@correo.com"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="svc-tipo" className={authLabelClass}>
                  Tipo de servicio
                </label>
                <select
                  id="svc-tipo"
                  name="tipo_servicio"
                  required
                  value={tipoServicio}
                  onChange={(e) => setTipoServicio(e.target.value as TipoServicio)}
                  className={inputClass}
                >
                  {TIPOS_SERVICIO.map((t) => (
                    <option key={t} value={t}>
                      {ETIQUETAS_TIPO_SERVICIO[t]}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div
                className="grid gap-5 sm:grid-cols-2"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
              >
                <motion.div>
                  <label htmlFor="svc-marca" className={labelClass}>
                    Marca del equipo
                  </label>
                  <input
                    id="svc-marca"
                    name="marca"
                    type="text"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className={inputClass}
                    placeholder="Samsung, iPhone…"
                  />
                </motion.div>
                <motion.div>
                  <label htmlFor="svc-modelo" className={labelClass}>
                    Modelo del equipo
                  </label>
                  <input
                    id="svc-modelo"
                    name="modelo"
                    type="text"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className={inputClass}
                    placeholder="A54, 13 Pro…"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="svc-descripcion" className={authLabelClass}>
                  Descripción del problema
                </label>
                <textarea
                  id="svc-descripcion"
                  name="descripcion"
                  required
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={`${inputClass} min-h-[120px] resize-y`}
                  placeholder="Cuéntanos qué le pasa a tu equipo…"
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={submitting}
                className={`w-full py-3.5 text-sm ${btnPrimary}`}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                {submitting ? "Enviando…" : "Enviar solicitud"}
              </motion.button>
            </form>
          )}
        </motion.div>
      </section>
    </PageReveal>
  );
}
