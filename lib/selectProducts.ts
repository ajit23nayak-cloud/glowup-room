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

const MAX_PRODUCTS = 6;
const MAX_KEYWORD_WORDS = 25; // approx 40 CLIP tokens — hard cap per spec

export type Selection = {
  products: ShopProduct[];
  productIds: string[];
  keywordInjection: string; // "" when nothing selected
  totalPriceINR: number;
  sofaOmittedForBudget: boolean;
  minSofaPriceINR: number; // min sofa price for this style (for warning copy)
};

/**
 * 6-slot fixed selection — matches what Flux Kontext actually renders on screen,
 * avoiding the "listing has 9 items but only 5 appear in render" credibility gap.
 *
 *   1. sofa (skip if min sofa > budget; sofaOmittedForBudget flag signals warning)
 *   2. rug
 *   3. cushion covers (set 1)
 *   4. floor lamp
 *   5. coffee table, fallback to side table
 *   6. accent — pick the first that fits from: cushion covers #2, wall art, planter
 *
 * Each slot is cheapest-fit within its category. If a slot's category is empty
 * OR nothing fits remaining budget, that slot stays empty. Result is 0-6 items.
 */
export function selectProducts(style: Style, budgetINR: number): Selection {
  const byCategory = new Map<ShopCategory, ShopProduct[]>();
  for (const p of getProductsByStyle(style)) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  for (const list of byCategory.values()) list.sort((a, b) => a.priceINR - b.priceINR);

  const sofaPool = byCategory.get("sofa") ?? [];
  const minSofaPriceINR = sofaPool.length > 0 ? sofaPool[0].priceINR : 0;
  const sofaOmittedForBudget = minSofaPriceINR > budgetINR;

  let remaining = budgetINR;
  const picked: ShopProduct[] = [];
  const pickedIds = new Set<string>();

  /** Try the cheapest not-yet-picked item in cat that fits. Returns true on pick. */
  const tryPickFrom = (cat: ShopCategory): boolean => {
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

  /** First hit across a preference-ordered list of categories. */
  const tryPickFromAny = (cats: ShopCategory[]): boolean => {
    for (const c of cats) if (tryPickFrom(c)) return true;
    return false;
  };

  // Slot 1: sofa
  if (!sofaOmittedForBudget && picked.length < MAX_PRODUCTS) tryPickFrom("sofa");

  // Slot 2: rug
  if (picked.length < MAX_PRODUCTS) tryPickFrom("rug");

  // Slot 3: cushion covers (set 1)
  if (picked.length < MAX_PRODUCTS) tryPickFrom("cushion_cover");

  // Slot 4: floor lamp
  if (picked.length < MAX_PRODUCTS) tryPickFrom("floor_lamp");

  // Slot 5: coffee table, fallback to side table
  if (picked.length < MAX_PRODUCTS) tryPickFromAny(["coffee_table", "side_table"]);

  // Slot 6: accent — cushion covers #2, then wall art, then planter
  if (picked.length < MAX_PRODUCTS) tryPickFromAny(["cushion_cover", "wall_art", "planter"]);

  const totalPriceINR = picked.reduce((n, p) => n + p.priceINR, 0);
  return {
    products: picked,
    productIds: picked.map((p) => p.id),
    keywordInjection: buildKeywordInjection(picked.map((p) => p.visualKeyword)),
    totalPriceINR,
    sofaOmittedForBudget,
    minSofaPriceINR,
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
