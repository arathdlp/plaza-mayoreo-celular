import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getProductosActivos } from "@/lib/productos";
import ProductosCatalog from "./ProductosCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos | Plaza Mayoreo del Celular",
  description: "Catálogo de refacciones y accesorios para celular en Morelia.",
};

export default async function ProductosPage() {
  const productos = await getProductosActivos();

  return (
    <>
      <Header />
      <ProductosCatalog productos={productos} />
      <Footer />
    </>
  );
}
