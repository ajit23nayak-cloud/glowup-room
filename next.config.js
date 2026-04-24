/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "www.amazon.in" },
    ],
  },
};
module.exports = nextConfig;
