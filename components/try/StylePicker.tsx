"use client";
import { STYLE_OPTIONS, type Style } from "@/lib/styles";

export default function StylePicker({
  value,
  onChange,
}: {
  value: Style | null;
  onChange: (s: Style) => void;
}) {
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
