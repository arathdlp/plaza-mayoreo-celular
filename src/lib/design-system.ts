/** Clases reutilizables — tema claro alineado con la landing. */

export const pageMain = "flex-1 bg-white";
export const pageMainMuted = "flex-1 bg-gray-50";

export const headingPage =
  "text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl lg:text-4xl";
export const headingSection = "text-xl font-bold tracking-tight text-[#111827] sm:text-2xl";
export const textMuted = "text-gray-600";
export const textSubtle = "text-gray-500";
export const accentLabel = "text-sm font-bold uppercase tracking-[0.2em] text-[#0066FF]";

export const inputClass =
  "mt-1.5 block w-full cursor-text rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] outline-none transition-all duration-500 ease-out placeholder:text-gray-400 focus:border-[#0066FF] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.12)]";

export const labelClass = "text-sm font-medium text-gray-700";

export const btnPrimary =
  "inline-flex cursor-pointer items-center justify-center rounded-full bg-[#0066FF] font-bold text-white shadow-md shadow-[#0066FF]/20 transition-all duration-500 ease-out hover:bg-[#3385ff] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const btnSecondary =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white font-semibold text-[#111827] transition-all duration-500 ease-out hover:bg-gray-50 active:scale-[0.98]";

export const cardInteractive =
  "rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[#0066FF]/35 hover:shadow-[0_12px_40px_-12px_rgba(17,24,39,0.1)]";

export const cardStatic = "rounded-2xl border border-gray-200 bg-white shadow-sm";

export const pillBase =
  "cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-all duration-300 ease-out hover:border-[#0066FF] sm:px-4 sm:text-sm";

export const pillActive =
  "cursor-pointer rounded-full bg-[#0066FF] px-3 py-2 text-xs font-semibold text-white shadow-md shadow-[#0066FF]/20 sm:px-4 sm:text-sm";

export const priceLg = "text-xl font-bold tracking-tight text-[#0066FF] sm:text-2xl";
export const priceXl = "text-3xl font-bold tracking-tight text-[#0066FF] sm:text-4xl lg:text-5xl";

export const searchInput =
  "h-12 w-full cursor-text rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-24 text-sm text-[#111827] outline-none transition-all duration-500 ease-out placeholder:text-gray-400 focus:border-[#0066FF] focus:shadow-[0_0_0_3px_rgba(0,102,255,0.12)] sm:pl-12 sm:pr-28";

export const paginationBtn =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition-all duration-300 ease-out hover:border-[#0066FF] hover:text-[#0066FF] sm:min-w-[8rem]";

export const paginationBtnDisabled =
  "pointer-events-none inline-flex h-11 items-center justify-center rounded-full border border-gray-100 px-5 text-sm font-semibold text-gray-300 sm:min-w-[8rem]";

export const alertError =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700";

export const alertSuccess =
  "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800";

export const alertWarning =
  "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900";

export const panelMuted = "rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8";

export const badgeEstado = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-800",
  preparando: "border-sky-200 bg-sky-50 text-sky-800",
  enviado: "border-violet-200 bg-violet-50 text-violet-800",
  entregado: "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const;

export const badgeEstadoPago = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-800",
  pagado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  fallido: "border-red-200 bg-red-50 text-red-800",
} as const;

export const adminNavLink =
  "cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-all duration-300 ease-out hover:border-[#0066FF]/40 hover:text-[#0066FF]";

export const adminTableRow =
  "border-b border-gray-100 text-gray-800 transition-colors duration-300 hover:bg-gray-50";
