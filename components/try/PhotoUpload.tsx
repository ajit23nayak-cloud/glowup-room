"use client";
import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Props = { onUploaded: (storageId: Id<"_storage">) => void };

const MAX_BYTES = 5 * 1024 * 1024;

export default function PhotoUpload({ onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFile = useCallback(
    async (file: File) => {
      setErr(null);
      if (!file.type.startsWith("image/")) {
        setErr("Please upload an image.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setErr("Max 5MB.");
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
        onUploaded(storageId as Id<"_storage">);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "upload failed");
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, onUploaded],
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
          <img src={preview} alt="your room" className="mx-auto max-h-64 rounded-xl" />
        ) : (
          <p className="text-ink-muted">Drop a photo here, or click to pick (max 5MB)</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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
