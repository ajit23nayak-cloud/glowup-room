/**
 * Hand-curated set of throwaway/temp-mail domains. Lowercased.
 * Block these in createOrGet — they'll burn the free render with no follow-up.
 * Source: top hits from public disposable-domain lists (April 2026).
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "throwaway.email",
  "trashmail.com",
  "fakeinbox.com",
  "mailnesia.com",
  "mintemail.com",
  "tempr.email",
  "dispostable.com",
  "spamgourmet.com",
  "getairmail.com",
  "maildrop.cc",
  "mohmal.com",
  "sharklasers.com",
  "trbvm.com",
]);

export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_EMAIL_DOMAINS.has(domain.toLowerCase());
}
