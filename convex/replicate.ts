"use node";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { selectProducts, parseBudget } from "../lib/selectProducts";
import type { Style } from "../lib/styles";

const MAX_FAILED_RETRIES = 3;

// Flux Kontext Pro is an official Replicate model — no version hash needed,
// POST to the model-scoped predictions endpoint.
const MODEL_OWNER = "black-forest-labs";
const MODEL_NAME = "flux-kontext-pro";

// Per-style natural-language label that reads cleanly inside the prompt sentence.
const STYLE_LABEL: Record<string, string> = {
  "Minimalist Warm": "minimalist warm Indian",
  "Boho India": "boho Indian",
  "Indian Contemporary": "contemporary Indian",
  "Scandi-Warm Indian": "Scandi-warm Indian",
};

function joinProse(items: string[]): string {
  const clean = items.filter((s) => s && s.trim().length > 0);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

// Cap the injected keywords at the top-5 highest-priority items — budget order
// already yields sofa/rug/2x cushions/lamp first (highest visual impact), with
// tail items (side tables, curtains, wall art) dropped to keep prompt tight and
// reduce hallucination.
const MAX_KEYWORDS_INJECTED = 5;

const PRESERVE_CLAUSE =
  "Preserve the exact walls, windows, doors, and architectural layout of this room. " +
  "Only replace or add furniture, rugs, cushions, lamps, and decor items. " +
  "Do not invent new windows, walls, or structural features.";

function buildPrompt(style: string, visualKeywords: string[]): string {
  const label = STYLE_LABEL[style];
  if (!label) throw new Error(`unknown style: ${style}`);
  const top = visualKeywords.slice(0, MAX_KEYWORDS_INJECTED);
  const prose = joinProse(top);
  const features = prose ? ` The space features ${prose}.` : "";
  return `${PRESERVE_CLAUSE} Redecorate this room in ${label} style.${features} Natural daylight, photorealistic, shot on full-frame DSLR.`;
}

async function replicateFetch(path: string, init: RequestInit = {}) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN not set on Convex");
  const res = await fetch(`https://api.replicate.com${path}`, {
    ...init,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Replicate ${path} → ${res.status} ${body}`);
  }
  return res.json();
}

export const startRender = action({
  args: {
    renderId: v.id("renders"),
    beforeStorageId: v.id("_storage"),
    style: v.string(),
  },
  handler: async (ctx, { renderId, beforeStorageId, style }): Promise<void> => {
    const beforeUrl = await ctx.storage.getUrl(beforeStorageId);
    if (!beforeUrl) throw new Error("before image URL unavailable");
    if (!STYLE_LABEL[style]) throw new Error(`unknown style: ${style}`);

    // Pull budget from the render row for product selection
    const render = await ctx.runQuery(api.renders.getById, { id: renderId });
    if (!render) throw new Error("render not found");

    const budgetINR = parseBudget(render.budget);
    const selection = selectProducts(style as Style, budgetINR);
    const visualKeywords = selection.products.map((p) => p.visualKeyword);
    const prompt = buildPrompt(style, visualKeywords);

    const prediction = await replicateFetch(
      `/v1/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`,
      {
        method: "POST",
        body: JSON.stringify({
          input: {
            prompt,
            input_image: beforeUrl,
            aspect_ratio: "match_input_image",
            output_format: "jpg",
            safety_tolerance: 2,
          },
        }),
      },
    );

    await ctx.runMutation(internal.renders.setStatus, {
      id: renderId,
      status: "processing",
      replicatePredictionId: prediction.id,
      selectedProductIds: selection.productIds,
      finalPrompt: prompt,
      sofaOmittedForBudget: selection.sofaOmittedForBudget,
      minSofaPriceINR: selection.minSofaPriceINR,
    });

    await ctx.scheduler.runAfter(3_000, internal.replicate.pollPrediction, {
      renderId,
      predictionId: prediction.id,
      attempt: 0,
    });
  },
});

export const pollPrediction = internalAction({
  args: {
    renderId: v.id("renders"),
    predictionId: v.string(),
    attempt: v.number(),
  },
  handler: async (ctx, { renderId, predictionId, attempt }): Promise<void> => {
    if (attempt > 60) {
      await ctx.runMutation(internal.renders.setStatus, {
        id: renderId,
        status: "failed",
        errorMessage: "timeout after 3 minutes",
      });
      return;
    }
    const p = await replicateFetch(`/v1/predictions/${predictionId}`);
    if (p.status === "succeeded") {
      const afterUrl = Array.isArray(p.output) ? p.output[0] : p.output;
      await ctx.runMutation(internal.renders.setStatus, {
        id: renderId,
        status: "complete",
        afterImageUrl: afterUrl,
      });
      return;
    }
    if (p.status === "failed" || p.status === "canceled") {
      await ctx.runMutation(internal.renders.setStatus, {
        id: renderId,
        status: "failed",
        errorMessage: p.error || p.status,
      });
      return;
    }
    await ctx.scheduler.runAfter(3_000, internal.replicate.pollPrediction, {
      renderId,
      predictionId,
      attempt: attempt + 1,
    });
  },
});

export const retryRender = action({
  args: { renderId: v.id("renders") },
  handler: async (ctx, { renderId }): Promise<void> => {
    const render = await ctx.runQuery(api.renders.getById, { id: renderId });
    if (!render) throw new Error("render not found");
    if ((render.failedRenderAttempts ?? 0) >= MAX_FAILED_RETRIES) {
      throw new ConvexError({
        code: "retry_cap_reached",
        message: "Too many failed attempts on this account. Please contact support.",
      });
    }
    await ctx.runAction(api.replicate.startRender, {
      renderId,
      beforeStorageId: render.beforeStorageId,
      style: render.style,
    });
  },
});
