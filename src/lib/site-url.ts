// Absolute base URL of the site (Open Graph links, sitemap, robots.txt).
// Railway provides its public domain; production falls back to the known domain.
// Plain module (no "server-only"): next.config.ts uses it too.
export const PRODUCTION_DOMAIN = "cesky-kral.up.railway.app";

export function siteUrl(): URL {
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (domain && /^[a-z0-9.-]+$/i.test(domain)) return new URL(`https://${domain}`);
  if (process.env.NODE_ENV === "production") return new URL(`https://${PRODUCTION_DOMAIN}`);
  return new URL("http://localhost:3000");
}

/**
 * Only the live site may appear in search results. Staging (its own Railway domain) and
 * `next dev` answer with noindex, so they never compete with it. A production build without
 * RAILWAY_PUBLIC_DOMAIN (local, CI) counts as the live site, like siteUrl() above.
 * When a custom domain is added, update PRODUCTION_DOMAIN in the same change.
 */
export function isIndexable(): boolean {
  return siteUrl().hostname === PRODUCTION_DOMAIN;
}
