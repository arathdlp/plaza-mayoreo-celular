import type { Metadata } from "next";

export const SITE_NAME = "Plaza Mayoreo del Celular";

export const SITE_DESCRIPTION =
  "Accesorios, refacciones y servicios para celular en Morelia. Pantallas, baterías, tapas, placas de carga y más con entrega y asesoría.";

export function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      /* fall through */
    }
  }
  return new URL("http://localhost:3000");
}

/** Metadata base compartida (OG, Twitter, canonical relativo). */
export function rootMetadata(): Metadata {
  const base = siteUrl();
  const ogImage = new URL("/icons/pwa-512.svg", base).toString();

  return {
    metadataBase: base,
    title: {
      default: `${SITE_NAME} | Refacciones y accesorios en Morelia`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
      "celular Morelia",
      "refacciones celular",
      "pantalla celular",
      "batería celular",
      "accesorios celular",
      "Plaza Mayoreo del Celular",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    formatDetection: { telephone: true, email: true, address: true },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "es_MX",
      url: base,
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Morelia`,
      description: SITE_DESCRIPTION,
      images: [{ url: ogImage, width: 512, height: 512, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [ogImage],
    },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      apple: [{ url: "/icons/pwa-192.svg", sizes: "180x180" }],
    },
    appleWebApp: {
      capable: true,
      title: SITE_NAME,
      statusBarStyle: "black-translucent",
    },
    category: "technology",
  };
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogTitle?: string;
}): Metadata {
  const base = siteUrl();
  const canonical = new URL(opts.path.startsWith("/") ? opts.path : `/${opts.path}`, base).toString();
  const ogImage = new URL("/icons/pwa-512.svg", base).toString();

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: opts.ogTitle ?? opts.title,
      description: opts.description,
      siteName: SITE_NAME,
      locale: "es_MX",
      images: [{ url: ogImage, width: 512, height: 512, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.ogTitle ?? opts.title,
      description: opts.description,
      images: [ogImage],
    },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
