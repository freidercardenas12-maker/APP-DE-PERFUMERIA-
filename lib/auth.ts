import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "pm_admin";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.SESSION_SECRET || "";
}

function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function checkCredentials(user: string, password: string) {
  const expectedUser = process.env.ADMIN_USER || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedUser || !expectedPassword || !secret()) return false;
  return safeEqual(user, expectedUser) && safeEqual(password, expectedPassword);
}

export function signSession(user: string) {
  const payload = Buffer.from(
    JSON.stringify({ user, exp: Date.now() + MAX_AGE_MS }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined | null): { user: string } | null {
  if (!token || !secret()) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      user?: string;
      exp?: number;
    };
    if (!data.user || !data.exp || data.exp < Date.now()) return null;
    return { user: data.user };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function sessionCookieName() {
  return COOKIE;
}
