/** Tokens de animación para la landing (estilo cult-ui). */
export const EASE_OUT = [0, 0, 0.2, 1] as const;

export const VIEWPORT_REVEAL = {
  once: true,
  amount: 0.2,
} as const;

export const TRANSITION_BASE = {
  duration: 0.5,
  ease: EASE_OUT,
} as const;

export const SPRING_SOFT = {
  type: "spring" as const,
  stiffness: 280,
  damping: 26,
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_BASE,
  },
};
