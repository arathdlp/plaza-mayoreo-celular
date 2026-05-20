import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "pmc_repartidor_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 14;

export type RepartidorSession = {
  id: string;
  nombre: string;
  email: string;
};

function secret(): string {
  const s =
    process.env.REPARTIDOR_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!s) throw new Error("REPARTIDOR_SESSION_SECRET no configurado");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function serialize(session: RepartidorSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function parse(value: string): RepartidorSession | null {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as RepartidorSession;
  } catch {
    return null;
  }
}

export async function getRepartidorSession(): Promise<RepartidorSession | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return parse(raw);
}

export async function setRepartidorSession(session: RepartidorSession): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, serialize(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearRepartidorSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
