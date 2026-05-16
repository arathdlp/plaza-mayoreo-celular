import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getProductoById, parseProductoId } from "@/lib/productos";
import { pageMetadata } from "@/lib/seo";
import ProductoDetalleView from "./ProductoDetalleView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductoId(id);
  if (!productId) {
    return pageMetadata({
      title: "Producto no encontrado",
      description: "Identificador de producto no válido.",
      path: `/productos/${id}`,
      noindex: true,
    });
  }

  const producto = await getProductoById(productId);
  if (!producto) {
    return pageMetadata({
      title: "Producto no encontrado",
      description: "El artículo no existe o ya no está disponible en el catálogo.",
      path: `/productos/${id}`,
      noindex: true,
    });
  }

  const description = `${producto.marca} ${producto.modelo} · ${producto.categoria}. ${producto.descripcion?.slice(0, 120) ?? "Refacción y accesorio en Morelia."}${producto.descripcion && producto.descripcion.length > 120 ? "…" : ""}`;
  const base = pageMetadata({
    title: producto.nombre,
    description,
    path: `/productos/${productId}`,
  });
  const ogImages = producto.imagen_url
    ? [{ url: producto.imagen_url, alt: producto.nombre }]
    : base.openGraph?.images;

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "website",
      images: ogImages,
    },
  };
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseProductoId(id);
  if (!productId) notFound();

  const producto = await getProductoById(productId);
  if (!producto) notFound();

  return (
    <>
      <Header />
      <ProductoDetalleView producto={producto} />
      <Footer />
    </>
  );
}
