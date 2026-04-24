import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "glowup-admin";
const TWO_WEEKS = 60 * 60 * 24 * 14;

export function adminCookieValue(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not configured");
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export function isAdminAuthed(): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const c = cookies().get(ADMIN_COOKIE)?.value;
  if (!c) return false;
  return c === adminCookieValue();
}

export function setAdminCookie() {
  cookies().set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: TWO_WEEKS,
    path: "/",
  });
}

export function clearAdminCookie() {
  cookies().delete(ADMIN_COOKIE);
}
