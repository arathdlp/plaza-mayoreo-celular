"use client";

import CartIcon from "@/components/cult/CartIcon";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type ShimmerButtonProps = {
  children: ReactNode;
  showCartIcon?: boolean;
  fullWidth?: boolean;
  size?: "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: (e: { preventDefault: () => void; stopPropagation: () => void }) => void;
};

const sizeClass = {
  md: "gap-2 px-4 py-3 text-sm",
  lg: "gap-2.5 px-6 py-3.5 text-base",
};

export default function ShimmerButton({
  children,
  showCartIcon = true,
  fullWidth = false,
  size = "md",
  className = "",
  disabled,
  onClick,
}: ShimmerButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={[
        "cult-btn-shimmer cursor-pointer rounded-2xl bg-gray-900 font-semibold text-white shadow-md shadow-gray-900/20 transition-all duration-300 ease-out hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/25",
        "flex items-center justify-center whitespace-nowrap",
        sizeClass[size],
        fullWidth ? "w-full min-w-0" : "inline-flex",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="relative z-[1] flex min-w-0 items-center justify-center gap-2">
        {showCartIcon ? <CartIcon className="h-[1.125rem] w-[1.125rem] shrink-0" /> : null}
        <span className="leading-none">{children}</span>
      </span>
    </motion.button>
  );
}
