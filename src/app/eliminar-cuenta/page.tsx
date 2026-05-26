import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const supportEmail = "mastecnologiaoficina1@gmail.com";
const mailtoHref = `mailto:${supportEmail}?subject=${encodeURIComponent("Solicitud de eliminación de cuenta")}`;

export const metadata: Metadata = pageMetadata({
  title: "Eliminar cuenta",
  description:
    "Solicita la eliminación de tu cuenta y datos personales de Plaza Mayoreo del Celular.",
  path: "/eliminar-cuenta",
});

export default function EliminarCuentaPage() {
  return (
    <>
      <Header />
      <main className="bg-white px-4 py-10 text-[#111827] sm:px-6 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0066FF]">
            Plaza Mayoreo del Celular
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Eliminar cuenta
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Si deseas eliminar tu cuenta y los datos personales asociados a Plaza Mayoreo del Celular,
            puedes solicitarlo enviando un correo a nuestro equipo de soporte.
          </p>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold tracking-tight">Cómo solicitar la eliminación</h2>
            <div className="mt-4 space-y-3 text-base leading-7 text-gray-600">
              <p>
                Escríbenos a{" "}
                <a className="font-semibold text-[#0066FF] hover:underline" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>{" "}
                con el asunto <strong>Solicitud de eliminación de cuenta</strong>.
              </p>
              <p>
                En el mensaje incluye el correo electrónico asociado a tu cuenta para que podamos
                identificarla y confirmar la solicitud.
              </p>
              <p>
                Una vez confirmada la solicitud, eliminaremos tu cuenta y los datos personales
                correspondientes en un plazo máximo de 30 días.
              </p>
            </div>

            <a
              href={mailtoHref}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-bold text-white shadow-md shadow-[#0066FF]/20 transition-colors hover:bg-[#3385ff] sm:w-auto"
            >
              Solicitar eliminación de cuenta
            </a>
          </section>

          <section className="mt-6 rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200 sm:p-6">
            <h2 className="text-xl font-bold tracking-tight">Nota importante</h2>
            <p className="mt-3 text-base leading-7 text-gray-600">
              Podemos conservar cierta información cuando sea necesario para cumplir obligaciones legales,
              fiscales, resolver disputas o prevenir fraude, siempre conforme a la legislación aplicable.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
