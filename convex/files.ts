import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => await ctx.storage.getUrl(storageId),
});

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Server-side guard run by the client immediately after upload, before render
 * creation. Reads file metadata from Convex storage. If the file violates size
 * or MIME constraints, the storage object is deleted and the call throws.
 *
 * Dimensions are NOT checked here (Convex doesn't expose image dimensions);
 * the client validates dimensions before upload.
 */
export const validateUpload = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const meta = await ctx.db.system.get(storageId);
    if (!meta) {
      throw new ConvexError({
        code: "upload_missing",
        message: "We couldn't find your upload — try again.",
      });
    }
    if (meta.size > MAX_BYTES) {
      await ctx.storage.delete(storageId);
      throw new ConvexError({
        code: "upload_too_large",
        message: "Image must be 8MB or smaller.",
      });
    }
    if (!ALLOWED_MIME.has(meta.contentType ?? "")) {
      await ctx.storage.delete(storageId);
      throw new ConvexError({
        code: "upload_bad_mime",
        message: "Image must be JPEG, PNG, or WebP.",
      });
    }
    return { ok: true, size: meta.size, contentType: meta.contentType };
  },
});
