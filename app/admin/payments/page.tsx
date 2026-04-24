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

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
}

export default async function AdminPaymentsPage() {
  if (!isAdminAuthed()) redirect("/admin/login");
  const pw = process.env.ADMIN_PASSWORD!;
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const [pending, recent] = await Promise.all([
    client.query(api.payments.listPending, { adminSecret: pw }),
    client.query(api.payments.listRecent, { adminSecret: pw }),
  ]);

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
