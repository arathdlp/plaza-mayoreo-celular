"use client";

import { SPRING_SOFT } from "@/lib/motion-landing";
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedMailIcon() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto flex h-24 w-24 items-center justify-center"
      animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <motion.div
        className="absolute inset-0 rounded-3xl bg-[#0066FF]/10"
        animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-[#0066FF]/15 ring-1 ring-[#0066FF]/20"
        initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : SPRING_SOFT}
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          className="text-[#0066FF]"
          aria-hidden
        >
          <path
            d="M4 6h16v12H4V6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="m4 7 8 6 8-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {!reduceMotion ? (
          <motion.span
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0066FF] text-[10px] font-bold text-white"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            1
          </motion.span>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
