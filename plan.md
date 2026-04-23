# GlowUp.room MVP Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. Execute top-to-bottom. Pause at any step labeled **CHECKPOINT — stop**.

**Goal:** Ship a working `/try` flow (upload → style → budget → email → AI render → shareable result) on top of the existing landing, deployed to the same `glowup-room.vercel.app`, in ~3–4 hrs.

**Architecture:**
- Next.js 14 App Router (TypeScript) is the shell for all three routes: `/` (migrated landing), `/try` (form), `/gallery/[id]` (result).
- Convex handles DB + file storage + the Replicate integration (as an action). Frontend uses `useQuery` which auto-streams updates — so the "poll every 2s" from the brief is replaced by Convex's reactive subscription (cheaper, simpler, same UX).
- Deploy to the existing Vercel project (preserves the `glowup-room.vercel.app` URL). GitHub repo created fresh and linked for auto-deploys.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Convex, Replicate (`adirik/interior-design`), PostHog, Tally (unchanged), Vercel.

**Testing approach:** No unit test framework for this sprint — it costs more to set up than it saves. Each task has a manual **Verify** step: smoke test in the browser, `curl`, or `npx convex run`. Commit after each green verify.

**Time budget:** ~3.5 hrs. If a task blows past 2x its estimate, stop and flag.

---

## File Structure

```
C:/Users/ajit2/Ajit/glowup-room/
├── _legacy-landing.html          # original index.html, kept for reference only
├── _legacy-assets/               # original before.jpg + after.png (moved — live copies go to public/)
├── app/
│   ├── layout.tsx                # root layout: fonts, metadata, Providers wrapper
│   ├── globals.css               # Tailwind directives + CSS custom props (--bg, --ink, --accent, etc.)
│   ├── providers.tsx             # ConvexReactProvider + PostHog client init
│   ├── page.tsx                  # / — landing (composes landing/* components)
│   ├── try/
│   │   └── page.tsx              # /try — upload + style + budget + email form
│   └── gallery/
│       └── [id]/
│           ├── page.tsx          # result page: slider + share + CTA
│           └── layout.tsx        # generateMetadata for OG/Twitter tags per render
├── components/
│   ├── BeforeAfterSlider.tsx     # reusable, ported from index.html <script>
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── BuiltFor.tsx
│   │   ├── WaitlistEmbed.tsx     # Tally iframe + window message listener → posthog.capture('waitlist_signup')
│   │   └── Footer.tsx
│   ├── try/
│   │   ├── PhotoUpload.tsx       # drag-drop, 5MB guard, uploads to Convex storage
│   │   ├── StylePicker.tsx       # 4 tiles
│   │   ├── BudgetChips.tsx       # 4 chips
│   │   └── GenerateButton.tsx    # disabled until all fields valid; triggers mutation + action
│   └── share/
│       └── ShareButtons.tsx      # copy-link, wa.me, twitter intent
├── lib/
│   ├── styles.ts                 # STYLE_PROMPT_MAP, NEGATIVE_PROMPT, REPLICATE_SETTINGS (source of truth)
│   └── posthog.ts                # lazy client-side init singleton
├── convex/
│   ├── schema.ts                 # signups + renders tables, indexes
│   ├── signups.ts                # createSignup mutation, getByEmail query
│   ├── renders.ts                # createRender mutation, getById query, setStatus internalMutation
│   ├── files.ts                  # generateUploadUrl mutation, getUrl query
│   └── replicate.ts              # startRender action, pollPrediction internalAction
├── public/
│   ├── before.jpg                # active copy (served at /before.jpg)
│   └── after.png                 # active copy (served at /after.png)
├── .env.local                    # NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST
├── .gitignore                    # .vercel, node_modules, .env*.local, .next, .convex, etc.
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

**Why manual scaffold instead of `create-next-app`:** the folder is non-empty (`.vercel`, `index.html`, images), and `create-next-app` refuses non-empty dirs. Manually creating ~7 config files avoids that fight. About 10 min.

---

## Task 1: Safety snapshot of current state

**Files:**
- Create: `_legacy-landing.html` (rename of `index.html`)
- Create: `_legacy-assets/before.jpg`, `_legacy-assets/after.png` (copies)
- Modify: `.gitignore` (add node_modules/.next/.env*.local/.convex)

- [ ] **Step 1.1: Copy index.html → _legacy-landing.html** so we can always restore

```bash
cp "C:/Users/ajit2/Ajit/glowup-room/index.html" "C:/Users/ajit2/Ajit/glowup-room/_legacy-landing.html"
```

- [ ] **Step 1.2: Keep a raw copy of images so we always have originals**

```bash
mkdir -p "C:/Users/ajit2/Ajit/glowup-room/_legacy-assets"
cp "C:/Users/ajit2/Ajit/glowup-room/before.jpg" "C:/Users/ajit2/Ajit/glowup-room/_legacy-assets/before.jpg"
cp "C:/Users/ajit2/Ajit/glowup-room/after.png" "C:/Users/ajit2/Ajit/glowup-room/_legacy-assets/after.png"
```

- [ ] **Step 1.3: Expand .gitignore**

Replace contents with:
```
.vercel
node_modules
.next
out
.env
.env.local
.env*.local
.convex
*.log
.DS_Store
```

- [ ] **Step 1.4: Verify** — `ls _legacy-landing.html _legacy-assets/ public/ 2>/dev/null` (public/ won't exist yet, that's fine).

---

## Task 2: Scaffold Next.js + TypeScript + Tailwind manually

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (placeholder)
- Move: `before.jpg` → `public/before.jpg`, `after.png` → `public/after.png`

- [ ] **Step 2.1: Move images into public/**

```bash
mkdir -p "C:/Users/ajit2/Ajit/glowup-room/public"
mv "C:/Users/ajit2/Ajit/glowup-room/before.jpg" "C:/Users/ajit2/Ajit/glowup-room/public/before.jpg"
mv "C:/Users/ajit2/Ajit/glowup-room/after.png" "C:/Users/ajit2/Ajit/glowup-room/public/after.png"
```

- [ ] **Step 2.2: Delete the old index.html** (we already saved the copy in Task 1)

```bash
rm "C:/Users/ajit2/Ajit/glowup-room/index.html"
```

- [ ] **Step 2.3: Write `package.json`**

```json
{
  "name": "glowup-room",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "convex": "^1.16.0",
    "posthog-js": "^1.180.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.10",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20"
  }
}
```

- [ ] **Step 2.4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "_legacy-landing.html", "_legacy-assets"]
}
```

