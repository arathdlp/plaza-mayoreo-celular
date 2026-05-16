import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  parseCategoriaFiltroParam,
  parseProductosPageParam,
  parseProductosSearchParam,
  productosListHref,
} from "@/lib/productos-url";
import { listProductosActivosPaginated } from "@/lib/productos";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProductosCatalog from "./ProductosCatalog";

const PER_PAGE = 20;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = parseProductosPageParam(sp.page);
  const q = parseProductosSearchParam(sp.q).trim();
  const cat = parseCategoriaFiltroParam(sp.categoria);
  const catLabel = cat === "todos" ? "Productos" : cat;

  const title =
    page > 1
      ? `${catLabel} — Página ${page}`
      : q
        ? `Búsqueda «${q.length > 42 ? `${q.slice(0, 42)}…` : q}»`
        : catLabel;

  const description =
    cat === "todos" && !q
      ? `Catálogo de refacciones y accesorios para celular en Morelia. ${PER_PAGE} artículos por página.`
      : `Productos${cat !== "todos" ? ` en categoría ${cat}` : ""}${q ? ` relacionados con tu búsqueda.` : "."} ${SITE_NAME}.`;

  const qs = new URLSearchParams();
  if (page > 1) qs.set("page", String(page));
  if (q) qs.set("q", q);
  if (cat !== "todos") qs.set("categoria", cat);
  const path = qs.toString() ? `/productos?${qs}` : "/productos";

  return pageMetadata({ title, description, path });
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pageRequested = parseProductosPageParam(sp.page);
  const q = parseProductosSearchParam(sp.q);
  const categoria = parseCategoriaFiltroParam(sp.categoria);

  const { items, total, perPage } = await listProductosActivosPaginated({
    page: pageRequested,
    perPage: PER_PAGE,
    q,
    categoria,
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (pageRequested > totalPages) {
    redirect(
      productosListHref({
        page: totalPages,
        q: q.trim() || undefined,
        categoria,
      }),
    );
  }

  return (
    <>
      <Header />
      <ProductosCatalog
        productos={items}
        total={total}
        page={pageRequested}
        perPage={perPage}
        q={q}
        categoria={categoria}
      />
      <Footer />
    </>
  );
}
