import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isAdminAuthed, clearAdminCookie } from "../auth";

export const dynamic = "force-dynamic";

async function verifyAction(formData: FormData) {
  "use server";
  const paymentId = formData.get("paymentId") as string;
  const note = (formData.get("note") as string) || undefined;
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not configured");
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  await client.mutation(api.payments.verifyPayment, {
    adminSecret: pw,
    paymentId: paymentId as Id<"payments">,
    note,
  });
  redirect("/admin/payments");
}

async function rejectAction(formData: FormData) {
  "use server";
  const paymentId = formData.get("paymentId") as string;
  const note = (formData.get("note") as string) || undefined;
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not configured");
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  await client.mutation(api.payments.rejectPayment, {
    adminSecret: pw,
    paymentId: paymentId as Id<"payments">,
    note,
  });
  redirect("/admin/payments");
}

async function signOutAction() {
  "use server";
  clearAdminCookie();
  redirect("/admin/login");
}

async function resetSignupAction(formData: FormData): Promise<void> {
  "use server";
  const email = (formData.get("email") as string)?.trim();
  if (!email) return;
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not configured");
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const r = await client.mutation(api.signups.adminResetByEmail, {
    adminSecret: pw,
    email,
  });
  redirect(`/admin/payments?reset=${encodeURIComponent(email)}&n=${r.resetCount}`);
}

async function deleteSignupAction(formData: FormData): Promise<void> {
  "use server";
  const email = (formData.get("email") as string)?.trim();
  if (!email) return;
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not configured");
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const r = await client.mutation(api.signups.adminDeleteByEmail, {
    adminSecret: pw,
    email,
  });
  redirect(`/admin/payments?deleted=${encodeURIComponent(email)}&n=${r.deletedCount}`);
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { reset?: string; deleted?: string; n?: string };
}) {
  if (!isAdminAuthed()) redirect("/admin/login");
  const pw = process.env.ADMIN_PASSWORD!;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const [pending, recent] = await Promise.all([
    client.query(api.payments.listPending, { adminSecret: pw }),
    client.query(api.payments.listRecent, { adminSecret: pw }),
  ]);
  const flash = searchParams.reset
    ? `Reset ${searchParams.n ?? "?"} signup row(s) for ${searchParams.reset}.`
    : searchParams.deleted
      ? `Deleted ${searchParams.n ?? "?"} signup row(s) for ${searchParams.deleted}.`
      : null;

  return (
    <main className="min-h-screen bg-bg">
      <header className="py-4 border-b border-border">
        <div className="mx-auto max-w-5xl px-6 flex justify-between items-center">
          <div className="font-serif text-xl">
            Admin — Payments
          </div>
          <form action={signOutAction}>
            <button className="text-[13px] text-ink-muted hover:text-accent">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        {flash && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[14px] text-emerald-900">
            {flash}
          </div>
        )}

        <h2 className="font-serif text-2xl mb-4">Signup tools</h2>
        <div className="bg-card border border-border rounded-2xl p-5 mb-12 space-y-4">
          <div>
            <label className="block text-[13px] uppercase tracking-[0.12em] text-ink-muted mb-2">
              Reset signup for testing
            </label>
            <form action={resetSignupAction} className="flex gap-2 flex-wrap">
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                className="flex-1 min-w-[240px] rounded-lg border border-border bg-bg px-3 py-2 text-[14px]"
              />
              <button
                type="submit"
                className="rounded-lg bg-ink text-white font-semibold px-4 py-2 text-[13px]"
              >
                Reset (free tier)
              </button>
            </form>
            <p className="mt-2 text-[12px] text-ink-muted">
              Sets rendersCompleted=0, paidTier=false, paidTierExpiresAt=undefined,
              rendersInProgress=0, failedRenderAttempts=0. Backfills emailNormalized.
            </p>
          </div>
          <div>
            <label className="block text-[13px] uppercase tracking-[0.12em] text-ink-muted mb-2">
              Hard-delete signup (test typos only)
            </label>
            <form action={deleteSignupAction} className="flex gap-2 flex-wrap">
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                className="flex-1 min-w-[240px] rounded-lg border border-border bg-bg px-3 py-2 text-[14px]"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent text-white font-semibold px-4 py-2 text-[13px]"
              >
                Delete signup row
              </button>
            </form>
            <p className="mt-2 text-[12px] text-ink-muted">
              Removes the signup entirely. Use only for clearly-bogus test typos.
              Renders / payments referencing this signup will keep their
              foreign-key references but be orphaned.
            </p>
          </div>
        </div>

        <h2 className="font-serif text-2xl mb-4">
          Pending verification ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-ink-muted mb-12">Nothing pending. 🎉</p>
        ) : (
          <div className="space-y-3 mb-12">
            {pending.map((p) => (
              <div key={p._id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex flex-wrap gap-4 items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-ink">{p.email}</div>
                    <div className="text-[13px] text-ink-muted">
                      UTR: <span className="font-mono">{p.utr}</span> · ₹{p.amount} · {fmtDate(p.submittedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={verifyAction} className="flex-1 min-w-[200px] flex gap-2">
                    <input type="hidden" name="paymentId" value={p._id} />
                    <input
                      type="text"
                      name="note"
                      placeholder="Optional note"
                      className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px]"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 text-white font-semibold px-4 py-2 text-[13px]"
                    >
                      Verify
                    </button>
                  </form>
                  <form action={rejectAction} className="flex-1 min-w-[200px] flex gap-2">
                    <input type="hidden" name="paymentId" value={p._id} />
                    <input
                      type="text"
                      name="note"
                      placeholder="Rejection reason"
                      className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px]"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-accent text-white font-semibold px-4 py-2 text-[13px]"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="font-serif text-2xl mb-4">Recent (all statuses)</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-bg border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">UTR</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Submitted (IST)</th>
                <th className="px-4 py-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3 font-mono">{p.utr}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === "verified"
                          ? "text-emerald-700"
                          : p.status === "rejected"
                            ? "text-accent"
                            : "text-ink-dim"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{fmtDate(p.submittedAt)}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.adminNote ?? ""}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-ink-muted" colSpan={5}>
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
