import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "GlowUp.room — DecorGPT for India. AI home styling, shoppable on Amazon.",
  description:
    "Upload a photo of your living room, pick a vibe, and get an AI makeover with décor you can actually buy from Amazon India — inside your budget.",
  openGraph: {
    title: "GlowUp.room — DecorGPT for India",
    description:
      "Upload a photo. Pick a vibe. Get an AI makeover + shoppable décor from Amazon India — inside your budget.",
    url: "https://glowup-room.vercel.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlowUp.room — DecorGPT for India",
    description:
      "Upload a photo. Pick a vibe. Get an AI makeover + shoppable décor from Amazon India — inside your budget.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
