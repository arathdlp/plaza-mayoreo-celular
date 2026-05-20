/** Datos de contacto oficiales — Plaza Mayoreo del Celular / Más Tecnología */

/** Número local Morelia (sin prefijo): 443 540 2474 */
export const STORE_PHONE_LOCAL = "4435402474";

export const CONTACT_CITY = "Morelia, Michoacán";

export const CONTACT_PHONE_E164 = "524435402474";

export const CONTACT_PHONE_DISPLAY = "+52 443 540 2474";

export const CONTACT_PHONE_TEL = `tel:+${CONTACT_PHONE_E164}`;

export const CONTACT_WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE_E164}`;

export const CONTACT_EMAIL = "mastecnologiaoficina1@gmail.com";

export const CONTACT_EMAIL_SERVICIOS_EXTRA = "arathdelapena22@gmail.com";

/** Destinatarios de notificaciones de nuevas solicitudes de servicio */
export const CONTACT_EMAILS_SERVICIOS_ADMIN = [
  CONTACT_EMAIL,
  CONTACT_EMAIL_SERVICIOS_EXTRA,
] as const;

export const CONTACT_EMAIL_MAILTO = `mailto:${CONTACT_EMAIL}`;

export const CONTACT_FACEBOOK_URL =
  "https://www.facebook.com/mas.tecnologia.438019";

export const CONTACT_INSTAGRAM_URL =
  "https://www.instagram.com/mas.tecnologia.438019";
