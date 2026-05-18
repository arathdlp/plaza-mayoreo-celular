import { CONTACT_EMAIL, CONTACT_EMAILS_SERVICIOS_ADMIN } from "@/lib/contact";
import { formatoPesos } from "@/lib/format";
import { getSiteBaseUrl } from "@/lib/mercadopago";
import { ETIQUETAS_TIPO_SERVICIO } from "@/lib/servicios-labels";
import type { TipoServicio } from "@/types/servicio";
import type { SupabaseClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const FROM_ADDRESS = "Plaza Mayoreo del Celular <mastecnologiaoficina1@gmail.com>";
const STORE_NAME = "Plaza Mayoreo del Celular";

export type EmailPedido = {
  id: number;
  total: number;
  metodo_pago: string | null;
  direccion_entrega: string;
};

export type EmailPedidoItem = {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

export type EmailCliente = {
  nombre: string;
  email: string;
  telefono?: string;
};

function createMailTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) {
    console.error("[email] GMAIL_USER o GMAIL_APP_PASSWORD no configurados");
    return null;
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

async function enviarEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transporter = createMailTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

function etiquetaMetodoPago(metodo: string | null): string {
  if (metodo === "mercado_pago") return "Mercado Pago";
  return "Pagar al recibir";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderItemsTable(items: EmailPedidoItem[]): string {
  const rows = items
    .map((item) => {
      const subtotal = item.precio_unitario * item.cantidad;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">
            ${escapeHtml(item.nombre)}
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">${item.cantidad} × ${formatoPesos(item.precio_unitario)}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:600;color:#111827;text-align:right;white-space:nowrap;">
            ${formatoPesos(subtotal)}
          </td>
        </tr>`;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
      <thead>
        <tr>
          <th align="left" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;padding-bottom:8px;">Producto</th>
          <th align="right" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;padding-bottom:8px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(STORE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(17,24,39,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0066FF 0%,#3385ff 100%);padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">${escapeHtml(STORE_NAME)}</p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.9);">Refacciones y accesorios para celular</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">${content}</td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6b7280;">© ${new Date().getFullYear()} ${escapeHtml(STORE_NAME)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function pedidoResumenHtml(pedido: EmailPedido, items: EmailPedidoItem[]): string {
  return `
    ${renderItemsTable(items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="font-size:15px;font-weight:700;color:#111827;">Total</td>
        <td align="right" style="font-size:20px;font-weight:800;color:#0066FF;">${formatoPesos(pedido.total)}</td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#f9fafb;border-radius:12px;padding:16px;">
      <tr>
        <td style="font-size:13px;color:#6b7280;padding-bottom:6px;">Método de pago</td>
        <td align="right" style="font-size:13px;font-weight:600;color:#111827;padding-bottom:6px;">${escapeHtml(etiquetaMetodoPago(pedido.metodo_pago))}</td>
      </tr>
      <tr>
        <td colspan="2" style="font-size:13px;color:#6b7280;padding-top:8px;border-top:1px solid #e5e7eb;">
          <strong style="color:#374151;">Dirección de entrega</strong><br />
          <span style="color:#111827;">${escapeHtml(pedido.direccion_entrega)}</span>
        </td>
      </tr>
    </table>`;
}

function ctaButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
      <tr>
        <td align="center" style="border-radius:9999px;background:#0066FF;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

export async function enviarEmailConfirmacionPedido(
  pedido: EmailPedido,
  items: EmailPedidoItem[],
  cliente: EmailCliente,
): Promise<void> {
  try {
    const pedidosUrl = `${getSiteBaseUrl()}/pedidos`;
    const nombre = cliente.nombre.trim() || "cliente";

    const html = emailLayout(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.02em;">
        ¡Gracias por tu compra, ${escapeHtml(nombre)}!
      </h1>
      <p style="margin:0 0 4px;font-size:15px;color:#4b5563;line-height:1.6;">
        Recibimos tu pedido <strong>#${pedido.id}</strong> y ya lo estamos procesando.
      </p>
      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
        Nos pondremos en contacto pronto para coordinar la entrega.
      </p>
      ${pedidoResumenHtml(pedido, items)}
      ${ctaButton(pedidosUrl, "Ver mi pedido")}
    `);

    await enviarEmail({
      to: cliente.email.trim(),
      subject: `Tu pedido #${pedido.id} fue recibido - ${STORE_NAME}`,
      html,
    });
  } catch (err) {
    console.error("[email] confirmacion cliente", err);
  }
}

export type EmailSolicitudServicio = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  tipo_servicio: TipoServicio;
  marca_equipo: string | null;
  modelo_equipo: string | null;
  descripcion: string;
};

export async function enviarEmailNuevaSolicitudServicio(
  solicitud: EmailSolicitudServicio,
): Promise<void> {
  try {
    const tipo = ETIQUETAS_TIPO_SERVICIO[solicitud.tipo_servicio];
    const equipo =
      [solicitud.marca_equipo, solicitud.modelo_equipo].filter(Boolean).join(" ") || "—";

    const html = emailLayout(`
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#111827;">
        Nueva solicitud de servicio #${solicitud.id}
      </h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;"><strong>Cliente:</strong> ${escapeHtml(solicitud.nombre)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Teléfono:</strong> ${escapeHtml(solicitud.telefono)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email:</strong> ${escapeHtml(solicitud.email)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Servicio:</strong> ${escapeHtml(tipo)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Equipo:</strong> ${escapeHtml(equipo)}</td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:14px;color:#111827;line-height:1.6;">
        <strong>Descripción:</strong><br />
        ${escapeHtml(solicitud.descripcion).replace(/\n/g, "<br />")}
      </p>
    `);

    await enviarEmail({
      to: CONTACT_EMAILS_SERVICIOS_ADMIN.join(", "),
      subject: `Nueva solicitud de servicio #${solicitud.id} - ${tipo}`,
      html,
    });
  } catch (err) {
    console.error("[email] nueva solicitud servicio", err);
  }
}

export async function enviarEmailNuevoPedidoAdmin(
  pedido: EmailPedido,
  items: EmailPedidoItem[],
  cliente: EmailCliente,
): Promise<void> {
  try {
    const html = emailLayout(`
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#111827;">
        Nuevo pedido #${pedido.id}
      </h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;font-size:14px;color:#374151;">
        <tr><td style="padding:4px 0;"><strong>Cliente:</strong> ${escapeHtml(cliente.nombre)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email:</strong> ${escapeHtml(cliente.email)}</td></tr>
        ${cliente.telefono ? `<tr><td style="padding:4px 0;"><strong>Teléfono:</strong> ${escapeHtml(cliente.telefono)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;"><strong>Pedido:</strong> #${pedido.id}</td></tr>
      </table>
      ${pedidoResumenHtml(pedido, items)}
    `);

    await enviarEmail({
      to: CONTACT_EMAIL,
      subject: `Nuevo pedido #${pedido.id} - ${formatoPesos(pedido.total)}`,
      html,
    });
  } catch (err) {
    console.error("[email] nuevo pedido admin", err);
  }
}

type ProductoNombreEmbed = { nombre: string } | { nombre: string }[] | null;
type ClienteEmbed =
  | { nombre: string; email: string; telefono: string | null }
  | { nombre: string; email: string; telefono: string | null }[]
  | null;
type PedidoItemRow = {
  cantidad: number;
  precio_unitario: number | string;
  productos: ProductoNombreEmbed;
};

function resolverNombreProducto(p: ProductoNombreEmbed): string {
  const row = Array.isArray(p) ? p[0] : p;
  return row?.nombre?.trim() || "Producto";
}

function resolverCliente(c: ClienteEmbed): EmailCliente | null {
  if (!c) return null;
  const row = Array.isArray(c) ? c[0] : c;
  if (!row?.email?.trim()) return null;
  return {
    nombre: row.nombre?.trim() || "Cliente",
    email: row.email.trim(),
    telefono: row.telefono?.trim() || undefined,
  };
}

export async function cargarDatosEmailPedido(
  supabase: SupabaseClient,
  pedidoId: number,
): Promise<{
  pedido: EmailPedido;
  items: EmailPedidoItem[];
  cliente: EmailCliente;
} | null> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      total,
      metodo_pago,
      direccion_entrega,
      clientes ( nombre, email, telefono ),
      pedido_items ( cantidad, precio_unitario, productos ( nombre ) )
    `,
    )
    .eq("id", pedidoId)
    .maybeSingle();

  if (error || !data) {
    console.error("[email] cargar pedido", error?.message);
    return null;
  }

  const cliente = resolverCliente(data.clientes as ClienteEmbed);
  if (!cliente) return null;

  const total =
    typeof data.total === "string" ? parseFloat(data.total) : Number(data.total);

  const items = ((data.pedido_items ?? []) as PedidoItemRow[]).map((row) => {
    const pu =
      typeof row.precio_unitario === "string"
        ? parseFloat(row.precio_unitario)
        : Number(row.precio_unitario);
    return {
      nombre: resolverNombreProducto(row.productos),
      cantidad: Number(row.cantidad),
      precio_unitario: pu,
    };
  });

  return {
    pedido: {
      id: data.id as number,
      total,
      metodo_pago: (data.metodo_pago as string | null) ?? null,
      direccion_entrega: (data.direccion_entrega as string) ?? "",
    },
    items,
    cliente,
  };
}

export async function enviarEmailPagoConfirmado(
  pedido: EmailPedido,
  items: EmailPedidoItem[],
  cliente: EmailCliente,
): Promise<void> {
  try {
    const pedidosUrl = `${getSiteBaseUrl()}/pedidos`;
    const nombre = cliente.nombre.trim() || "cliente";

    const html = emailLayout(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">
        Pago confirmado
      </h1>
      <p style="margin:0 0 4px;font-size:15px;color:#4b5563;line-height:1.6;">
        Hola ${escapeHtml(nombre)}, tu pago del pedido <strong>#${pedido.id}</strong> fue acreditado correctamente.
      </p>
      <p style="margin:0;font-size:14px;color:#16a34a;font-weight:600;line-height:1.6;">
        Estamos preparando tu pedido.
      </p>
      ${pedidoResumenHtml(pedido, items)}
      ${ctaButton(pedidosUrl, "Ver mi pedido")}
    `);

    await enviarEmail({
      to: cliente.email.trim(),
      subject: `Tu pago fue confirmado - Pedido #${pedido.id}`,
      html,
    });
  } catch (err) {
    console.error("[email] pago confirmado", err);
  }
}