- [ ] **Step 2.5: Write `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**.convex.cloud" }] },
};
module.exports = nextConfig;
```

- [ ] **Step 2.6: Write `postcss.config.js`**

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 2.7: Write `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF7F2",
        ink: { DEFAULT: "#1A1A1A", dim: "#4A4A4A", muted: "#7A7A7A", soft: "#B8B2A7" },
        accent: { DEFAULT: "#E11D48", warm: "#F59E0B" },
        card: "#FFFFFF",
        border: "#E8E1D4",
      },
      fontFamily: {
        serif: ["'Instrument Serif'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: { content: "960px" },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2.8: Write `app/globals.css`** — Tailwind directives + CSS vars for anything Tailwind config can't express (mirrors original palette exactly)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #FAF7F2;
  --ink: #1A1A1A;
  --ink-dim: #4A4A4A;
  --ink-muted: #7A7A7A;
  --ink-soft: #B8B2A7;
  --accent: #E11D48;
  --accent-warm: #F59E0B;
  --card: #FFFFFF;
  --border: #E8E1D4;
}
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  font-size: 17px;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2.9: Write placeholder `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlowUp.room — DecorGPT for India. AI home styling, shoppable on Amazon.",
  description:
    "Upload a photo of your living room, pick a vibe, and get an AI makeover with décor you can actually buy from Amazon India — inside your budget.",
  openGraph: {
    title: "GlowUp.room — DecorGPT for India",
    description: "Upload a photo. Pick a vibe. Get an AI makeover + shoppable décor from Amazon India.",
    url: "https://glowup-room.vercel.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlowUp.room — DecorGPT for India",
    description: "Upload a photo. Pick a vibe. Get an AI makeover + shoppable décor from Amazon India.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2.10: Write placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return <main className="p-12 font-serif text-3xl">GlowUp.room — scaffold OK</main>;
}
```

- [ ] **Step 2.11: Install deps**

```bash
cd "C:/Users/ajit2/Ajit/glowup-room"
npm install
```

- [ ] **Step 2.12: Verify** — run `npm run dev`, open `http://localhost:3000`, see "GlowUp.room — scaffold OK" in serif. Ctrl+C to stop.

- [ ] **Step 2.13: Commit** (we'll init git in Task 10; for now just move on — a single big commit at the end is fine for this sprint)

---

## Task 3: Port the Before/After slider into a reusable component

**Files:**
- Create: `components/BeforeAfterSlider.tsx`

- [ ] **Step 3.1: Write the component** — same drag logic as `index.html`, plus demo sweep + PostHog event hook

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  onFirstEngage?: () => void;
  className?: string;
};

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  onFirstEngage,
  className = "",
}: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const [engaged, setEngaged] = useState(false);
  const [demoRan, setDemoRan] = useState(false);
  const draggingRef = useRef(false);

  const setPosition = (next: number) => setPct(Math.max(0, Math.min(100, next)));
  const getPercent = (clientX: number) => {
    const rect = sliderRef.current!.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      setPosition(getPercent(x));
    };
    const onEnd = () => (draggingRef.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  useEffect(() => {
    if (demoRan || !sliderRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDemoRan(true);
          obs.disconnect();
          let p = 50, dir = 1, cycles = 0;
          const timer = setInterval(() => {
            p += dir * 1.8;
            if (p >= 78) dir = -1;
            if (p <= 22) { dir = 1; cycles++; }
            if (cycles >= 1 && p >= 50) { clearInterval(timer); setPct(50); }
            else setPct(p);
          }, 25);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(sliderRef.current);
    return () => obs.disconnect();
  }, [demoRan]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    draggingRef.current = true;
    if (!engaged) { setEngaged(true); onFirstEngage?.(); }
    const x = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setPosition(getPercent(x));
  };

  return (
    <div
      ref={sliderRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className={`relative mx-auto aspect-[4/3] w-full max-w-[760px] overflow-hidden rounded-2xl bg-black shadow-[0_8px_32px_rgba(26,26,26,0.12)] cursor-ew-resize select-none touch-none ${className}`}
      role="img"
      aria-label="Drag to compare before and after"
    >
      <img src={beforeSrc} alt={beforeAlt} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      />
      <div className="absolute top-0 bottom-0 w-[3px] bg-white z-[3] shadow-[0_0_10px_rgba(0,0,0,0.4)] pointer-events-none" style={{ left: `${pct}%`, transform: "translateX(-50%)" }} />
      <div
        className="absolute top-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center text-lg font-bold text-accent shadow-[0_6px_16px_rgba(0,0,0,0.25)] pointer-events-none z-[4]"
        style={{ left: `${pct}%`, transform: "translate(-50%,-50%)" }}
        aria-hidden="true"
      >
        ⇆
      </div>
      <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] text-white bg-ink/90 z-[5] pointer-events-none">BEFORE</span>
      <span className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] text-white bg-accent z-[5] pointer-events-none">AFTER</span>
    </div>
  );
}
```

- [ ] **Step 3.2: Drop it into `app/page.tsx`** temporarily for visual verify

```tsx
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
export default function Home() {
  return (
    <main className="p-12">
      <BeforeAfterSlider beforeSrc="/before.jpg" afterSrc="/after.png" />
    </main>
  );
}
```

- [ ] **Step 3.3: Verify** — `npm run dev`, visit `/`. Confirm:
  - Demo sweep animates once on scroll into view
  - Drag works with mouse and with touch-emulation in DevTools
  - BEFORE/AFTER tags present, knob visible

---

## Task 4: Migrate landing to composed components + PostHog

**Files:**
- Create: `lib/posthog.ts`, `app/providers.tsx`, `components/landing/{Hero,HowItWorks,BuiltFor,WaitlistEmbed,Footer}.tsx`
- Modify: `app/page.tsx`, `app/layout.tsx`, `.env.local`

- [ ] **Step 4.1: Write `.env.local`**

```
NEXT_PUBLIC_POSTHOG_KEY=phc_D3BgHXu4psdeqLqs4QESzWLkNW7wuzEobWg2RSh7zFm4
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

