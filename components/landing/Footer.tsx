export default function Footer() {
  return (
    <footer className="py-12 pb-16 border-t border-border text-center text-ink-muted text-sm">
      <div className="mx-auto max-w-content px-6">
        <p className="font-serif italic text-base mb-2 text-ink-dim">GlowUp.room · Built by Ajit Nayak</p>
        <p className="mb-3">
          GrowthX AI Weekender · April 2026 ·{" "}
          <a
            href="https://www.linkedin.com/in/ajit-nayak-b5a9791"
            target="_blank"
            rel="noopener"
            className="text-accent hover:border-b hover:border-accent"
          >
            Follow the build →
          </a>
        </p>
        <p className="text-[12px] text-ink-soft">
          <a href="/terms" className="hover:text-ink-dim">Terms</a>
          <span className="mx-2">·</span>
          <a href="/privacy" className="hover:text-ink-dim">Privacy</a>
        </p>
      </div>
    </footer>
  );
}
