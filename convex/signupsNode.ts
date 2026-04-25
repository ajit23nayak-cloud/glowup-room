"use node";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import * as dns from "dns";
import {
  EMAIL_REGEX,
  POPULAR_EMAIL_DOMAINS,
  getDomainFromEmail,
  normalizeEmail,
} from "../lib/normalizeEmail";
import { isDisposableDomain } from "../lib/disposableEmailDomains";

const MX_TIMEOUT_MS = 200;

async function hasMxRecords(domain: string): Promise<boolean> {
  if (POPULAR_EMAIL_DOMAINS.has(domain)) return true;
  return await Promise.race<boolean>([
    new Promise((resolve) => {
      try {
        dns.resolveMx(domain, (err, addresses) => {
          if (err || !addresses || addresses.length === 0) resolve(false);
          else resolve(true);
        });
      } catch {
        resolve(false);
      }
    }),
    new Promise((resolve) => setTimeout(() => resolve(false), MX_TIMEOUT_MS)),
  ]);
}

/**
 * Find or create a signup for the given email after running:
 *   - format regex
 *   - disposable-domain blocklist
 *   - MX-record presence (skipped for popular providers)
 *   - normalization
 * Throws ConvexError({ code, message }) so the client surfaces specific copy.
 */
export const createOrGet = action({
  args: {
    email: v.string(),
    source: v.union(v.literal("landing"), v.literal("try")),
  },
  handler: async (ctx, { email, source }): Promise<{ signupId: string }> => {
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      throw new ConvexError({
        code: "invalid_email_format",
        message: "Please enter a valid email address.",
      });
    }
    const domain = getDomainFromEmail(trimmed);
    if (isDisposableDomain(domain)) {
      throw new ConvexError({
        code: "disposable_email",
        message: "Please use a real email address — throwaway addresses are blocked.",
      });
    }
    const mxOk = await hasMxRecords(domain);
    if (!mxOk) {
      throw new ConvexError({
        code: "no_mx_records",
        message: "We couldn't find a mail server for this domain. Check the spelling.",
      });
    }
    const normalized = normalizeEmail(trimmed);
    const id: string = await ctx.runMutation(internal.signups._upsertNormalized, {
      email: trimmed,
      emailNormalized: normalized,
      source,
    });
    return { signupId: id };
  },
});
