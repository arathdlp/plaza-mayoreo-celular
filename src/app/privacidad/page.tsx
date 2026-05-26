import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad",
  description:
    "Conoce cómo Plaza Mayoreo del Celular recopila, usa y protege tus datos personales al comprar refacciones para celulares.",
  path: "/privacidad",
});

const sections = [
  {
    title: "1. Datos que recopilamos",
    body: [
      "Cuando usas Plaza Mayoreo del Celular podemos recopilar datos necesarios para atenderte, como nombre, correo electrónico, teléfono, dirección de entrega y datos relacionados con tus pedidos.",
      "Para las entregas locales podemos tratar información de ubicación asociada al repartidor y al domicilio de entrega, con el fin de mostrar el seguimiento del pedido y calcular rutas de entrega.",
      "También podemos registrar información técnica básica, como fecha de creación del pedido, estado del pago, estado del envío y datos de contacto necesarios para soporte.",
    ],
  },
  {
    title: "2. Cómo usamos tus datos",
    body: [
      "Usamos tus datos para procesar pedidos, confirmar pagos, preparar refacciones, coordinar entregas, emitir comprobantes, dar seguimiento a garantías y responder solicitudes de soporte.",
      "La información de ubicación se usa únicamente para el tracking de entregas, para que el cliente pueda consultar el avance del repartidor y para que el repartidor pueda llegar al destino correcto.",
      "También podemos usar tu correo electrónico para enviarte confirmaciones de compra, tickets, actualizaciones importantes del pedido o información directamente relacionada con el servicio solicitado.",
    ],
  },
  {
    title: "3. Pagos y proveedores tecnológicos",
    body: [
      "Los pagos en línea se procesan mediante Mercado Pago. Plaza Mayoreo del Celular no almacena los datos completos de tarjetas bancarias. Mercado Pago procesa la operación conforme a sus propias políticas de seguridad y privacidad.",
      "Usamos Supabase como proveedor de base de datos y autenticación para almacenar de forma operativa la información necesaria de clientes, pedidos, pagos, envíos y tracking.",
      "Estos proveedores solo reciben la información necesaria para prestar sus servicios tecnológicos, de pago o de infraestructura.",
    ],
  },
  {
    title: "4. No vendemos tus datos",
    body: [
      "Plaza Mayoreo del Celular no vende, renta ni comercializa tus datos personales a terceros.",
      "Podemos compartir información únicamente cuando sea necesario para procesar pagos, entregar pedidos, cumplir obligaciones legales, prevenir fraude o atender una solicitud expresa del cliente.",
    ],
  },
  {
    title: "5. Seguridad y conservación",
    body: [
      "Aplicamos medidas razonables para proteger la información contra accesos no autorizados, pérdida, alteración o uso indebido.",
      "Conservamos los datos durante el tiempo necesario para operar pedidos, atender garantías, cumplir obligaciones fiscales o legales y mantener el historial de atención al cliente.",
    ],
  },
  {
    title: "6. Tus derechos",
    body: [
      "Puedes solicitar acceso, corrección o eliminación de tus datos personales cuando corresponda legalmente.",
      "Para ejercer estos derechos o resolver dudas sobre esta política, escríbenos a mastecnologiaoficina1@gmail.com.",
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="bg-white px-4 py-10 text-[#111827] sm:px-6 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0066FF]">
            Plaza Mayoreo del Celular
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Política de privacidad
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Esta política explica cómo recopilamos, usamos y protegemos los datos personales de clientes,
            repartidores y usuarios de Plaza Mayoreo del Celular, una app de mayoreo de refacciones para
            celulares con operación en Morelia, Michoacán, México.
          </p>
          <p className="mt-3 text-sm font-medium text-gray-500">
            Última actualización: 26 de mayo de 2026
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold tracking-tight text-[#111827]">{section.title}</h2>
                <div className="mt-4 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-7 text-gray-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200 sm:p-6">
            <h2 className="text-xl font-bold tracking-tight">Contacto</h2>
            <p className="mt-3 text-base leading-7 text-gray-600">
              Si tienes preguntas sobre esta política de privacidad o el tratamiento de tus datos personales,
              contáctanos en{" "}
              <a className="font-semibold text-[#0066FF] hover:underline" href="mailto:mastecnologiaoficina1@gmail.com">
                mastecnologiaoficina1@gmail.com
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
