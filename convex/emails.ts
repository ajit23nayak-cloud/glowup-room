"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Best-effort UTR-confirmation email via Resend. Always returns; never throws,
 * because the user-facing UTR submit must succeed regardless of email delivery.
 *
 * Free-tier note: `onboarding@resend.dev` is restricted to your account email
 * unless a custom domain is verified. Until DNS is set up, only Ajit's own
 * test signups will actually receive these. Acceptable for launch — emails
 * are an additive nicety, not a blocker.
 */
export const sendUtrConfirmation = internalAction({
  args: { email: v.string() },
  handler: async (_ctx, { email }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("[emails] RESEND_API_KEY not set — skipping send for", email);
      return { sent: false, reason: "no_api_key" };
    }
    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "GlowUp.room <onboarding@resend.dev>",
          to: [email],
          subject: "You're activated ✨",
          text: [
            "You're activated.",
            "",
            "Unlimited renders for 24 hours. Try a different style at",
            "https://glowup-room.vercel.app/try",
            "",
            "— GlowUp.room",
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.log("[emails] resend non-2xx:", res.status, body);
        return { sent: false, reason: `http_${res.status}` };
      }
      return { sent: true };
    } catch (e) {
      console.log("[emails] resend error:", e);
      return { sent: false, reason: "network_error" };
    }
  },
});
