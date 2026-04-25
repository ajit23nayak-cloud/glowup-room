"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import PhotoUpload from "@/components/try/PhotoUpload";
import StylePicker from "@/components/try/StylePicker";
import BudgetChips from "@/components/try/BudgetChips";
import { capture, identify } from "@/lib/posthog";
import type { Style, Budget } from "@/lib/styles";
import { EMAIL_REGEX } from "@/lib/normalizeEmail";

type ConvexErrorData = {
  code?: string;
  message?: string;
  upgradeUrl?: string;
  rendersCompleted?: number;
};
function readConvexError(e: unknown): ConvexErrorData | null {
  if (!(e instanceof ConvexError)) return null;
  const data = (e as ConvexError<ConvexErrorData>).data;
  return data && typeof data === "object" ? data : null;
}

async function emailHash(email: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) return "";
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(email.trim().toLowerCase()),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 12);
}

function fmtExpiry(ms: number | null | undefined): string {
  if (!ms) return "soon";
  const d = new Date(ms);
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TryPage() {
  const router = useRouter();
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const createSignup = useAction(api.signupsNode.createOrGet);
  const createRender = useMutation(api.renders.create);
  const startRender = useAction(api.replicate.startRender);

  // Debounce email by 500ms before kicking off the inline-paywall query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(email), 500);
    return () => clearTimeout(t);
  }, [email]);

  const emailValid = EMAIL_REGEX.test(email.trim());
  // Only fire getSignupStatus when the debounced email is well-formed —
  // saves the round-trip when the user is mid-typing.
  const statusArgs = useMemo(
    () =>
      EMAIL_REGEX.test(debouncedEmail.trim())
        ? { email: debouncedEmail.trim() }
        : "skip",
    [debouncedEmail],
  );
  const signupStatus = useQuery(api.signups.getSignupStatus, statusArgs as { email: string });

  // PostHog event when a non-trivial paywall banner appears
  useEffect(() => {
    if (!signupStatus) return;
    if (
      signupStatus.status === "free_used" ||
      signupStatus.status === "paid_active" ||
      signupStatus.status === "paid_expired"
    ) {
      void emailHash(debouncedEmail).then((h) =>
        capture("paywall_inline_shown", {
          email_hash: h,
          status: signupStatus.status,
        }),
      );
    }
  }, [signupStatus?.status, debouncedEmail]);

  useEffect(() => {
    capture("try_started");
  }, []);

  const blocked =
    signupStatus?.status === "free_used" || signupStatus?.status === "paid_expired";
  const canSubmit = Boolean(
    storageId && style && budget && emailValid && !submitting && !blocked,
  );

  const onUploaded = (id: Id<"_storage">) => {
    setStorageId(id);
    capture("try_photo_uploaded");
  };

  const submit = async () => {
    if (!canSubmit || !storageId || !style || !budget) return;
    setErr(null);
    setSubmitting(true);
    try {
      const result = await createSignup({ email, source: "try" });
      identify(email);
      const renderId = await createRender({
        signupId: result.signupId as Id<"signups">,
        beforeStorageId: storageId,
        style,
        budget,
      });
      capture("try_submitted", { style, budget });
      await startRender({ renderId, beforeStorageId: storageId, style });
      router.push(`/gallery/${renderId}`);
    } catch (e: unknown) {
      const data = readConvexError(e);
      if (data?.code === "paywall" && data.upgradeUrl) {
        capture("paywall_hit", {
          from: "try_submit",
          rendersCompleted: data.rendersCompleted ?? null,
          email,
        });
        router.push(`${data.upgradeUrl}?from=try&email=${encodeURIComponent(email)}`);
        return;
      }
      // Surface specific server-validated email/upload errors with their messages
      if (data?.message) {
        setErr(data.message);
      } else {
        setErr(e instanceof Error ? e.message : "Something went wrong");
      }
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <a href="/" className="text-sm text-ink-muted hover:text-accent">
        ← GlowUp.room
      </a>
      <h1 className="font-serif text-4xl mt-4 mb-2">Your glow-up</h1>
      <p className="text-ink-muted mb-4">
        Upload a photo of your living room. Pick a vibe and a budget. We&apos;ll email you the result.
      </p>

      <p className="inline-block mb-10 text-[12px] text-accent uppercase tracking-[0.12em] font-semibold border border-accent/30 bg-accent/5 rounded-full px-3 py-1">
        First render free per email · ₹99 unlocks unlimited for 24h
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
          <InlinePaywallBanner status={signupStatus} email={email} />
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
      <p className="mt-12 text-center text-[12px] text-ink-soft">
        <a href="/terms" className="hover:text-ink-dim">Terms</a>
        <span className="mx-2">·</span>
        <a href="/privacy" className="hover:text-ink-dim">Privacy</a>
      </p>
    </main>
  );
}

function InlinePaywallBanner({
  status,
  email,
}: {
  status:
    | {
        status: "new" | "free_used" | "paid_active" | "paid_expired" | "invalid_format";
        rendersCompleted: number;
        paidTierExpiresAt: number | null;
      }
    | undefined;
  email: string;
}) {
  if (!status) return null;
  if (status.status === "new" || status.status === "invalid_format") return null;

  const upgradeHref = `/upgrade?email=${encodeURIComponent(email)}&from=try-inline`;

  if (status.status === "paid_active") {
    return (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900">
        <strong>You&apos;re paid through {fmtExpiry(status.paidTierExpiresAt)}.</strong>{" "}
        Generate as many as you want.
      </div>
    );
  }
  if (status.status === "free_used") {
    return (
      <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-[14px] text-ink-dim">
        <strong className="text-ink">You&apos;ve already used your free glow-up with this email.</strong>{" "}
        Unlock unlimited renders for 24 hours — ₹99 via UPI.{" "}
        <a href={upgradeHref} className="text-accent font-semibold underline">
          Continue to upgrade →
        </a>
      </div>
    );
  }
  // paid_expired
  return (
    <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-[14px] text-ink-dim">
      <strong className="text-ink">Your 24h window expired.</strong> Renew for ₹99.{" "}
      <a href={upgradeHref} className="text-accent font-semibold underline">
        Renew →
      </a>
    </div>
  );
}
