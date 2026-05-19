import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Mayoreo Celular",
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0066FF",
    theme_color: "#0066FF",
    lang: "es",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/wide-1280x720.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Catálogo y compras en escritorio",
      },
      {
        src: "/screenshots/narrow-750x1334.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Experiencia móvil de la tienda",
      },
    ],
  };
}
