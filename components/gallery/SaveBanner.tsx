"use client";
import { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { capture } from "@/lib/posthog";

export default function SaveBanner({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      capture("gallery_shared", { platform: "copy", surface: "save_banner" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard permission denied — fail quietly
    }
  };

  return (
    <div className="mt-10 rounded-3xl border border-accent/20 bg-gradient-to-br from-[#FFF1EC] to-[#FADDD0] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Bookmark className="w-6 h-6 text-accent" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-xl md:text-2xl text-ink mb-1">
          Save this link to share anywhere
        </h3>
        <p className="text-[14px] text-ink-dim leading-snug">
          This page is your glow-up. Bookmark it, drop it in your group chat, share it on stories.
          Anyone with the link sees the full before/after.
        </p>
      </div>
      <button
        onClick={copy}
        className={`flex-shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
          copied
            ? "bg-ink text-white"
            : "bg-accent text-white hover:bg-accent/90"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" strokeWidth={2.5} />
            Copied
          </>
        ) : (
          "Copy link"
        )}
      </button>
    </div>
  );
}
