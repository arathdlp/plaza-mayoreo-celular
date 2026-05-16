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
    <PageReveal as="main" className="flex-1 bg-gray-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <div
          className={`${cardStatic} flex flex-col gap-6 p-8 shadow-[0_8px_30px_-12px_rgba(17,24,39,0.08)] sm:flex-row sm:items-start sm:justify-between sm:p-10`}
        >
          <div>
            <h1 className={headingSection}>{title}</h1>
            {description ? (
              <p className={`mt-2 max-w-xl text-sm leading-relaxed ${textMuted}`}>{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
        </div>
        <div className={`mt-8 ${cardStatic} p-6 sm:p-8`}>{children}</div>
      </div>
    </PageReveal>
  );
}
