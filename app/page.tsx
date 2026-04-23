import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import BuiltFor from "@/components/landing/BuiltFor";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <header className="py-6 border-b border-border">
        <div className="mx-auto max-w-content px-6 flex justify-between items-center">
          <div className="font-serif text-[28px] tracking-[-0.01em]">
            GlowUp<span className="text-accent">.room</span>
          </div>
          <div className="text-[13px] text-ink-muted uppercase tracking-[0.02em]">
            AI Weekender · Shipping Saturday
          </div>
        </div>
      </header>
      <main>
        <Hero />
        <HowItWorks />
        <BuiltFor />
      </main>
      <Footer />
    </>
  );
}
