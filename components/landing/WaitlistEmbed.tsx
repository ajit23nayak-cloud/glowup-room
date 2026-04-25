"use client";
import Script from "next/script";
import { useEffect } from "react";
import { capture } from "@/lib/posthog";

export default function WaitlistEmbed() {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      const isSubmit =
        (typeof d === "string" && d.indexOf("Tally.FormSubmitted") > -1) ||
        (d && typeof d === "object" && d.event === "Tally.FormSubmitted");
      if (isSubmit) capture("waitlist_signup", { source: "landing_hero", form_id: "A76zPB" });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="bg-card border border-border rounded-3xl p-10 max-w-[520px] mx-auto shadow-[0_4px_24px_rgba(26,26,26,0.04)]">
      <h3 className="font-serif text-2xl mb-2">Get product updates</h3>
      <p className="text-[15px] text-ink-muted mb-6">
        We&apos;ll email you when we ship new styles or features.
      </p>
      <div className="min-h-[180px]">
        <iframe
          data-tally-src="https://tally.so/embed/A76zPB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          loading="lazy"
          width="100%"
          height={220}
          frameBorder={0}
          title="GlowUp Waitlist"
        />
      </div>
      <p className="text-[13px] text-ink-muted mt-5">
        No spam. One email when we ship. Unsubscribe any time.
      </p>
      <Script id="tally-embed" strategy="afterInteractive">
        {`var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`}
      </Script>
    </div>
  );
}
