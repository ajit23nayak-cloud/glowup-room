# GlowUp Room

Upload a photo of a room, pick a style and a budget, get an AI render of what it could look like, and a shareable link to the result.

## Flow

`/` landing, `/try` for the upload and style form, `/gallery/[id]` for the result.

Upload a room photo, choose style and budget, enter an email, the render runs, the gallery page updates when it lands.

## Stack

Next.js 14 App Router, React 18, TypeScript, Tailwind. Convex for database, file storage and the render action. Replicate (`adirik/interior-design`) does the generation. PostHog for analytics. Deployed on Vercel.

The render status uses a Convex reactive subscription, so the result page updates itself when generation finishes. No polling loop.

## Local setup

```bash
npm install
npx convex dev
npm run dev
```

You will need a Convex deployment and a Replicate API token in your environment.

## Status

MVP. Built in a single sprint to get the upload to render to share loop working end to end.

## Author

Ajit Nayak. [linkedin.com/in/ajit-nayak](https://linkedin.com/in/ajit-nayak)
