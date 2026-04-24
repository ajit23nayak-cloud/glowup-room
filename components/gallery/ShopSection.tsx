"use client";
import Image from "next/image";
import { Lamp, Sofa, Armchair, Palette, Package, Flower2, Square, Table2, Blinds, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { capture } from "@/lib/posthog";
import {
  getProductUrl,
  CATEGORY_LABELS,
  type ShopCategory,
  type ShopProduct,
} from "@/lib/shopCatalog";
import type { Style } from "@/lib/styles";

const ICON_FOR: Record<ShopCategory, LucideIcon> = {
  cushion_cover: Sofa,
  rug: Package,
  sofa: Sofa,
  armchair: Armchair,
  coffee_table: Table2,
  side_table: Square,
  floor_lamp: Lamp,
  wall_art: Palette,
  planter: Flower2,
  curtain_or_throw: Blinds,
};

const GRADIENTS = [
  "from-[#FAF4EA] to-[#FADDD0]",
  "from-[#FFF1EC] to-[#F7CDBE]",
  "from-[#FCECE8] to-[#F2C2B5]",
];

type Props = {
  products: ShopProduct[];
  style: Style;
  budget?: string;
  sofaOmittedForBudget?: boolean;
  minSofaPriceINR?: number;
  budgetINR?: number;
};

export default function ShopSection({
  products,
  style,
  budget,
  sofaOmittedForBudget,
  minSofaPriceINR,
  budgetINR,
}: Props) {
  if (products.length === 0 && !sofaOmittedForBudget) return null;

  const heading = budget
    ? `Shop the ${style} look at ${budget}`
    : `Shop the ${style} look`;
  const sub = "Real Amazon India products, handpicked to match this vibe. Live prices.";

  return (
    <section className="mt-14 mb-10">
      <h2 className="font-serif text-3xl text-center mb-2">{heading}</h2>
      <p className="text-center text-ink-muted text-[15px] mb-10 max-w-[560px] mx-auto">
        {sub}
      </p>
      {sofaOmittedForBudget && minSofaPriceINR ? (
        <SofaOmittedCard
          budget={budget}
          budgetINR={budgetINR}
          minSofaPriceINR={minSofaPriceINR}
          style={style}
        />
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductTile
            key={p.id}
            product={p}
            style={style}
            position={i}
            gradient={GRADIENTS[i % GRADIENTS.length]}
          />
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
  const href = product.productUrl ?? getProductUrl(product);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored"
      onClick={() =>
        capture("shop_link_clicked", {
          style,
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          position,
          has_image: !!product.imageUrl,
          has_asin: !!product.asin,
        })
      }
      className="group block overflow-hidden rounded-2xl border border-border bg-card hover:border-accent/40 hover:shadow-[0_8px_24px_rgba(26,26,26,0.08)] transition-all"
    >
      <div className="relative aspect-square bg-bg">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br ${gradient}`}
          >
            <Icon
              className="w-10 h-10 text-ink-dim/70 group-hover:text-accent transition-colors"
              strokeWidth={1.5}
            />
            <span className="text-[11px] uppercase tracking-[0.15em] text-ink-dim/70 font-medium">
              {CATEGORY_LABELS[product.category]}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[14px] leading-snug text-ink-dim mb-2 line-clamp-2">{product.name}</p>
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-serif text-lg text-ink">₹{product.priceINR.toLocaleString("en-IN")}</span>
          <span className="text-[11px] text-accent uppercase tracking-[0.12em] font-semibold">
            Shop →
          </span>
        </div>
        <p className="text-[11px] text-ink-muted">Click to see live Amazon price</p>
      </div>
    </a>
  );
}

function SofaOmittedCard({
  budget,
  budgetINR,
  minSofaPriceINR,
  style,
}: {
  budget?: string;
  budgetINR?: number;
  minSofaPriceINR: number;
  style: Style;
}) {
  const minK = Math.round(minSofaPriceINR / 1000);
  const gapRaw = budgetINR ? Math.max(0, minSofaPriceINR - budgetINR) : 0;
  const gapK = gapRaw > 0 ? Math.ceil(gapRaw / 1000) : 0;
  return (
    <div className="mb-8 rounded-2xl border border-accent/20 bg-accent/5 p-5 md:p-6 flex gap-4">
      <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={2} />
      <div className="text-[14px] leading-snug text-ink-dim">
        <p className="mb-1 text-ink font-semibold">
          Your {budget ?? `₹${budgetINR ?? "?"}`} budget doesn&apos;t cover a sofa in the{" "}
          {style} range (min ₹{minK}K).
        </p>
        <p>
          We styled around your existing sofa.
          {gapK > 0 ? ` Add ₹${gapK}K to unlock sofa options.` : ""}
        </p>
      </div>
    </div>
  );
}
