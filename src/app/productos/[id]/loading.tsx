import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductoDetalleSkeleton from "./ProductoDetalleSkeleton";

export default function ProductoDetalleLoading() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-black via-[#0a1628] to-[#06060a]">
        <ProductoDetalleSkeleton />
      </main>
      <Footer />
    </>
  );
}
