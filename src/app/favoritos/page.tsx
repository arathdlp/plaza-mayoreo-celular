import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import FavoritosCatalog from "./FavoritosCatalog";

export const metadata: Metadata = pageMetadata({
  title: "Favoritos",
  description: "Tus productos guardados en Plaza Mayoreo del Celular.",
  path: "/favoritos",
});

export default function FavoritosPage() {
  return (
    <>
      <Header />
      <FavoritosCatalog />
      <Footer />
    </>
  );
}
