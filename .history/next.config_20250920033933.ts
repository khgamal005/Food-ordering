import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  eslint: {
    // ⬅️ this skips ESLint during `next build`
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⬅️ optional: don’t block build if type errors exist
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

