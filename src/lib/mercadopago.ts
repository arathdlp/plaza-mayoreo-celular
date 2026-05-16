import { MercadoPagoConfig, Preference } from "mercadopago";

const PRODUCTION_SITE = "https://plaza-mayoreo-celular.vercel.app";

export function getSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* fall through */
    }
  }
  return PRODUCTION_SITE;
}

export function getMercadoPagoAccessToken(): string | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  return token || null;
}

export function createPreferenceClient() {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  }
  const config = new MercadoPagoConfig({ accessToken });
  return new Preference(config);
}

export function resolveInitPoint(
  response: { init_point?: string; sandbox_init_point?: string },
  accessToken: string,
): string | null {
  const isTest = accessToken.startsWith("TEST-");
  if (isTest) {
    return response.sandbox_init_point ?? response.init_point ?? null;
  }
  return response.init_point ?? response.sandbox_init_point ?? null;
}

/** Teléfono MX: deja solo dígitos y toma los últimos 10 para MP. */
export function parsePhoneMx(telefono: string): { area_code: string; number: string } {
  const digits = telefono.replace(/\D/g, "");
  const local = digits.length >= 10 ? digits.slice(-10) : digits;
  return { area_code: "52", number: local || "0000000000" };
}
