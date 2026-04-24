import { redirect } from "next/navigation";
import { isAdminAuthed, setAdminCookie } from "../auth";

async function loginAction(formData: FormData) {
  "use server";
  const pw = formData.get("password");
  if (typeof pw !== "string") return;
  if (pw === process.env.ADMIN_PASSWORD) {
    setAdminCookie();
    redirect("/admin/payments");
  }
  redirect("/admin/login?err=1");
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { err?: string };
}) {
  if (isAdminAuthed()) redirect("/admin/payments");
  const err = searchParams.err === "1";
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-8">
        <h1 className="font-serif text-2xl mb-6">Admin login</h1>
        <form action={loginAction} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 focus:outline-none focus:border-accent"
          />
          {err && <p className="text-sm text-accent">Wrong password.</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-accent text-white font-semibold py-3"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
