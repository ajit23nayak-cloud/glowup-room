import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — GlowUp.room",
  description: "Privacy policy for GlowUp.room.",
};

export default function PrivacyPage() {
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
        <h1 className="font-serif text-4xl mb-8">Privacy</h1>
        <div className="space-y-6 text-[16px] text-ink-dim leading-[1.7]">
          <p>
            We collect: email address (for service delivery), uploaded photos (for AI render), payment UTR (for verification). We store: signup record, render output, payment record. We do NOT store: card data, banking credentials, photos beyond 30 days.
          </p>
          <p>
            We use: PostHog (analytics, anonymized), Resend (email), Convex (data), Vercel (hosting). No third-party data sales. Email{" "}
            <a href="mailto:hsaritha13@gmail.com" className="text-accent hover:underline">
              hsaritha13@gmail.com
            </a>{" "}
            for data deletion requests.
          </p>
        </div>
      </article>
    </main>
  );
}
