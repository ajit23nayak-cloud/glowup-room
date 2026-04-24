"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import PhotoUpload from "@/components/try/PhotoUpload";
import StylePicker from "@/components/try/StylePicker";
import BudgetChips from "@/components/try/BudgetChips";
import { capture, identify } from "@/lib/posthog";
import type { Style, Budget } from "@/lib/styles";

type PaywallPayload = { code: "paywall"; upgradeUrl: string; rendersCompleted?: number };
function paywallPayload(e: unknown): PaywallPayload | null {
  if (!(e instanceof ConvexError)) return null;
  const data = (e as ConvexError<{ code?: string; upgradeUrl?: string; rendersCompleted?: number }>).data;
  if (data && typeof data === "object" && data.code === "paywall" && typeof data.upgradeUrl === "string") {
    return { code: "paywall", upgradeUrl: data.upgradeUrl, rendersCompleted: data.rendersCompleted };
  }
  return null;
}

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

  useEffect(() => {
    capture("try_started");
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = Boolean(storageId && style && budget && emailValid && !submitting);

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
      identify(email);
      const renderId = await createRender({
        signupId,
        beforeStorageId: storageId,
        style,
        budget,
      });
      capture("try_submitted", { style, budget });
      await startRender({ renderId, beforeStorageId: storageId, style });
      router.push(`/gallery/${renderId}`);
    } catch (e: unknown) {
      const pw = paywallPayload(e);
      if (pw) {
        capture("paywall_hit", {
          from: "try_submit",
          rendersCompleted: pw.rendersCompleted ?? null,
          email,
        });
        router.push(`${pw.upgradeUrl}?from=try`);
        return;
      }
      setErr(e instanceof Error ? e.message : "something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <a href="/" className="text-sm text-ink-muted hover:text-accent">
        ← GlowUp.room
      </a>
      <h1 className="font-serif text-4xl mt-4 mb-2">Your glow-up</h1>
      <p className="text-ink-muted mb-10">
        Upload a photo of your living room. Pick a vibe and a budget. We&apos;ll email you the result.
      </p>

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
          <h2 className="text-sm uppercase tracking-[0.12em] text-ink-muted mb-3">
            4. Email (we&apos;ll send you the link)
          </h2>
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
