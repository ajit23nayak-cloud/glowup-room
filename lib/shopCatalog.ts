import type { Style } from "./styles";

export type ShopCategory =
  | "cushion-covers"
  | "floor-lamp"
  | "rug"
  | "wall-art"
  | "side-table"
  | "planter";

export type ShopProduct = {
  title: string;
  priceInr: number;
  category: ShopCategory;
  categoryLabel: string;
  search: string; // query string for amazon.in/s?k=
};

const amazonUrl = (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;

export const SHOP_CATALOG: Record<Style, ShopProduct[]> = {
  "Minimalist Warm": [
    { category: "cushion-covers", categoryLabel: "Cushion covers", title: "Beige linen cushion covers, set of 2, 16×16", priceInr: 899, search: "beige linen cushion covers 16x16 set of 2" },
    { category: "floor-lamp",     categoryLabel: "Floor lamp",     title: "Brass arc floor lamp with linen shade",   priceInr: 3499, search: "brass arc floor lamp linen shade" },
    { category: "rug",            categoryLabel: "Rug",            title: "Cream wool shaggy rug, 5×7 feet",           priceInr: 4299, search: "cream wool shaggy rug 5x7" },
    { category: "wall-art",       categoryLabel: "Wall art",       title: "Large neutral abstract canvas, 36×24",      priceInr: 1899, search: "large neutral abstract canvas 36x24" },
    { category: "side-table",     categoryLabel: "Side table",     title: "Oak wood round side table",                 priceInr: 2699, search: "oak wood round side table" },
    { category: "planter",        categoryLabel: "Planter",        title: "Terracotta planter with saucer, 12 inch",   priceInr: 599,  search: "terracotta planter with saucer 12 inch" },
  ],
  "Boho India": [
    { category: "cushion-covers", categoryLabel: "Cushion covers", title: "Jaipur block-print velvet cushion covers, set of 4", priceInr: 1299, search: "jaipur block print velvet cushion covers set of 4" },
    { category: "floor-lamp",     categoryLabel: "Floor lamp",     title: "Hand-woven rattan pendant lamp, 14 inch",             priceInr: 1899, search: "rattan pendant lamp 14 inch hand woven" },
    { category: "rug",            categoryLabel: "Rug",            title: "Persian-style area rug, red & indigo, 5×7",            priceInr: 3999, search: "persian style area rug red indigo 5x7" },
    { category: "wall-art",       categoryLabel: "Wall art",       title: "Handcrafted brass peacock wall hanging",               priceInr: 2499, search: "brass peacock wall hanging handcrafted" },
    { category: "side-table",     categoryLabel: "Side table",     title: "Carved mango-wood Indo side table",                    priceInr: 3299, search: "carved mango wood indo side table" },
    { category: "planter",        categoryLabel: "Planter",        title: "Hand-painted ceramic planter, set of 2",               priceInr: 899,  search: "hand painted ceramic planter indoor set of 2" },
  ],
  "Indian Contemporary": [
    { category: "cushion-covers", categoryLabel: "Cushion covers", title: "Mustard & terracotta cushion covers, set of 4", priceInr: 1099, search: "mustard terracotta cushion covers set of 4" },
    { category: "floor-lamp",     categoryLabel: "Floor lamp",     title: "Brass tripod contemporary floor lamp",           priceInr: 3299, search: "brass tripod floor lamp contemporary" },
    { category: "rug",            categoryLabel: "Rug",            title: "Geometric wool rug, teal & mustard, 5×7",        priceInr: 4499, search: "geometric wool rug teal mustard 5x7" },
    { category: "wall-art",       categoryLabel: "Wall art",       title: "Framed Kutch embroidered wall hanging",          priceInr: 2799, search: "kutch embroidered wall hanging framed" },
    { category: "side-table",     categoryLabel: "Side table",     title: "Mango-wood side table with brass inlay",         priceInr: 3799, search: "mango wood side table brass inlay" },
    { category: "planter",        categoryLabel: "Planter",        title: "Large brass-finish monstera planter",            priceInr: 1299, search: "large brass finish monstera planter" },
  ],
  "Scandi-Warm Indian": [
    { category: "cushion-covers", categoryLabel: "Cushion covers", title: "Cream chunky-knit cushion covers, set of 2",    priceInr: 1199, search: "cream chunky knit cushion covers set of 2" },
    { category: "floor-lamp",     categoryLabel: "Floor lamp",     title: "Minimal scandi black teak floor lamp",           priceInr: 2899, search: "minimal scandi floor lamp black teak" },
    { category: "rug",            categoryLabel: "Rug",            title: "Cream wool rug with subtle Kutch pattern, 5×7",  priceInr: 4799, search: "cream wool rug kutch pattern 5x7" },
    { category: "wall-art",       categoryLabel: "Wall art",       title: "Indigo block-print framed wall art, 24×36",      priceInr: 1699, search: "indigo block print framed wall art 24x36" },
    { category: "side-table",     categoryLabel: "Side table",     title: "Teak wood side table with brass inlay",          priceInr: 3499, search: "teak wood side table brass inlay" },
    { category: "planter",        categoryLabel: "Planter",        title: "White ceramic planter with teak stand",          priceInr: 1099, search: "white ceramic planter teak wood stand" },
  ],
};

export function getProductUrl(p: ShopProduct): string {
  return amazonUrl(p.search);
}

export function getProductsForStyle(style: Style): ShopProduct[] {
  return SHOP_CATALOG[style] ?? [];
}
