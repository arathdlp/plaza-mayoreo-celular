import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";

export default function ProductoNotFound() {
  return (
    <>
      <Header />
      <main className="relative flex flex-1 flex-col items-center justify-center bg-white px-4 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0066FF]/90">404</p>
        <h1 className="mt-4 text-3xl font-bold text-[#111827]">Producto no encontrado</h1>
        <p className="mt-3 max-w-md text-gray-500">
          El producto no existe o ya no está disponible en el catálogo.
        </p>
        <Link
          href="/productos"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#0066FF] px-8 text-sm font-semibold text-white shadow-lg shadow-[#0066FF]/25 transition-all duration-300 hover:bg-[#3385ff]"
        >
          Ver catálogo
        </Link>
      </main>
      <Footer />
    </>
  );
}
