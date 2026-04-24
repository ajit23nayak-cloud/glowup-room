"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, Check, Smartphone, Copy, MessageCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { capture } from "@/lib/posthog";

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "";
const UPI_DISPLAY_NAME = process.env.NEXT_PUBLIC_UPI_DISPLAY_NAME || "GlowUp.room";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_FALLBACK_NUMBER || "";
const AMOUNT = 99;

function buildUpiUri(email: string): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_DISPLAY_NAME,
    am: String(AMOUNT),
    cu: "INR",
    tn: `GlowUp99-${email}`,
  });
  return `upi://pay?${params.toString()}`;
}

type SubmissionResult =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "ok" }
  | { kind: "error"; code: string; message: string };

function errorFromConvex(e: unknown): { code: string; message: string } {
  if (e instanceof ConvexError) {
    const data = (e as ConvexError<{ code?: string; message?: string }>).data;
    if (data && typeof data === "object") {
      return { code: data.code ?? "error", message: data.message ?? e.message };
    }
  }
  if (e instanceof Error) return { code: "error", message: e.message };
  return { code: "error", message: "Something went wrong" };
}

export default function UpgradeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from");
  const prefilledEmail = searchParams.get("email") ?? "";
  const submitUTR = useMutation(api.payments.submitUTR);

  const [email, setEmail] = useState(prefilledEmail);
  const [utr, setUtr] = useState("");
  const [result, setResult] = useState<SubmissionResult>({ kind: "idle" });

  useEffect(() => {
    capture("upgrade_viewed", { from });
  }, [from]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const utrValid = /^\d{12}$/.test(utr.trim());
  const upiUri = useMemo(() => (emailValid && UPI_ID ? buildUpiUri(email) : ""), [email, emailValid]);
  const whatsappUri = useMemo(() => {
    if (!WHATSAPP_NUMBER) return "";
    const text = encodeURIComponent(`GlowUp99 — I'd like to pay for the ₹99 pass. Email: ${email || "(pending)"}`);
    return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${text}`;
  }, [email]);

  const onPayClick = () => capture("upi_pay_clicked", { email });
  const onCopyUri = async () => {
    if (!upiUri) return;
    try {
      await navigator.clipboard.writeText(upiUri);
      capture("upi_uri_copied", { email });
    } catch {}
  };

  const onSubmitUtr = async () => {
    if (!emailValid) {
      setResult({ kind: "error", code: "invalid_email", message: "Please enter a valid email first." });
      return;
    }
    if (!utrValid) {
      setResult({ kind: "error", code: "invalid_utr", message: "UTR must be exactly 12 digits." });
      return;
    }
    setResult({ kind: "submitting" });
    try {
      await submitUTR({ email, utr: utr.trim() });
      capture("utr_submitted", { email, utr_prefix: utr.trim().slice(0, 4) });
      setResult({ kind: "ok" });
      setTimeout(() => router.push("/try"), 1500);
    } catch (e: unknown) {
      const err = errorFromConvex(e);
      capture("utr_submit_error", { email, code: err.code });
      setResult({ kind: "error", code: err.code, message: err.message });
    }
  };

  const configMissing = !UPI_ID;

  return (
    <main className="min-h-screen bg-bg">
      <header className="py-6 border-b border-border">
        <div className="mx-auto max-w-content px-6 flex justify-between items-center">
          <a href="/" className="font-serif text-[28px] tracking-[-0.01em]">
            GlowUp<span className="text-accent">.room</span>
          </a>
          <a href="/" className="text-[13px] text-ink-muted hover:text-accent">
            ← Back
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-[13px] font-semibold uppercase tracking-[0.12em]">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            Your free glow-up is done
          </div>
          <h1 className="font-serif text-[clamp(32px,6vw,52px)] leading-[1.05] tracking-[-0.02em] mb-4">
            Try another style for <em className="italic text-accent">₹99.</em>
          </h1>
          <p className="text-ink-dim text-[clamp(16px,2vw,18px)] max-w-[520px] mx-auto leading-[1.5]">
            Pay ₹99 via UPI. Unlocks <strong className="text-ink">unlimited renders for 24 hours</strong>.
          </p>
        </div>

        {configMissing && (
          <div className="mb-8 rounded-2xl border border-accent/40 bg-accent/5 p-4 text-sm text-ink-dim">
            ⚠️ Payments temporarily paused — UPI ID isn&apos;t configured yet. Check back shortly.
          </div>
        )}

        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-[0_4px_24px_rgba(26,26,26,0.04)]">
          <h2 className="font-serif text-2xl mb-6">1. Your email</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 mb-2 focus:outline-none focus:border-accent"
          />
          <p className="text-[13px] text-ink-muted mb-8">
            Use the same email as your free glow-up so we activate the right account.
          </p>

          <h2 className="font-serif text-2xl mb-6">2. Pay ₹99 via UPI</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Mobile-first UPI intent button */}
            <div className="rounded-2xl border border-border bg-bg p-5">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-dim">
                <Smartphone className="w-4 h-4 text-accent" />
                On mobile
              </div>
              <p className="text-[13px] text-ink-muted mb-4">
                Opens GPay / PhonePe / Paytm with ₹99 pre-filled.
              </p>
              {upiUri ? (
                <a
                  href={upiUri}
                  onClick={onPayClick}
                  className="block w-full text-center rounded-full bg-accent text-white font-semibold py-3 hover:bg-accent/90"
                >
                  Pay ₹99 via UPI
                </a>
              ) : (
                <button
                  disabled
                  className="block w-full text-center rounded-full bg-accent/30 text-white font-semibold py-3 cursor-not-allowed"
                >
                  Enter email first
                </button>
              )}
              {upiUri && (
                <button
                  onClick={onCopyUri}
                  className="mt-3 w-full text-[12px] text-ink-muted hover:text-accent inline-flex items-center justify-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy UPI link
                </button>
              )}
            </div>

            {/* QR code for desktop */}
            <div className="rounded-2xl border border-border bg-bg p-5">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-dim">
                <span className="text-accent text-lg leading-none">▦</span>
                On desktop
              </div>
              <p className="text-[13px] text-ink-muted mb-4">
                Scan with any UPI app on your phone.
              </p>
              <div className="flex items-center justify-center bg-white rounded-xl p-4 min-h-[160px]">
                {upiUri ? (
                  <QRCodeSVG value={upiUri} size={140} bgColor="#ffffff" fgColor="#1A1A1A" level="M" />
                ) : (
                  <span className="text-[12px] text-ink-muted">Enter email to generate QR</span>
                )}
              </div>
            </div>
          </div>

          {WHATSAPP_NUMBER && (
            <p className="text-[13px] text-ink-muted mb-8 text-center">
              <MessageCircle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              UPI not working?{" "}
              <a
                href={whatsappUri}
                target="_blank"
                rel="noopener"
                className="text-accent hover:underline"
                onClick={() => capture("upgrade_whatsapp_clicked", { email })}
              >
                Message &apos;GlowUp99&apos; on WhatsApp +{WHATSAPP_NUMBER}
              </a>
            </p>
          )}

          <h2 className="font-serif text-2xl mb-2">3. Paste your UTR</h2>
          <p className="text-[13px] text-ink-muted mb-4">
            After you pay, your UPI app shows a 12-digit transaction reference (UTR). Paste it here to activate your 24h pass.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{12}"
            maxLength={12}
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
            placeholder="123456789012"
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 mb-4 font-mono tracking-wider focus:outline-none focus:border-accent"
          />
          <button
            onClick={onSubmitUtr}
            disabled={!emailValid || !utrValid || result.kind === "submitting"}
            className="w-full rounded-full bg-accent text-white font-semibold py-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {result.kind === "submitting"
              ? "Activating…"
              : result.kind === "ok"
                ? "Activated ✓ Redirecting…"
                : "Activate my 24h pass"}
          </button>
          {result.kind === "error" && (
            <p className="mt-3 text-sm text-accent">{result.message}</p>
          )}
          {result.kind === "ok" && (
            <p className="mt-3 text-sm text-ink-dim text-center">
              Taking you back to <span className="font-semibold">/try</span>…
            </p>
          )}
          <p className="mt-6 text-[11px] text-ink-muted leading-snug">
            Your pass activates immediately. We manually verify UTRs within a few hours — if there&apos;s a mismatch you&apos;ll hear from us at the email above. Disputes: <a href="mailto:hsaritha13@gmail.com" className="underline">hsaritha13@gmail.com</a>.
          </p>
        </div>

        <div className="mt-10 bg-card border border-border rounded-3xl p-6 md:p-8">
          <h3 className="font-serif text-xl mb-4">What your ₹99 unlocks</h3>
          <ul className="space-y-2">
            {[
              "Unlimited AI renders for 24 hours",
              "All 4 styles, all 4 budget tiers",
              "Curated Amazon.in picks for every render",
              "Shareable before/after links",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[14px] text-ink-dim">
                <Check className="w-4 h-4 text-accent flex-shrink-0 mt-1" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-[14px] text-ink-muted mt-10">
          Bookmarked a glow-up link already? It still works. <a href="/" className="text-accent hover:underline">← Back to home</a>
        </p>
      </section>
    </main>
  );
}
