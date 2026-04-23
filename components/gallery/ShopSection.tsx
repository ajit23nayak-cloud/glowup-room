"use client";
import { Lamp, Sofa, Armchair, Palette, Package, Flower2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { capture } from "@/lib/posthog";
import {
  getProductsForStyle,
  getProductUrl,
  type ShopCategory,
  type ShopProduct,
} from "@/lib/shopCatalog";
import type { Style } from "@/lib/styles";

const ICON_FOR: Record<ShopCategory, LucideIcon> = {
  "cushion-covers": Sofa,
  "floor-lamp": Lamp,
  rug: Package,
  "wall-art": Palette,
  "side-table": Armchair,
  planter: Flower2,
};

// Three warm gradients cycled across tiles so they feel cohesive but not monotonous.
const GRADIENTS = [
  "from-[#FAF4EA] to-[#FADDD0]", // ivory → peach-terracotta
  "from-[#FFF1EC] to-[#F7CDBE]", // warm cream → muted terracotta
  "from-[#FCECE8] to-[#F2C2B5]", // pale rose → warm clay
];

export default function ShopSection({ style }: { style: Style }) {
  const products = getProductsForStyle(style);
  if (products.length === 0) return null;

  return (
    <section className="mt-16 mb-10">
      <h2 className="font-serif text-3xl text-center mb-2">
        Get the look — shop the essentials
      </h2>
      <p className="text-center text-ink-muted text-[15px] mb-10 max-w-[560px] mx-auto">
        Curated Amazon.in picks that match your {style.toLowerCase()} glow-up. All tested and shipped
        in India.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductTile key={p.category} product={p} style={style} position={i} gradient={GRADIENTS[i % GRADIENTS.length]} />
        ))}
      </div>
    </section>
  );
}

function ProductTile({
  product,
  style,
  position,
  gradient,
}: {
  product: ShopProduct;
  style: Style;
  position: number;
  gradient: string;
}) {
  const Icon = ICON_FOR[product.category];
  const href = getProductUrl(product);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored"
      onClick={() =>
        capture("shop_link_clicked", {
          style,
          product_name: product.title,
          category: product.category,
          position,
        })
      }
      className="group block overflow-hidden rounded-2xl border border-border bg-card hover:border-accent/40 hover:shadow-[0_8px_24px_rgba(26,26,26,0.08)] transition-all"
    >
      <div
        className={`relative h-40 flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${gradient}`}
      >
        <Icon className="w-10 h-10 text-ink-dim/70 group-hover:text-accent transition-colors" strokeWidth={1.5} />
        <span className="text-[11px] uppercase tracking-[0.15em] text-ink-dim/70 font-medium">
          {product.categoryLabel}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[14px] leading-snug text-ink-dim mb-2 line-clamp-2">{product.title}</p>
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-lg text-ink">₹{product.priceInr.toLocaleString("en-IN")}</span>
          <span className="text-[11px] text-accent uppercase tracking-[0.12em] font-semibold">
            Shop →
          </span>
        </div>
      </div>
    </a>
  );
}
