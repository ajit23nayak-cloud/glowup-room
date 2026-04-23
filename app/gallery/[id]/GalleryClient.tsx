"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShareButtons from "@/components/share/ShareButtons";
import ShopSection from "@/components/gallery/ShopSection";
import SaveBanner from "@/components/gallery/SaveBanner";
import { capture } from "@/lib/posthog";
import { STYLE_OPTIONS, type Style } from "@/lib/styles";
import { getProductsByIds, getProductsForStyle } from "@/lib/shopCatalog";

function isKnownStyle(s: string): s is Style {
  return (STYLE_OPTIONS as readonly string[]).includes(s);
}

export default function GalleryClient({ id }: { id: string }) {
  const render = useQuery(api.renders.getById, { id: id as Id<"renders"> });
  const retry = useAction(api.replicate.retryRender);
  const [retrying, setRetrying] = useState(false);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const firedRef = useRef(false);
  useEffect(() => {
    if (!render) return;
    capture("gallery_viewed", { status: render.status });
    if (render.status === "complete" && !firedRef.current) {
      firedRef.current = true;
      capture("render_generated", { style: render.style, budget: render.budget });
    }
  }, [render?.status, render?.style, render?.budget, render]);

  const products = useMemo(() => {
    if (!render || !isKnownStyle(render.style)) return [];
    if (render.selectedProductIds && render.selectedProductIds.length > 0) {
      return getProductsByIds(render.selectedProductIds);
    }
    // Fallback: older renders created before selection was persisted
    return getProductsForStyle(render.style);
  }, [render?.selectedProductIds, render?.style, render]);

  if (render === undefined) {
    return <main className="p-12 text-center text-ink-muted">Loading…</main>;
  }
  if (render === null) {
    return <main className="p-12 text-center">Render not found.</main>;
  }

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retry({ renderId: id as Id<"renders"> });
      firedRef.current = false;
    } finally {
      setRetrying(false);
    }
  };

  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <a href="/" className="text-sm text-ink-muted hover:text-accent">
        ← GlowUp.room
      </a>
      <h1 className="font-serif text-4xl mt-4 mb-2">{render.style}</h1>
      <p className="text-ink-muted mb-8">Budget: {render.budget}</p>

      {render.status === "complete" && render.afterImageUrl && render.beforeUrl ? (
        <>
          <BeforeAfterSlider
            beforeSrc={render.beforeUrl}
            afterSrc={render.afterImageUrl}
            className="mb-8"
          />
          {isKnownStyle(render.style) && (
            <ShopSection products={products} style={render.style} budget={render.budget} />
          )}
          <SaveBanner url={pageUrl} />
          <div className="mt-8">
            <ShareButtons url={pageUrl} style={render.style} />
          </div>
          <div className="text-center mt-12">
            <a
              href="/try"
              className="inline-block rounded-full bg-accent text-white font-semibold px-8 py-4"
            >
              Get your own glow-up
            </a>
          </div>
        </>
      ) : render.status === "failed" ? (
        <div className="text-center py-12">
          <p className="text-accent mb-2">Something went wrong generating your render.</p>
          {render.errorMessage && (
            <p className="text-sm text-ink-muted mb-6">{render.errorMessage}</p>
          )}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="rounded-full bg-accent text-white font-semibold px-6 py-3 disabled:opacity-50"
          >
            {retrying ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="animate-pulse text-ink-muted">
            {render.status === "pending"
              ? "Queued…"
              : "AI is styling your room (90–120s)…"}
          </div>
        </div>
      )}
    </main>
  );
}
