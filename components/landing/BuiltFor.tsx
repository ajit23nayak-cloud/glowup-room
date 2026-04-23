export default function BuiltFor() {
  const items = [
    {
      icon: "🏠",
      text: "You live in a 2 or 3 BHK apartment in India and you've wondered if your living room could look better.",
    },
    {
      icon: "🎨",
      text: "You save home décor posts on Instagram but never know where to start.",
    },
    {
      icon: "💸",
      text: "You want inspiration that respects your budget — not Pinterest dreams that cost ₹10 lakhs.",
    },
    {
      icon: "📸",
      text: 'When guests come over, you want them to say "Wait, your place looks amazing."',
    },
  ];
  return (
    <section className="py-20 border-t border-border">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-serif text-center text-[clamp(32px,4vw,44px)] tracking-[-0.01em] mb-4">
          Built for you if…
        </h2>
        <p className="text-center text-ink-muted mb-14 max-w-[560px] mx-auto">
          We&apos;re starting with India&apos;s 2/3 BHK apartment reality.
        </p>
        <div className="bg-card border border-border rounded-3xl p-12 max-w-[720px] mx-auto">
          <ul className="grid gap-5 list-none">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-4 text-[17px] text-ink-dim">
                <span className="text-2xl leading-none shrink-0">{it.icon}</span>
                <span>{it.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center pt-10">
          <p className="font-serif italic text-[clamp(22px,3vw,28px)] text-ink-dim max-w-[560px] mx-auto leading-[1.4]">
            &ldquo;The first home makeover app built for Indian apartments, Indian budgets, and Indian décor that ships in 48 hours.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
