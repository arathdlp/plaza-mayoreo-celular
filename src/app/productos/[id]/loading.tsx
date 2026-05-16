import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductoDetalleSkeleton from "./ProductoDetalleSkeleton";

export default function ProductoDetalleLoading() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden bg-white">
        <ProductoDetalleSkeleton />
      </main>
      <Footer />
    </>
  );
}
