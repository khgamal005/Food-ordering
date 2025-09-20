import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS domains
      },
    ],
    // Optional: Add these for better optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Add these for better Vercel compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Keep this false for production
  },
  // Enable SWC minification (default in Next.js 13+)
  swcMinify: true,
};

export default nextConfig;