(NEXT_PUBLIC_CONVEX_URL added in Task 5.)

- [ ] **Step 4.2: Write `lib/posthog.ts`**

```ts
"use client";
import posthog from "posthog-js";

let initialized = false;
export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    person_profiles: "identified_only",
    capture_pageview: true,
    autocapture: true,
  });
  initialized = true;
}
export function capture(event: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined" && initialized) posthog.capture(event, props);
}
```

- [ ] **Step 4.3: Write `app/providers.tsx`** — will also hold Convex provider once wired in Task 6; for now just PostHog init + children

```tsx
"use client";
import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { initPostHog(); }, []);
  return <>{children}</>;
}
```

- [ ] **Step 4.4: Wrap body in `app/layout.tsx`**

Change `<body>{children}</body>` to:
```tsx
<body><Providers>{children}</Providers></body>
```
And add `import Providers from "./providers";` at the top.

- [ ] **Step 4.5: Write `components/landing/Hero.tsx`** — pixel-parity port of the hero section + slider + waitlist block

```tsx
"use client";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import WaitlistEmbed from "./WaitlistEmbed";
import { capture } from "@/lib/posthog";

export default function Hero() {
  return (
    <section className="py-20 text-center">
      <div className="mx-auto max-w-content px-6">
        <div className="inline-block mb-6 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-[13px] font-semibold uppercase tracking-[0.12em]">
          🪄 Launching Saturday, 25 April · Free for the first 500
        </div>
        <h1 className="font-serif font-normal leading-[1.05] tracking-[-0.02em] mb-6 text-[clamp(40px,7vw,72px)]">
          DecorGPT<br/><em className="italic text-accent">for India.</em>
        </h1>
        <p className="text-ink-dim text-[clamp(18px,2.2vw,22px)] max-w-[640px] mx-auto mb-12 leading-[1.5]">
          Upload a photo of your living room. Pick a vibe. Get an AI makeover + the exact décor to buy on Amazon India — inside your budget, in 60 seconds.
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
        <WaitlistEmbed />
      </div>
    </section>
  );
}
```

- [ ] **Step 4.6: Write `components/landing/WaitlistEmbed.tsx`** — Tally iframe + submit event listener (exact port of the existing bits)

```tsx
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
      <h3 className="font-serif text-2xl mb-2">Get early access</h3>
      <p className="text-[15px] text-ink-muted mb-6">We'll email you the moment it goes live. Shareable before/after guaranteed.</p>
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
      <p className="text-[13px] text-ink-muted mt-5">No spam. One email when we ship. Unsubscribe any time.</p>
      <Script id="tally-embed" strategy="afterInteractive">
        {`var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`}
      </Script>
    </div>
  );
}
```

- [ ] **Step 4.7: Write `components/landing/HowItWorks.tsx`** — 4-step grid, port of the section

```tsx
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
        <h2 className="font-serif text-center text-[clamp(32px,4vw,44px)] tracking-[-0.01em] mb-4">How it works</h2>
        <p className="text-center text-ink-muted mb-14 max-w-[560px] mx-auto">60 seconds, start to finish. No design skills needed.</p>
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
```

- [ ] **Step 4.8: Write `components/landing/BuiltFor.tsx`**

