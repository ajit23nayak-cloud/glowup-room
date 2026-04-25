import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — GlowUp.room",
  description: "Terms of service for GlowUp.room.",
};

export default function TermsPage() {
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
      <article className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-4xl mb-8">Terms</h1>
        <div className="space-y-6 text-[16px] text-ink-dim leading-[1.7]">
          <p>
            Service provided as-is. First render free per verified email. ₹99 paid renders grant unlimited 24-hour access. No refunds — service is consumed on use.
          </p>
          <p>
            We may revoke access for abuse, fraudulent UTR submission, or misuse. Disputes resolved informally via the WhatsApp number on /upgrade.
          </p>
        </div>
      </article>
    </main>
  );
}
