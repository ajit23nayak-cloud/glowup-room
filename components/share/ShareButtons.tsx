"use client";
import { useState } from "react";
import { capture } from "@/lib/posthog";

export default function ShareButtons({ url, style }: { url: string; style: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Look at my ${style} glow-up from GlowUp.room — AI restyled my living room in 60s.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      capture("gallery_shared", { platform: "copy" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop — clipboard permission denied
    }
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={copy}
        className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:border-accent"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener"
        onClick={() => capture("gallery_shared", { platform: "whatsapp" })}
        className="rounded-full bg-[#25D366] text-white px-5 py-2.5 text-sm font-medium"
      >
        WhatsApp
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener"
        onClick={() => capture("gallery_shared", { platform: "x" })}
        className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium"
      >
        Share on X
      </a>
    </div>
  );
}
