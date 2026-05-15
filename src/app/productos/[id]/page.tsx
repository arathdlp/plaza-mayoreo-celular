import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getProductoById, parseProductoId } from "@/lib/productos";
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
    return { title: "Producto no encontrado | Plaza Mayoreo del Celular" };
  }

  const producto = await getProductoById(productId);
  if (!producto) {
    return { title: "Producto no encontrado | Plaza Mayoreo del Celular" };
  }

  return {
    title: `${producto.nombre} | Plaza Mayoreo del Celular`,
    description: `${producto.marca} ${producto.modelo} — ${producto.categoria}`,
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
