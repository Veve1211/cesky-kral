import "server-only";

import { kings } from "../../prisma/seed-data";

// Page metadata for ruler pages comes from the seed (the same source the DB is filled from),
// so it is known at build time and rendered into <head> instead of being streamed into <body>.
// Only public fields leave this module – never questions or answers.

export type KingMeta = { slug: string; name: string; title: string };

export function kingMetaSlugs(): { slug: string }[] {
  return kings.map((king) => ({ slug: king.slug }));
}

export function getKingMeta(slug: string): KingMeta | null {
  const king = kings.find((k) => k.slug === slug);
  return king ? { slug: king.slug, name: king.name, title: king.title } : null;
}
