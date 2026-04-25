"use client";
import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Props = { onUploaded: (storageId: Id<"_storage">) => void };

const MAX_BYTES = 8 * 1024 * 1024;
const MIN_DIM = 256;
const MAX_DIM = 4096;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

async function readImageDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read image dimensions."));
    };
    img.src = url;
  });
}

export default function PhotoUpload({ onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const validateUpload = useMutation(api.files.validateUpload);

  const handleFile = useCallback(
    async (file: File) => {
      setErr(null);

      // Client-side gates first — fail fast before consuming an upload slot.
      if (!ALLOWED_MIME.includes(file.type)) {
        setErr("Image must be JPEG, PNG, or WebP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setErr("Image must be 8MB or smaller.");
        return;
      }
      let dims: { w: number; h: number };
      try {
        dims = await readImageDimensions(file);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Couldn't read image.");
        return;
      }
      if (
        dims.w < MIN_DIM ||
        dims.h < MIN_DIM ||
        dims.w > MAX_DIM ||
        dims.h > MAX_DIM
      ) {
        setErr(
          `Image must be between ${MIN_DIM}×${MIN_DIM} and ${MAX_DIM}×${MAX_DIM}. Yours is ${dims.w}×${dims.h}.`,
        );
        return;
      }

      setPreview(URL.createObjectURL(file));
      setUploading(true);
      try {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("upload failed");
        const { storageId } = await res.json();
        // Server-side gate — independently verifies size + MIME from Convex storage
        // metadata. Deletes the blob if it fails.
        await validateUpload({ storageId: storageId as Id<"_storage"> });
        onUploaded(storageId as Id<"_storage">);
      } catch (e: unknown) {
        if (e instanceof ConvexError) {
          const data = (e as ConvexError<{ message?: string }>).data;
          if (data && typeof data === "object" && data.message) {
            setErr(data.message);
            return;
          }
        }
        setErr(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, validateUpload, onUploaded],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer bg-card transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-ink-soft hover:border-accent"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="your room" className="mx-auto max-h-64 rounded-xl" />
        ) : (
          <p className="text-ink-muted">Drop a photo here, or click to pick (max 8MB · JPEG / PNG / WebP)</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
      {uploading && <p className="text-sm text-ink-muted mt-3">Uploading…</p>}
      {err && <p className="text-sm text-accent mt-3">{err}</p>}
    </div>
  );
}
