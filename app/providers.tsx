"use client";
import { useEffect, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { initPostHog } from "@/lib/posthog";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!));
  useEffect(() => {
    initPostHog();
  }, []);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
