"use client";

import PageReveal from "@/components/PageReveal";
import { cardStatic, headingSection, textMuted } from "@/lib/design-system";
import type { ReactNode } from "react";

type PrivateChromeBodyProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function PrivateChromeBody({
  title,
  description,
  children,
  actions,
}: PrivateChromeBodyProps) {
  return (
    <PageReveal as="main" className="flex-1 overflow-x-hidden bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <div
          className={`${cardStatic} flex flex-col gap-5 p-4 shadow-[0_8px_30px_-12px_rgba(17,24,39,0.08)] sm:flex-row sm:items-start sm:justify-between sm:p-10`}
        >
          <div className="min-w-0">
            <h1 className={headingSection}>{title}</h1>
            {description ? (
              <p className={`mt-2 max-w-xl text-sm leading-relaxed sm:text-base ${textMuted}`}>{description}</p>
            ) : null}
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:shrink-0">{actions}</div>
        </div>
        <div className={`mt-6 ${cardStatic} p-4 sm:mt-8 sm:p-8`}>{children}</div>
      </div>
    </PageReveal>
  );
}
