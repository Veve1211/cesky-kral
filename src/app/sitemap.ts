import type { MetadataRoute } from "next";

import { kings } from "../../prisma/seed-data";
import { siteUrl } from "@/lib/site-url";

// Public pages only; the personal collection pages (/sbirka, /muj-erb) live in the player's browser.
const PAGES = [
  "/",
  "/jak-hrat",
  "/pro-ucitele",
  "/rychlovka",
  "/vyzva",
  "/reka-casu",
  "/kdo-driv",
  "/hod-gros",
  "/erb",
  "/zebricky",
  "/zdroje",
  "/soukromi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    ...PAGES.map((path) => ({ url: new URL(path, base).toString() })),
    ...kings.map((king) => ({ url: new URL(`/kral/${king.slug}`, base).toString() })),
  ];
}
