"use client";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { capture } from "@/lib/posthog";

export default function Hero() {
  return (
    <section className="py-20 text-center">
      <div className="mx-auto max-w-content px-6">
        <div className="inline-block mb-6 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-[13px] font-semibold uppercase tracking-[0.12em]">
          ✨ Live now · Free first render
        </div>
        <h1 className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mb-6 text-[clamp(40px,7vw,72px)]">
          DecorGPT
          <br />
          <em className="italic text-accent">for India.</em>
        </h1>
        <p className="text-ink-dim text-[clamp(18px,2.2vw,22px)] max-w-[640px] mx-auto mb-12 leading-[1.5]">
          AI preview of your room + handpicked Amazon India products to match. First render free — ₹99 unlocks unlimited for 24 hours.
        </p>
        <BeforeAfterSlider
          beforeSrc="/before.jpg"
          afterSrc="/after.png"
          beforeAlt="Before — a typical Indian living room"
          afterAlt="After — styled by GlowUp AI"
          onFirstEngage={() => capture("slider_engaged", { surface: "hero" })}
          className="mb-14"
        />
        <p className="text-center text-[13px] text-ink-muted italic -mt-8 mb-10">
          Drag to reveal → one room, two futures.
        </p>
        <div className="mb-10">
          <a
            href="/try"
            onClick={() => capture("landing_try_clicked", { section: "hero" })}
            className="inline-block rounded-full bg-accent text-white font-semibold px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Try it free →
          </a>
        </div>
      </div>
    </section>
  );
}
