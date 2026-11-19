// Absolute base URL of the site (Open Graph links, sitemap, robots.txt).
// Railway provides its public domain; production falls back to the known domain.
const PRODUCTION_DOMAIN = "cesky-kral.up.railway.app";

export function siteUrl(): URL {
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (domain && /^[a-z0-9.-]+$/i.test(domain)) return new URL(`https://${domain}`);
  if (process.env.NODE_ENV === "production") return new URL(`https://${PRODUCTION_DOMAIN}`);
  return new URL("http://localhost:3000");
}
