import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function ShimmerButton({ children, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`relative isolate overflow-hidden rounded-2xl font-medium text-white shadow-lg transition active:scale-[0.99] disabled:opacity-60 ${className}`}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent [animation:shimmer_2.8s_infinite]" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
