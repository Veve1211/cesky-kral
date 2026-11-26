import type { NextConfig } from "next";

import { indexNowKey } from "./src/lib/indexnow";
import { isIndexable } from "./src/lib/site-url";

// Railway serves both environments only over HTTPS and redirects HTTP with 301 (checked
// 25. 11. 2026), so HSTS is safe there. No includeSubDomains/preload: the parent domain
// belongs to Railway. Browsers ignore HSTS on http://localhost.
const HSTS = { key: "Strict-Transport-Security", value: "max-age=31536000" };
// Staging (see isIndexable): keep every response (pages, images, OG images) out of search results.
const NOINDEX = { key: "X-Robots-Tag", value: "noindex, nofollow" };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Defaults plus 320 and 480: king cards (~150–275 CSS px) on 1.75–3× screens
    // otherwise jump to 384 or 640 px images.
    imageSizes: [32, 48, 64, 96, 128, 256, 320, 384, 480],
  },
  async rewrites() {
    const key = indexNowKey();
    return isIndexable() && key
      ? [{ source: `/${key}.txt`, destination: "/api/indexnow-key" }]
      : [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
          },
          ...(process.env.NODE_ENV === "production" ? [HSTS] : []),
          ...(isIndexable() ? [] : [NOINDEX]),
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
