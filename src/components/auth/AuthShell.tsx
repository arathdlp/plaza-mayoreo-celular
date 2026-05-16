"use client";

import PageReveal from "@/components/PageReveal";
import { cardStatic, inputClass, labelClass, textMuted } from "@/lib/design-system";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-4 py-16 sm:px-6">
      <PageReveal className="relative z-10 mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex cursor-pointer text-sm font-medium text-gray-500 transition-colors duration-500 ease-out hover:text-[#0066FF]"
        >
          ← Volver al inicio
        </Link>
        <div className={`${cardStatic} p-8 shadow-[0_8px_30px_-12px_rgba(17,24,39,0.1)] sm:p-10`}>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">{title}</h1>
          {subtitle ? (
            <p className={`mt-2 text-sm leading-relaxed ${textMuted}`}>{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
      </PageReveal>
    </div>
  );
}

export { inputClass as authFieldClass, labelClass as authLabelClass };