```tsx
export default function BuiltFor() {
  const items = [
    { icon: "🏠", text: "You live in a 2 or 3 BHK apartment in India and you've wondered if your living room could look better." },
    { icon: "🎨", text: "You save home décor posts on Instagram but never know where to start." },
    { icon: "💸", text: "You want inspiration that respects your budget — not Pinterest dreams that cost ₹10 lakhs." },
    { icon: "📸", text: "When guests come over, you want them to say \"Wait, your place looks amazing.\"" },
  ];
  return (
    <section className="py-20 border-t border-border">
      <div className="mx-auto max-w-content px-6">
        <h2 className="font-serif text-center text-[clamp(32px,4vw,44px)] tracking-[-0.01em] mb-4">Built for you if…</h2>
        <p className="text-center text-ink-muted mb-14 max-w-[560px] mx-auto">We're starting with India's 2/3 BHK apartment reality.</p>
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
            "The first home makeover app built for Indian apartments, Indian budgets, and Indian décor that ships in 48 hours."
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.9: Write `components/landing/Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer className="py-12 pb-16 border-t border-border text-center text-ink-muted text-sm">
      <div className="mx-auto max-w-content px-6">
        <p className="font-serif italic text-base mb-2 text-ink-dim">GlowUp.room · Built by Ajit Nayak</p>
        <p>
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
      </div>
    </footer>
  );
}
```

- [ ] **Step 4.10: Add a simple header and rewrite `app/page.tsx`**

```tsx
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
```

- [ ] **Step 4.11: Verify** — `npm run dev`. On `/`:
  - Visual parity with original `_legacy-landing.html` (open both side-by-side)
  - Slider drags
  - Tally iframe loads and accepts a test email
  - In PostHog live events, you see `$pageview`, `slider_engaged`, and `waitlist_signup` after the test submit
  - Mobile viewport in DevTools: no layout breakage

---

## Task 5: Init Convex project and schema

**Files:**
- Create: `convex/schema.ts`, `convex/signups.ts`, `convex/renders.ts`, `convex/files.ts`
- Modify: `.env.local` (Convex CLI writes `NEXT_PUBLIC_CONVEX_URL` automatically)

- [ ] **Step 5.1: Initialize Convex** — this will open a browser for login if first time

```bash
cd "C:/Users/ajit2/Ajit/glowup-room"
npx convex dev --once --configure=new
```

Pick project name `glowup-room`. **CHECKPOINT — stop if it prompts for login in browser.** Ajit must complete Convex auth. Resume once `.env.local` contains `NEXT_PUBLIC_CONVEX_URL=...` and `convex/` folder has a `_generated/` subfolder.

- [ ] **Step 5.2: Write `convex/schema.ts`**

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  signups: defineTable({
    email: v.string(),
    createdAt: v.number(),
    source: v.union(v.literal("landing"), v.literal("try")),
  }).index("by_email", ["email"]),

  renders: defineTable({
    signupId: v.id("signups"),
    beforeStorageId: v.id("_storage"),
    style: v.string(),
    budget: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("complete"),
      v.literal("failed")
    ),
    replicatePredictionId: v.optional(v.string()),
    afterImageUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status_createdAt", ["status", "createdAt"]),
});
```

