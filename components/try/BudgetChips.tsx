"use client";
import { BUDGET_OPTIONS, type Budget } from "@/lib/styles";

export default function BudgetChips({
  value,
  onChange,
}: {
  value: Budget | null;
  onChange: (b: Budget) => void;
}) {
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
