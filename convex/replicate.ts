"use node";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { selectProducts, parseBudget } from "../lib/selectProducts";
import type { Style } from "../lib/styles";

const MODEL_VERSION = "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38";

const PROMPT_PREFIX =
  "photorealistic interior photography, natural daylight, professional real estate listing photo, ultra-detailed, 4k, Indian home aesthetic, ";
const PROMPT_SUFFIX =
  ", shot on full-frame DSLR, shallow depth of field, realistic textures, no cartoon, no painted style";

const CORE_PROMPTS: Record<string, string> = {
  "Minimalist Warm":
    "A minimalist warm living room, soft white walls, light oak wood flooring, low-profile beige linen sofa, cream wool rug, single sculptural brass floor lamp, indoor palm plant in terracotta pot, large neutral canvas artwork, natural sunlight, calm uncluttered space, interior design magazine photography, 4k",
  "Boho India":
    "A boho Indian living room, jewel-toned walls in deep emerald, a low-slung fabric sofa in cream with jewel-tone velvet cushions, Jaipur block-print floor cushions, brass peacock wall art, hanging rattan pendant lamp, Persian rug in deep red and indigo, indoor money plant in hand-painted ceramic pot, warm tungsten lighting, rich textures, interior design magazine photography, 4k",
  "Indian Contemporary":
    "An Indian contemporary living room, warm off-white walls with one accent wall in deep teal, low wooden sofa with mustard and terracotta cushions, brass coffee table, large monstera plant, Kutch embroidered wall hanging, brass floor lamp, warm lighting, layered textiles, interior design magazine photography, 4k",
  "Scandi-Warm Indian":
    "A scandi-warm Indian living room, off-white walls, natural teak wood floor, light gray linen three-seater sofa, chunky cream knit throw, minimal wooden coffee table with brass inlay, single large monstera plant, warm cream wool rug with subtle Kutch pattern, linen curtains, soft natural light, neutral serene palette with one indigo accent cushion, interior design magazine photography, 4k",
};

const NEGATIVE_PROMPT =
  "cartoon, anime, painting, 3d render, unrealistic, distorted, oversaturated, fake-looking, people, watermark, text";

function buildPrompt(style: string, keywordInjection: string): string {
  const core = CORE_PROMPTS[style];
  if (!core) throw new Error(`unknown style: ${style}`);
  const featuring = keywordInjection ? `, featuring ${keywordInjection}` : "";
  return `${PROMPT_PREFIX}${core}${featuring}${PROMPT_SUFFIX}`;
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
    if (!CORE_PROMPTS[style]) throw new Error(`unknown style: ${style}`);

    // Read render to get budget for selection
    const render = await ctx.runQuery(api.renders.getById, { id: renderId });
    if (!render) throw new Error("render not found");

    const budgetINR = parseBudget(render.budget);
    const selection = selectProducts(style as Style, budgetINR);
    const prompt = buildPrompt(style, selection.keywordInjection);

    const prediction = await replicateFetch("/v1/predictions", {
      method: "POST",
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          image: beforeUrl,
          prompt,
          negative_prompt: NEGATIVE_PROMPT,
          guidance_scale: 18,
          num_inference_steps: 65,
          prompt_strength: 0.8,
        },
      }),
    });

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
    await ctx.runAction(api.replicate.startRender, {
      renderId,
      beforeStorageId: render.beforeStorageId,
      style: render.style,
    });
  },
});
