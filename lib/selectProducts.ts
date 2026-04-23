import {
  getProductsByStyle,
  type ShopCategory,
  type ShopProduct,
} from "./shopCatalog";
import type { Style } from "./styles";

/** Parse the user-facing budget chip string into an INR ceiling. */
export function parseBudget(budget: string): number {
  const s = budget.replace(/[^\d.KkMm+]/g, "").trim();
  if (/\+$/.test(s)) {
    // "50K+" → treat as generous ceiling
    const base = Number(s.replace(/[Kk+]/g, "")) * 1000;
    return Math.max(base, 75000);
  }
  if (/K$/i.test(s)) return Number(s.replace(/[Kk]/g, "")) * 1000;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

type Required = { cat: ShopCategory; count: number };

// Priority for "the glow-up essentials." Sofa and rug define the room; cushions
// add styling; lamp/art/planter/side table are finishing touches.
const REQUIRED: Required[] = [
  { cat: "sofa", count: 1 },
  { cat: "rug", count: 1 },
  { cat: "cushion_cover", count: 2 },
  { cat: "floor_lamp", count: 1 },
  { cat: "wall_art", count: 1 },
  { cat: "planter", count: 1 },
  { cat: "side_table", count: 1 },
];
const EXTRAS: ShopCategory[] = ["coffee_table", "armchair", "curtain_or_throw"];

const MIN_PRODUCTS = 2;
const MAX_PRODUCTS = 12;
const MAX_KEYWORD_WORDS = 25; // approx 40 CLIP tokens — hard cap per spec

export type Selection = {
  products: ShopProduct[];
  productIds: string[];
  keywordInjection: string; // "" when nothing selected
  totalPriceINR: number;
};

/**
 * Greedy budget-fit selection. Covers required categories cheapest-first so every
 * glow-up gets a sofa/rug/cushions/etc. where possible, then fills with extras
 * while budget remains. Caps at 12 products total.
 */
export function selectProducts(style: Style, budgetINR: number): Selection {
  const byCategory = new Map<ShopCategory, ShopProduct[]>();
  for (const p of getProductsByStyle(style)) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  for (const list of byCategory.values()) list.sort((a, b) => a.priceINR - b.priceINR);

  let remaining = budgetINR;
  const picked: ShopProduct[] = [];
  const pickedIds = new Set<string>();

  const tryPickFrom = (cat: ShopCategory) => {
    const pool = byCategory.get(cat) ?? [];
    for (const p of pool) {
      if (pickedIds.has(p.id)) continue;
      if (p.priceINR <= remaining) {
        picked.push(p);
        pickedIds.add(p.id);
        remaining -= p.priceINR;
        return true;
      }
    }
    return false;
  };

  // Pass 1: required categories (cheapest-first)
  for (const { cat, count } of REQUIRED) {
    for (let i = 0; i < count; i++) {
      if (picked.length >= MAX_PRODUCTS) break;
      tryPickFrom(cat);
    }
  }

  // Pass 2: extras, one per category
  for (const cat of EXTRAS) {
    if (picked.length >= MAX_PRODUCTS) break;
    tryPickFrom(cat);
  }

  // Pass 3: backfill — any remaining product cheapest-first if budget allows and
  // we're under MAX_PRODUCTS (helps higher budgets reach the 8-12 target)
  if (picked.length < MAX_PRODUCTS) {
    const all = [...getProductsByStyle(style)].sort((a, b) => a.priceINR - b.priceINR);
    for (const p of all) {
      if (picked.length >= MAX_PRODUCTS) break;
      if (pickedIds.has(p.id)) continue;
      if (p.priceINR <= remaining) {
        picked.push(p);
        pickedIds.add(p.id);
        remaining -= p.priceINR;
      }
    }
  }

  // At very low budgets, ensure we return at least MIN_PRODUCTS even if under-budget
  // (no-op if we already have ≥ MIN).

  const totalPriceINR = picked.reduce((n, p) => n + p.priceINR, 0);
  return {
    products: picked,
    productIds: picked.map((p) => p.id),
    keywordInjection: buildKeywordInjection(picked.map((p) => p.visualKeyword)),
    totalPriceINR,
  };
}

/**
 * Build a comma-separated visual keyword list capped at MAX_KEYWORD_WORDS.
 * Truncates from the tail — first-priority products keep their keywords.
 */
export function buildKeywordInjection(keywords: string[]): string {
  const parts: string[] = [];
  let wordCount = 0;
  for (const kw of keywords) {
    const words = kw.trim().split(/\s+/).length;
    if (wordCount + words > MAX_KEYWORD_WORDS) break;
    parts.push(kw);
    wordCount += words;
  }
  return parts.join(", ");
}
