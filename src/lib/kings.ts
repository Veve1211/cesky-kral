import "server-only";

import { toChronicle, type Chronicle } from "@/lib/chronicle";
import { kingInitial } from "@/lib/king-initial";
import { getPrisma } from "@/lib/prisma";
import { toKingTitle, type KingTitle } from "@/lib/king-display";
import { isValidSlug } from "@/lib/slug";
import type { WhoFirstKing } from "@/lib/who-first";

export type KingSummary = {
  slug: string;
  name: string;
  reignFrom: number | null;
  reignTo: number | null;
  title: KingTitle;
  isLegend: boolean;
  dynasty: string;
  imageUrl: string | null;
  chronicle: Chronicle | null;
};

const chronicleSelect = {
  chronicleIntro: true,
  chronicleFacts: true,
  chronicleSources: true,
  chronicleSections: true,
} as const;

export async function getKings(): Promise<KingSummary[]> {
  const rows = await getPrisma().king.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      reignFrom: true,
      reignTo: true,
      title: true,
      isLegend: true,
      dynasty: true,
      imageUrl: true,
      ...chronicleSelect,
    },
  });
  return rows.map(
    ({ chronicleIntro, chronicleFacts, chronicleSources, chronicleSections, ...row }) => ({
      ...row,
      title: toKingTitle(row.title),
      chronicle: toChronicle({ chronicleIntro, chronicleFacts, chronicleSources, chronicleSections }),
    }),
  );
}

/** Lean query for the /kdo-driv page (no chronicle, no years). */
export async function getWhoFirstKings(): Promise<WhoFirstKing[]> {
  const rows = await getPrisma().king.findMany({
    where: { isLegend: false, reignFrom: { not: null } },
    orderBy: { order: "asc" },
    select: { slug: true, name: true, title: true, imageUrl: true },
  });
  return rows.map((row) => ({ ...row, title: toKingTitle(row.title) }));
}

/** All ruler slugs in game order (the "next card" after a round follows it). */
/**
 * Rulers in game order (= reign) for the Řeka času after a won card. The years are
 * shown only for collected rulers (like everywhere in the game, the page data is
 * not a secret – see docs/game-audit.md, point 14).
 */
export async function getKingCards(): Promise<
  { slug: string; name: string; initial: string; imageUrl: string | null; isLegend: boolean; reignFrom: number | null; reignTo: number | null }[]
> {
  const rows = await getPrisma().king.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, name: true, imageUrl: true, isLegend: true, reignFrom: true, reignTo: true },
  });
  return rows.map((row) => ({ ...row, initial: kingInitial(row.name) }));
}

export async function getKingSlugs(): Promise<string[]> {
  const rows = await getPrisma().king.findMany({ select: { slug: true }, orderBy: { order: "asc" } });
  return rows.map((row) => row.slug);
}

export async function getKingBySlug(slug: string) {
  // Reject anything that is not a well-formed slug before hitting the DB.
  if (!isValidSlug(slug)) return null;

  const row = await getPrisma().king.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      reignFrom: true,
      reignTo: true,
      title: true,
      isLegend: true,
      dynasty: true,
      shortBio: true,
      imageUrl: true,
      ...chronicleSelect,
    },
  });
  if (!row) return null;
  const { chronicleIntro, chronicleFacts, chronicleSources, chronicleSections, ...king } = row;
  return {
    ...king,
    title: toKingTitle(king.title),
    chronicle: toChronicle({ chronicleIntro, chronicleFacts, chronicleSources, chronicleSections }),
  };
}

export { kingInitial } from "@/lib/king-initial";
