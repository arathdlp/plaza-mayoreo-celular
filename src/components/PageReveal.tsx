"use client";

import { TRANSITION_BASE } from "@/lib/motion-landing";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type PageRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "main" | "div";
};

/** Fade-in + slide-up al montar la página (contenido interno). */
export default function PageReveal({ children, className = "", as = "div" }: PageRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as === "main" ? "main" : "div";
    return <Tag className={className}>{children}</Tag>;
  }

  const props = {
    className,
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: TRANSITION_BASE,
  };

  if (as === "main") {
    return <motion.main {...props}>{children}</motion.main>;
  }

  return <motion.div {...props}>{children}</motion.div>;
}
