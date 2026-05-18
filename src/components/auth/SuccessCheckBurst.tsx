"use client";

import { SPRING_SOFT } from "@/lib/motion-landing";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  title: string;
  description?: string;
  size?: "md" | "lg";
};

export default function SuccessCheckBurst({ title, description, size = "md" }: Props) {
  const reduceMotion = useReducedMotion();
  const circle = size === "lg" ? "h-20 w-20" : "h-16 w-16";
  const icon = size === "lg" ? 36 : 32;

  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING_SOFT}
    >
      <motion.div
        className={`flex ${circle} items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-100/80`}
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { ...SPRING_SOFT, delay: 0.08 }}
      >
        <motion.svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          aria-hidden
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: 0.2 }}
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          />
        </motion.svg>
      </motion.div>
      <h2 className="mt-6 text-xl font-bold text-[#111827] sm:text-2xl">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      ) : null}
    </motion.div>
  );
}
