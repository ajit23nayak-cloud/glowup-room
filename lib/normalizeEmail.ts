/**
 * Email validation + normalization. Used by both client (display-only) and
 * server (gate-keeping). Two pure functions, no I/O.
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Canonical form for paywall lookups. Lowercase, trimmed. For Gmail (and its
 * googlemail.com alias), strip "+tag" and remove dots from local part — Google
 * treats these as the same inbox. We do the same so users can't bypass the
 * paywall with `me+1@gmail.com` or `m.e@gmail.com`.
 */
export function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at < 1 || at === trimmed.length - 1) return trimmed;
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const plus = local.indexOf("+");
    if (plus !== -1) local = local.slice(0, plus);
    local = local.replace(/\./g, "");
    return `${local}@gmail.com`; // collapse googlemail → gmail
  }
  return `${local}@${domain}`;
}

export function getDomainFromEmail(email: string): string {
  const at = email.indexOf("@");
  return at === -1 ? "" : email.slice(at + 1).toLowerCase();
}

/**
 * Domains that don't need an MX lookup — popular providers, presence is given.
 * Skipping the check here trims ~150ms off the typical signup latency.
 */
export const POPULAR_EMAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "yahoo.co.in",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
]);
