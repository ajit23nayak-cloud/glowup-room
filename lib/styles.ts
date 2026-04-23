export const STYLE_OPTIONS = [
  "Minimalist Warm",
  "Boho India",
  "Indian Contemporary",
  "Scandi-Warm Indian",
] as const;
export type Style = (typeof STYLE_OPTIONS)[number];

export const BUDGET_OPTIONS = ["₹5K", "₹15K", "₹30K", "₹50K+"] as const;
export type Budget = (typeof BUDGET_OPTIONS)[number];