- [ ] **Step 5.3: Write `convex/signups.ts`**

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGet = mutation({
  args: { email: v.string(), source: v.union(v.literal("landing"), v.literal("try")) },
  handler: async (ctx, { email, source }) => {
    const existing = await ctx.db
      .query("signups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("signups", { email, source, createdAt: Date.now() });
  },
});

export const getById = query({
  args: { id: v.id("signups") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});
```

- [ ] **Step 5.4: Write `convex/files.ts`**

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => await ctx.storage.getUrl(storageId),
});
```

- [ ] **Step 5.5: Write `convex/renders.ts` (mutations + queries only — replicate action comes in Task 7)**

```ts
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    signupId: v.id("signups"),
    beforeStorageId: v.id("_storage"),
    style: v.string(),
    budget: v.string(),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("renders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    }),
});

export const getById = query({
  args: { id: v.id("renders") },
  handler: async (ctx, { id }) => {
    const r = await ctx.db.get(id);
    if (!r) return null;
    const beforeUrl = await ctx.storage.getUrl(r.beforeStorageId);
    return { ...r, beforeUrl };
  },
});

export const setStatus = internalMutation({
  args: {
    id: v.id("renders"),
    status: v.union(v.literal("processing"), v.literal("complete"), v.literal("failed")),
    replicatePredictionId: v.optional(v.string()),
    afterImageUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const completed = patch.status === "complete" || patch.status === "failed";
    await ctx.db.patch(id, { ...patch, ...(completed ? { completedAt: Date.now() } : {}) });
  },
});
```

- [ ] **Step 5.6: Push schema + functions** — leave `npx convex dev` running in a separate terminal so it auto-deploys changes

```bash
npx convex dev
```

- [ ] **Step 5.7: Verify** — in Convex dashboard, schema shows `signups` + `renders` with the right fields. Run in another terminal:
```bash
npx convex run signups:createOrGet '{"email":"test@example.com","source":"landing"}'
```
Expect an ID back. Delete that test row in the dashboard.

---

## Task 6: Wire ConvexProvider into Next.js

**Files:**
- Modify: `app/providers.tsx`

- [ ] **Step 6.1: Update `app/providers.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { initPostHog } from "@/lib/posthog";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { initPostHog(); }, []);
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

- [ ] **Step 6.2: Verify** — `npm run dev`, `/` still renders. No Convex errors in browser console.

---

## Task 7: Replicate action (server-side render kickoff + poll)

**Files:**
- Create: `lib/styles.ts`, `convex/replicate.ts`

> **CHECKPOINT — stop at the end of Step 7.2.** Ask Ajit for `REPLICATE_API_TOKEN`. Then run:
> ```bash
> npx convex env set REPLICATE_API_TOKEN <value>
> ```
> Only resume once Convex dashboard → Settings → Env Vars shows the token.

- [ ] **Step 7.1: Write `lib/styles.ts`** — source of truth for all four prompts

```ts
export const STYLE_OPTIONS = [
  "Minimalist Warm",
  "Boho India",
  "Indian Contemporary",
  "Scandi-Warm Indian",
] as const;
export type Style = (typeof STYLE_OPTIONS)[number];

export const BUDGET_OPTIONS = ["₹5K", "₹15K", "₹30K", "₹50K+"] as const;
export type Budget = (typeof BUDGET_OPTIONS)[number];

export const NEGATIVE_PROMPT =
  "cluttered, messy, low quality, blurry, distorted furniture, unrealistic perspective, cartoon, oversaturated, dark, dingy, people, watermark, text";

export const REPLICATE_SETTINGS = {
  guidance_scale: 15,
  num_inference_steps: 50,
  prompt_strength: 0.8,
};

export const STYLE_PROMPT_MAP: Record<Style, string> = {
  "Minimalist Warm":
    "A minimalist warm living room, soft white walls, light oak wood flooring, low-profile beige linen sofa, cream wool rug, single sculptural brass floor lamp, indoor palm plant in terracotta pot, large neutral canvas artwork, natural sunlight, calm uncluttered space, interior design magazine photography, 4k",
  "Boho India":
    "A boho Indian living room, jewel-toned walls in deep emerald, a low-slung fabric sofa in cream with jewel-tone velvet cushions, Jaipur block-print floor cushions, brass peacock wall art, hanging rattan pendant lamp, Persian rug in deep red and indigo, indoor money plant in hand-painted ceramic pot, warm tungsten lighting, rich textures, interior design magazine photography, 4k",
  "Indian Contemporary":
    "An Indian contemporary living room, warm off-white walls with one accent wall in deep teal, low wooden sofa with mustard and terracotta cushions, brass coffee table, large monstera plant, Kutch embroidered wall hanging, brass floor lamp, warm lighting, layered textiles, interior design magazine photography, 4k",
  "Scandi-Warm Indian":
    "A scandi-warm Indian living room, off-white walls, natural teak wood floor, light gray linen three-seater sofa, chunky cream knit throw, minimal wooden coffee table with brass inlay, single large monstera plant, warm cream wool rug with subtle Kutch pattern, linen curtains, soft natural light, neutral serene palette with one indigo accent cushion, interior design magazine photography, 4k",
};
```

- [ ] **Step 7.2: Write `convex/replicate.ts`** — startRender action + recursive polling via scheduler

```ts
"use node";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const REPLICATE_URL = "https://api.replicate.com/v1/predictions";
// adirik/interior-design — pinned version hash from POC. Update if 404s.
const MODEL_VERSION = "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38";

const STYLE_PROMPT_MAP: Record<string, string> = {
  "Minimalist Warm":
    "A minimalist warm living room, soft white walls, light oak wood flooring, low-profile beige linen sofa, cream wool rug, single sculptural brass floor lamp, indoor palm plant in terracotta pot, large neutral canvas artwork, natural sunlight, calm uncluttered space, interior design magazine photography, 4k",
  "Boho India":
    "A boho Indian living room, jewel-toned walls in deep emerald, a low-slung fabric sofa in cream with jewel-tone velvet cushions, Jaipur block-print floor cushions, brass peacock wall art, hanging rattan pendant lamp, Persian rug in deep red and indigo, indoor money plant in hand-painted ceramic pot, warm tungsten lighting, rich textures, interior design magazine photography, 4k",
  "Indian Contemporary":
    "An Indian contemporary living room, warm off-white walls with one accent wall in deep teal, low wooden sofa with mustard and terracotta cushions, brass coffee table, large monstera plant, Kutch embroidered wall hanging, brass floor lamp, warm lighting, layered textiles, interior design magazine photography, 4k",
  "Scandi-Warm Indian":
    "A scandi-warm Indian living room, off-white walls, natural teak wood floor, light gray linen three-seater sofa, chunky cream knit throw, minimal wooden coffee table with brass inlay, single large monstera plant, warm cream wool rug with subtle Kutch pattern, linen curtains, soft natural light, neutral serene palette with one indigo accent cushion, interior design magazine photography, 4k",
};
const NEGATIVE_PROMPT =
  "cluttered, messy, low quality, blurry, distorted furniture, unrealistic perspective, cartoon, oversaturated, dark, dingy, people, watermark, text";

async function replicate(path: string, init: RequestInit = {}) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN not set on Convex");
  const res = await fetch(`https://api.replicate.com${path}`, {
    ...init,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Replicate ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

export const startRender = action({
  args: { renderId: v.id("renders"), beforeStorageId: v.id("_storage"), style: v.string() },
  handler: async (ctx, { renderId, beforeStorageId, style }) => {
    const beforeUrl = await ctx.storage.getUrl(beforeStorageId);
    if (!beforeUrl) throw new Error("before image URL unavailable");
    const prompt = STYLE_PROMPT_MAP[style];
    if (!prompt) throw new Error(`unknown style: ${style}`);

    const prediction = await replicate("/v1/predictions", {
      method: "POST",
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          image: beforeUrl,
          prompt,
          negative_prompt: NEGATIVE_PROMPT,
          guidance_scale: 15,
          num_inference_steps: 50,
          prompt_strength: 0.8,
        },
      }),
    });

    await ctx.runMutation(internal.renders.setStatus, {
      id: renderId,
      status: "processing",
      replicatePredictionId: prediction.id,
    });

    // kick off polling
    await ctx.scheduler.runAfter(3_000, internal.replicate.pollPrediction, {
      renderId,
      predictionId: prediction.id,
      attempt: 0,
    });
  },
});

export const pollPrediction = internalAction({
  args: {
    renderId: v.id("renders"),
    predictionId: v.string(),
    attempt: v.number(),
  },
  handler: async (ctx, { renderId, predictionId, attempt }) => {
    if (attempt > 60) {
      await ctx.runMutation(internal.renders.setStatus, {
        id: renderId,
        status: "failed",
        errorMessage: "timeout after 3 minutes",
      });
      return;
    }
    const p = await replicate(`/v1/predictions/${predictionId}`);
    if (p.status === "succeeded") {
      const afterUrl = Array.isArray(p.output) ? p.output[0] : p.output;
      await ctx.runMutation(internal.renders.setStatus, {
        id: renderId,
        status: "complete",
        afterImageUrl: afterUrl,
      });
      return;
    }
    if (p.status === "failed" || p.status === "canceled") {
      await ctx.runMutation(internal.renders.setStatus, {
        id: renderId,
        status: "failed",
        errorMessage: p.error || p.status,
      });
      return;
    }
    await ctx.scheduler.runAfter(3_000, internal.replicate.pollPrediction, {
      renderId,
      predictionId,
      attempt: attempt + 1,
    });
  },
});
```

- [ ] **Step 7.3: After Ajit sets the env var,** verify end-to-end with an existing render row. In `npx convex dev` terminal, first upload the existing `public/before.jpg` manually via dashboard (Files tab), note the `_storage` id. Create a test signup + render via dashboard or CLI:

```bash
# Get a signupId
npx convex run signups:createOrGet '{"email":"smoke@test.com","source":"try"}'
# Create a render (use real storageId + signupId)
npx convex run renders:create '{"signupId":"<SIGNUP_ID>","beforeStorageId":"<STORAGE_ID>","style":"Minimalist Warm","budget":"₹15K"}'
# Trigger replicate
npx convex run replicate:startRender '{"renderId":"<RENDER_ID>","beforeStorageId":"<STORAGE_ID>","style":"Minimalist Warm"}'
```

Watch `renders` table in dashboard: status should go `pending → processing → complete` with an `afterImageUrl` within 60–90s. Open that URL — should be a rendered living room.

---

## Task 8: Build /try page

**Files:**
- Create: `app/try/page.tsx`, `components/try/PhotoUpload.tsx`, `components/try/StylePicker.tsx`, `components/try/BudgetChips.tsx`

- [ ] **Step 8.1: Write `components/try/PhotoUpload.tsx`** — drag-drop + click + 5MB guard, uploads via Convex URL and returns the storageId

```tsx
"use client";
import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Props = { onUploaded: (storageId: Id<"_storage">) => void };

const MAX_BYTES = 5 * 1024 * 1024;

export default function PhotoUpload({ onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFile = useCallback(async (file: File) => {
    setErr(null);
    if (!file.type.startsWith("image/")) { setErr("Please upload an image."); return; }
    if (file.size > MAX_BYTES) { setErr("Max 5MB."); return; }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error("upload failed");
      const { storageId } = await res.json();
      onUploaded(storageId as Id<"_storage">);
    } catch (e: any) {
      setErr(e.message || "upload failed");
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, onUploaded]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-ink-soft rounded-2xl p-10 text-center cursor-pointer bg-card hover:border-accent transition-colors"
      >
        {preview ? (
          <img src={preview} alt="your room" className="mx-auto max-h-64 rounded-xl" />
        ) : (
          <p className="text-ink-muted">Drop a photo here or click to pick (max 5MB)</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {uploading && <p className="text-sm text-ink-muted mt-3">Uploading…</p>}
      {err && <p className="text-sm text-accent mt-3">{err}</p>}
    </div>
  );
}
```

- [ ] **Step 8.2: Write `components/try/StylePicker.tsx`**

```tsx
"use client";
import { STYLE_OPTIONS, type Style } from "@/lib/styles";

export default function StylePicker({ value, onChange }: { value: Style | null; onChange: (s: Style) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {STYLE_OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`rounded-2xl border-2 p-4 text-left font-medium transition-colors ${
            value === s
              ? "border-accent bg-accent/5 text-ink"
              : "border-border bg-card text-ink-dim hover:border-accent/50"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 8.3: Write `components/try/BudgetChips.tsx`**

```tsx
"use client";
import { BUDGET_OPTIONS, type Budget } from "@/lib/styles";

export default function BudgetChips({ value, onChange }: { value: Budget | null; onChange: (b: Budget) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BUDGET_OPTIONS.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => onChange(b)}
          className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
            value === b
              ? "border-accent bg-accent text-white"
              : "border-border bg-card text-ink-dim hover:border-accent/50"
          }`}
        >
          {b}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 8.4: Write `app/try/page.tsx`** — form page that wires everything and triggers the render

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import PhotoUpload from "@/components/try/PhotoUpload";
import StylePicker from "@/components/try/StylePicker";
import BudgetChips from "@/components/try/BudgetChips";
import { capture } from "@/lib/posthog";
import type { Style, Budget } from "@/lib/styles";

export default function TryPage() {
  const router = useRouter();
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const createSignup = useMutation(api.signups.createOrGet);
  const createRender = useMutation(api.renders.create);
  const startRender = useAction(api.replicate.startRender);

  useEffect(() => { capture("try_started"); }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = storageId && style && budget && emailValid && !submitting;

  const onUploaded = (id: Id<"_storage">) => {
    setStorageId(id);
    capture("try_photo_uploaded");
  };

  const submit = async () => {
    if (!canSubmit || !storageId || !style || !budget) return;
    setErr(null);
    setSubmitting(true);
    try {
      const signupId = await createSignup({ email, source: "try" });
      const renderId = await createRender({
        signupId,
        beforeStorageId: storageId,
        style,
        budget,
      });
      capture("try_submitted", { style, budget });
      await startRender({ renderId, beforeStorageId: storageId, style });
      router.push(`/gallery/${renderId}`);
    } catch (e: any) {
      setErr(e.message || "something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <a href="/" className="text-sm text-ink-muted hover:text-accent">← GlowUp.room</a>
      <h1 className="font-serif text-4xl mt-4 mb-2">Your glow-up</h1>
      <p className="text-ink-muted mb-10">Upload a photo of your living room. Pick a vibe and a budget. We'll email you the result.</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm uppercase tracking-[0.12em] text-ink-muted mb-3">1. Your room</h2>
          <PhotoUpload onUploaded={onUploaded} />
        </section>
        <section>
          <h2 className="text-sm uppercase tracking-[0.12em] text-ink-muted mb-3">2. Pick a vibe</h2>
          <StylePicker value={style} onChange={setStyle} />
        </section>
        <section>
          <h2 className="text-sm uppercase tracking-[0.12em] text-ink-muted mb-3">3. Budget</h2>
          <BudgetChips value={budget} onChange={setBudget} />
        </section>
        <section>
          <h2 className="text-sm uppercase tracking-[0.12em] text-ink-muted mb-3">4. Email (we'll send you the link)</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:border-accent"
          />
        </section>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full rounded-full bg-accent text-white font-semibold py-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Starting your glow-up…" : "Generate my glow-up"}
        </button>
        {err && <p className="text-sm text-accent">{err}</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 8.5: Verify** — `npm run dev`. On `/try`:
  - Drag-drop a >5MB image → "Max 5MB" error
  - Drag-drop a small JPEG → upload spinner, then preview
  - Pick style + budget + valid email → button enables
  - Click Generate → URL becomes `/gallery/<id>` (will 404 until next task)
  - Convex dashboard: `renders` row in `processing`, then `complete`
  - PostHog: `try_started`, `try_photo_uploaded`, `try_submitted` events

---

## Task 9: Build /gallery/[id] result page

**Files:**
- Create: `app/gallery/[id]/page.tsx`, `components/share/ShareButtons.tsx`

- [ ] **Step 9.1: Write `components/share/ShareButtons.tsx`**

```tsx
"use client";
import { useState } from "react";
import { capture } from "@/lib/posthog";

export default function ShareButtons({ url, style }: { url: string; style: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Look at my ${style} glow-up from GlowUp.room — AI restyled my living room in 60s.`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    capture("gallery_shared", { platform: "copy" });
    setTimeout(() => setCopied(false), 2000);
  };
  const onWhatsApp = () => capture("gallery_shared", { platform: "whatsapp" });
  const onTwitter = () => capture("gallery_shared", { platform: "x" });

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button onClick={copy} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:border-accent">
        {copied ? "Copied ✓" : "Copy link"}
      </button>
      <a href={waUrl} target="_blank" rel="noopener" onClick={onWhatsApp} className="rounded-full bg-[#25D366] text-white px-5 py-2.5 text-sm font-medium">WhatsApp</a>
      <a href={xUrl} target="_blank" rel="noopener" onClick={onTwitter} className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium">Share on X</a>
    </div>
  );
}
```

- [ ] **Step 9.2: Write `app/gallery/[id]/page.tsx`** — combines metadata (server-side) for OG tags AND the client component for interactive bits

```tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const render = await fetchQuery(api.renders.getById, { id: params.id as Id<"renders"> });
  const title = render
    ? `${render.style} glow-up — GlowUp.room`
    : "GlowUp.room";
  const description = render
    ? `AI-styled ${render.style} living room, on a ${render.budget} budget.`
    : "AI home styling for Indian apartments.";
  const image = render?.afterImageUrl || "https://glowup-room.vercel.app/after.png";
  const url = `https://glowup-room.vercel.app/gallery/${params.id}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [image], url },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function Page({ params }: Params) {
  return <GalleryClient id={params.id} />;
}
```

- [ ] **Step 9.3: Write `app/gallery/[id]/GalleryClient.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShareButtons from "@/components/share/ShareButtons";
import { capture } from "@/lib/posthog";

export default function GalleryClient({ id }: { id: string }) {
  const render = useQuery(api.renders.getById, { id: id as Id<"renders"> });
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => { if (render) capture("gallery_viewed", { status: render.status }); }, [render?.status]);

  if (render === undefined) return <main className="p-12 text-center text-ink-muted">Loading…</main>;
  if (render === null) return <main className="p-12 text-center">Render not found.</main>;

  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <a href="/" className="text-sm text-ink-muted hover:text-accent">← GlowUp.room</a>
      <h1 className="font-serif text-4xl mt-4 mb-2">{render.style}</h1>
      <p className="text-ink-muted mb-8">Budget: {render.budget}</p>

      {render.status === "complete" && render.afterImageUrl && render.beforeUrl ? (
        <>
          <BeforeAfterSlider beforeSrc={render.beforeUrl} afterSrc={render.afterImageUrl} className="mb-8" />
          <ShareButtons url={pageUrl} style={render.style} />
          <div className="text-center mt-12">
            <a href="/try" className="inline-block rounded-full bg-accent text-white font-semibold px-8 py-4">Get your own glow-up</a>
          </div>
        </>
      ) : render.status === "failed" ? (
        <div className="text-center py-12 text-accent">
          Something went wrong generating your render. {render.errorMessage}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="animate-pulse text-ink-muted">
            {render.status === "pending" ? "Queued…" : "AI is styling your room (60–90s)…"}
          </div>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 9.4: Verify**
  - Open the `/gallery/<id>` URL from Task 8's end-state — see loading, then auto-update to complete
  - Before/after slider works
  - Copy link copies URL; WhatsApp and X open correct share dialogs with prefilled text
  - View source of the gallery page → `og:image` meta points at the afterImageUrl (or paste URL into https://opengraph.xyz to check)
  - PostHog: `gallery_viewed` + `gallery_shared` events with `platform` property

---

## Task 10: Git init + GitHub repo + Vercel relink

**Files:**
- Create: fresh git repo; new GitHub repo `glowup-room` (public)

- [ ] **Step 10.1: Init git and first commit**

```bash
cd "C:/Users/ajit2/Ajit/glowup-room"
git init
git add .
git commit -m "feat: next.js + convex + /try + /gallery MVP"
```

- [ ] **Step 10.2: Create public GitHub repo and push**

```bash
gh repo create glowup-room --public --source=. --remote=origin --push
```

(If `gh` isn't authed, it'll prompt — **CHECKPOINT**: let Ajit auth in browser.)

- [ ] **Step 10.3: Link Vercel project to GitHub** — the existing `.vercel/project.json` keeps our project ID. In Vercel dashboard → glowup-room → Settings → Git → Connect to github.com/<user>/glowup-room, main branch.

- [ ] **Step 10.4: Set Vercel env vars** (Dashboard → Settings → Environment Variables — all environments):
  - `NEXT_PUBLIC_CONVEX_URL` = value from `.env.local`
  - `NEXT_PUBLIC_POSTHOG_KEY` = `phc_D3BgHXu4psdeqLqs4QESzWLkNW7wuzEobWg2RSh7zFm4`
  - `NEXT_PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`
  - `CONVEX_DEPLOY_KEY` = create one via `npx convex deploy-key` (needed so Vercel deploys Convex functions too)

- [ ] **Step 10.5: Add Convex deploy to build** — modify `package.json` scripts:
  ```json
  "build": "npx convex deploy --cmd 'next build'"
  ```

- [ ] **Step 10.6: Trigger a preview deploy**

```bash
vercel --prod=false
```

Capture the preview URL.

> **CHECKPOINT — stop.** Share preview URL with Ajit. Wait for his test + sign-off on:
> - `/` visual parity
> - `/try` full flow (upload → generate)
> - `/gallery/[id]` shareable link + OG preview (share the URL in a WhatsApp draft — do you see the after image?)
> - Mobile viewport

---

## Task 11: Production deploy

- [ ] **Step 11.1: After Ajit's green light**

```bash
vercel --prod
```

- [ ] **Step 11.2: Verify** — hit `https://glowup-room.vercel.app`, run the full `/` → `/try` → `/gallery` flow once with a fresh email. Done.

---

## Rollback plan

If production breaks:
- Vercel Dashboard → Deployments → find the last good deploy → "Promote to Production" (1-click rollback).
- If the issue is Convex: `npx convex deploy --url <previous-prod-url>` or restore from dashboard history.
- Worst case: set Vercel's production alias back to the Vercel project's older static deploy of `index.html`. The `_legacy-landing.html` file is preserved and can be re-published as a pure static site within 5 minutes if needed.

---

## Time budget

| Task | Est |
|------|-----|
| 1. Snapshot | 5m |
| 2. Scaffold | 20m |
| 3. Slider component | 20m |
| 4. Landing migration | 40m |
| 5. Convex init + schema | 15m |
| 6. Convex provider | 5m |
| 7. Replicate action + verify | 25m |
| 8. /try page | 40m |
| 9. /gallery page | 30m |
| 10. GitHub + Vercel link + preview | 20m |
| 11. Prod deploy | 5m |
| **Total** | **~3h 45m** |

---

## Addendum — baked-in extras (approved 2026-04-23)

**(a) `posthog.identify(email)` in submit handler** — extend `lib/posthog.ts` with:
```ts
export function identify(email: string) {
  if (typeof window !== "undefined" && initialized) posthog.identify(email, { email });
}
```
And in `app/try/page.tsx` `submit()`, right after `const signupId = await createSignup(...)`:
```ts
identify(email);
```

**(b) Explicit `render_generated` event fired once when status flips to complete** — in `GalleryClient.tsx`, replace the `gallery_viewed` effect with:
```tsx
const firedRef = useRef(false);
useEffect(() => {
  if (!render) return;
  capture("gallery_viewed", { status: render.status });
  if (render.status === "complete" && !firedRef.current) {
    firedRef.current = true;
    capture("render_generated", { style: render.style, budget: render.budget });
  }
}, [render?.status]);
```

**(c) Retry button on failed state** — requires:
1. `convex/renders.ts` `setStatus` internalMutation also clears `errorMessage` and `afterImageUrl` on status transitions (not just on completion — otherwise the stale error lingers through a retry).
2. New public action `retryRender` in `convex/replicate.ts`:
```ts
export const retryRender = action({
  args: { renderId: v.id("renders") },
  handler: async (ctx, { renderId }): Promise<void> => {
    const render = await ctx.runQuery(api.renders.getById, { id: renderId });
    if (!render) throw new Error("render not found");
    await ctx.runAction(api.replicate.startRender, {
      renderId,
      beforeStorageId: render.beforeStorageId,
      style: render.style,
    });
  },
});
```
3. Button in `GalleryClient.tsx` failed branch:
```tsx
<button
  onClick={async () => { setRetrying(true); try { await retry({ renderId: id as Id<"renders"> }); } finally { setRetrying(false); } }}
  disabled={retrying}
  className="mt-4 rounded-full bg-accent text-white font-semibold px-6 py-3 disabled:opacity-50"
>
  {retrying ? "Retrying…" : "Try again"}
</button>
```
Wire with `const retry = useAction(api.replicate.retryRender);` and a `useState(false)` for `retrying`.

---

## Checkpoints (stop and ask)

1. **End of this plan (now)** — approve before I write any code.
2. **Step 5.1** — Convex browser login.
3. **Step 7.2** — `REPLICATE_API_TOKEN`.
4. **Step 10.2** — `gh` auth if not logged in.
5. **Step 10.6** — preview URL, wait for Ajit's sign-off before prod.
6. **Any error I can't resolve in 2 tries.**
