import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flvwtyqlfisznivqvque.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Bypass Vercel's image-optimization endpoint. The Hobby plan caps
    // optimized images at ~1K/month and Modaco blew through it — /_next/image
    // started returning 402 Payment Required for ~90% of variants, leaving
    // most product/category images broken. With unoptimized:true the browser
    // fetches /images/* directly (which are 200 OK) and we pay zero
    // optimization quota. Trade-off: no automatic AVIF/WebP/srcSet from Next.
    // Permanent fix is either Vercel Pro (Yarin's call) or migrate to
    // Cloudflare R2/Bunny — see PLAN.md.
    unoptimized: true,
  },
};

export default nextConfig;
