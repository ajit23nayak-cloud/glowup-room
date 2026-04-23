export default function HowItWorks() {
  const steps = [
    { n: 1, title: "📸 Snap a photo", body: "Any angle, any lighting. Your living room, as it is today." },
    { n: 2, title: "🎨 Pick a vibe", body: "Minimalist. Boho. Indian Contemporary. Scandi-Warm. Your call." },
    { n: 3, title: "💸 Set a budget", body: "₹5K, ₹15K, ₹30K, or ₹50K+. We work inside it." },
    { n: 4, title: "✨ Get your glow-up", body: "A rendered makeover + 4–6 shoppable items from Amazon India." },
  ];
  return (
    <section className="py-20 border-t border-border">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-serif text-center text-[clamp(32px,4vw,44px)] tracking-[-0.01em] mb-4">
          How it works
        </h2>
        <p className="text-center text-ink-muted mb-14 max-w-[560px] mx-auto">
          60 seconds, start to finish. No design skills needed.
        </p>
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {steps.map((s) => (
            <div key={s.n} className="bg-card border border-border rounded-3xl p-8 text-center">
              <div className="font-serif text-[56px] text-accent opacity-50 leading-none mb-4">{s.n}</div>
              <h4 className="text-[17px] font-semibold mb-2">{s.title}</h4>
              <p className="text-sm text-ink-muted leading-[1.5]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
