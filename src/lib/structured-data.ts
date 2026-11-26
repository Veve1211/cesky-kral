import { siteUrl } from "@/lib/site-url";

export const SITE_NAME = "Český král";
export const SITE_DESCRIPTION =
  "Kvízová hra o českých panovnících pro žáky, učitele dějepisu i všechny, koho baví dějiny. Za správné odpovědi získáš sběratelské karty.";

/** Schema.org WebSite for the home page: only facts the page itself states. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl().href,
    inLanguage: "cs",
    description: SITE_DESCRIPTION,
  };
}

/** JSON for a <script type="application/ld+json">: `<` escaped so the text can never close the tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
