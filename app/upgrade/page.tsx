import { Suspense } from "react";
import UpgradeClient from "./UpgradeClient";

export default function UpgradePage() {
  return (
    <Suspense fallback={<main className="p-12 text-center text-ink-muted">Loading…</main>}>
      <UpgradeClient />
    </Suspense>
  );
}
