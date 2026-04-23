import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import GalleryClient from "./GalleryClient";

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  let render: Awaited<ReturnType<typeof fetchQuery<typeof api.renders.getById>>> | null = null;
  try {
    render = await fetchQuery(api.renders.getById, { id: params.id as Id<"renders"> });
  } catch {
    render = null;
  }
  const title = render ? `${render.style} glow-up — GlowUp.room` : "GlowUp.room";
  const description = render
    ? `AI-styled ${render.style} living room, on a ${render.budget} budget.`
    : "AI home styling for Indian apartments.";
  const image = render?.afterImageUrl || "https://glowup-room.vercel.app/after.png";
  const url = `https://glowup-room.vercel.app/gallery/${params.id}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [image], url },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function Page({ params }: Params) {
  return <GalleryClient id={params.id} />;
}
