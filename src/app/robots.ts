import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // Staging stays crawlable on purpose: crawlers must fetch pages to see their noindex.
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: isIndexable() ? new URL("/sitemap.xml", siteUrl()).toString() : undefined,
  };
}
