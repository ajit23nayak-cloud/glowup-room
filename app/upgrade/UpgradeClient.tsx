"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Check } from "lucide-react";
import { capture } from "@/lib/posthog";

export default function UpgradeClient() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  useEffect(() => {
    capture("upgrade_viewed", { from });
  }, [from]);

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

      <section className="mx-auto max-w-2xl px-6 py-16 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-[13px] font-semibold uppercase tracking-[0.12em]">
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
          Your free glow-up is done
        </div>

        <h1 className="font-serif text-[clamp(36px,6vw,56px)] leading-[1.05] tracking-[-0.02em] mb-6">
          Try another style for <em className="italic text-accent">₹99.</em>
        </h1>

        <p className="text-ink-dim text-[clamp(17px,2vw,20px)] max-w-[520px] mx-auto mb-12 leading-[1.5]">
          One payment unlocks <strong className="text-ink">unlimited renders for 24 hours</strong>.
          Test every style. Every budget. See which one actually fits your room.
        </p>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 max-w-md mx-auto mb-10 shadow-[0_4px_24px_rgba(26,26,26,0.04)]">
          <div className="font-serif text-5xl mb-2">₹99</div>
          <div className="text-[13px] text-ink-muted uppercase tracking-[0.12em] mb-8">24-hour pass</div>

          <ul className="text-left space-y-3 mb-8">
            {[
              "Unlimited AI renders",
              "All 4 styles, all 4 budget tiers",
              "Curated Amazon.in picks for every render",
              "Shareable before/after links",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-ink-dim">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full rounded-full bg-accent/30 text-white font-semibold py-4 cursor-not-allowed"
            aria-disabled="true"
          >
            Payments launching this week
          </button>
          <p className="text-[12px] text-ink-muted mt-4">
            Razorpay integration in progress. Your free glow-up is still saved — you&apos;ll find it in your share link.
          </p>
        </div>

        <p className="text-[14px] text-ink-muted">
          Bookmarked a glow-up link already? It still works.
          <br />
          <a href="/" className="text-accent hover:underline">← Back to home</a>
        </p>
      </section>
    </main>
  );
}
