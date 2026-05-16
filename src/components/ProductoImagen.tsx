import { canonicalizarCategoria, categoriasEquivalentes } from "@/types/producto";
import Image from "next/image";
import type { ReactNode } from "react";

export type ProductoImagenProps = {
  categoria: string;
  marca: string;
  nombre: string;
  imagenUrl?: string | null;
  /** Tarjeta catálogo 4:3 o bloque grande cuadrado en detalle */
  variant?: "card" | "detail";
  className?: string;
  priority?: boolean;
};

type VisualKey =
  | "pantalla_iphone"
  | "pantalla_samsung"
  | "pantalla_motorola"
  | "pantalla_xiaomi"
  | "pantalla_default"
  | "bateria"
  | "tapa"
  | "placa"
  | "accesorio"
  | "celular";

function normalizeMarca(marca: string): string {
  return marca.trim().toLowerCase().normalize("NFC");
}

function resolveVisualKey(categoria: string, marca: string): VisualKey {
  const m = normalizeMarca(marca);

  if (categoriasEquivalentes(categoria, "Pantalla")) {
    if (m.includes("iphone") || m === "apple" || m.startsWith("apple ")) return "pantalla_iphone";
    if (m.includes("samsung")) return "pantalla_samsung";
    if (m.includes("motorola") || /\bmoto\b/.test(m)) return "pantalla_motorola";
    if (m.includes("xiaomi") || m.includes("redmi") || m.includes("poco")) return "pantalla_xiaomi";
    return "pantalla_default";
  }
  if (categoriasEquivalentes(categoria, "Bateria")) return "bateria";
  if (categoriasEquivalentes(categoria, "Tapa Trasera")) return "tapa";
  if (categoriasEquivalentes(categoria, "Placa de Carga")) return "placa";
  if (categoriasEquivalentes(categoria, "Accesorio")) return "accesorio";
  if (categoriasEquivalentes(categoria, "Celular")) return "celular";

  const cat = canonicalizarCategoria(categoria);
  if (cat === "Pantalla") return "pantalla_default";
  if (cat === "Bateria") return "bateria";
  if (cat === "Tapa Trasera") return "tapa";
  if (cat === "Placa de Carga") return "placa";
  if (cat === "Accesorio") return "accesorio";
  if (cat === "Celular") return "celular";
  return "pantalla_default";
}

const GRADIENTS: Record<VisualKey, string> = {
  pantalla_iphone: "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black",
  pantalla_samsung: "bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950",
  pantalla_motorola: "bg-gradient-to-br from-sky-800 via-blue-950 to-slate-950",
  pantalla_xiaomi: "bg-gradient-to-br from-orange-600 via-orange-800 to-zinc-900",
  pantalla_default: "bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900",
  bateria: "bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950",
  tapa: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900",
  placa: "bg-gradient-to-br from-violet-700 via-violet-900 to-violet-950",
  accesorio: "bg-gradient-to-br from-teal-600 via-teal-800 to-slate-900",
  celular: "bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950",
};

function IconPantalla({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <rect x="6.5" y="3" width="11" height="18" rx="2.25" />
      <path d="M9 6.5h6" strokeLinecap="round" opacity={0.5} />
      <circle cx="12" cy="18.5" r="0.85" fill="currentColor" stroke="none" opacity={0.85} />
    </svg>
  );
}

function IconBateria({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <rect x="5" y="7" width="12" height="10" rx="2" />
      <path d="M17 10h1.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H17" strokeLinecap="round" />
      <path d="M8 11h5M8 13.5h3" strokeLinecap="round" opacity={0.45} />
    </svg>
  );
}

function IconTapa({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <rect x="6" y="4" width="12" height="16" rx="2.5" />
      <rect x="9" y="6.5" width="6" height="4" rx="1" opacity={0.5} />
      <circle cx="12" cy="15.5" r="1.1" opacity={0.65} />
    </svg>
  );
}

function IconCarga({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <path
        d="M13 2L4.5 14H11l-1.5 8L17 10h-6.5L13 2z"
        fill="currentColor"
        fillOpacity={0.22}
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAccesorio({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <circle cx="12" cy="12" r="3.25" />
      <path
        d="M12 5v2M12 17v2M5 12h2M17 12h2M7.05 7.05l1.42 1.42M15.54 15.54l1.4 1.4M7.05 16.95l1.42-1.42M15.54 8.46l1.4-1.4"
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  );
}

function IconCelular({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10 5.5h4" strokeLinecap="round" opacity={0.45} />
      <rect x="9.5" y="18" width="5" height="1.25" rx="0.35" fill="currentColor" stroke="none" opacity={0.75} />
    </svg>
  );
}

function GeneratedVisual({
  visualKey,
  variant,
  nombre,
}: {
  visualKey: VisualKey;
  variant: "card" | "detail";
  nombre: string;
}) {
  const grad = GRADIENTS[visualKey];

  let icon: ReactNode;
  switch (visualKey) {
    case "pantalla_iphone":
    case "pantalla_samsung":
    case "pantalla_motorola":
    case "pantalla_xiaomi":
    case "pantalla_default":
      icon = <IconPantalla />;
      break;
    case "bateria":
      icon = <IconBateria />;
      break;
    case "tapa":
      icon = <IconTapa />;
      break;
    case "placa":
      icon = <IconCarga />;
      break;
    case "accesorio":
      icon = <IconAccesorio />;
      break;
    case "celular":
      icon = <IconCelular />;
      break;
    default:
      icon = <IconPantalla />;
  }

  const frame = variant === "detail" ? "" : "border-b border-gray-100";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gray-100 ${frame}`}
      role="img"
      aria-label={`Ilustración de producto: ${nombre}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-gray-100/40 to-gray-100"
        aria-hidden
      />

      <div className="relative z-[1] flex h-full min-h-0 w-full min-w-0 items-center justify-center">
        <div
          className={`flex shrink-0 items-center justify-center text-[#0066FF] ${
            variant === "card" ? "h-14 w-14 [&>svg]:h-14 [&>svg]:w-14" : "h-[40%] w-[40%] [&>svg]:h-full [&>svg]:w-full"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/**
 * Imagen del producto: URL remota si existe; si no, arte generado (degradado + SVG) según categoría y marca.
 */
export default function ProductoImagen({
  categoria,
  marca,
  nombre,
  imagenUrl,
  variant = "card",
  className = "",
  priority = false,
}: ProductoImagenProps) {
  const visualKey = resolveVisualKey(categoria, marca);
  const aspect = variant === "detail" ? "aspect-square" : "";
  const outer =
    variant === "detail"
      ? `relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm ${className}`
      : `relative flex h-full w-full items-center justify-center overflow-hidden bg-gray-100 transition-transform duration-[400ms] ease-out group-hover:scale-105 ${className}`;
  const shell = aspect ? `${outer} ${aspect}` : outer;

  if (imagenUrl) {
    return (
      <div className={shell}>
        <Image
          src={imagenUrl}
          alt={nombre}
          fill
          className={`object-cover ${variant === "card" ? "transition-transform duration-[400ms] ease-out group-hover:scale-105" : ""}`}
          sizes={
            variant === "detail"
              ? "(max-width: 1024px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div className={shell}>
      <GeneratedVisual visualKey={visualKey} variant={variant} nombre={nombre} />
    </div>
  );
}
