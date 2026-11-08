import "server-only";

import { toChronicle, type Chronicle } from "@/lib/chronicle";
import { getPrisma } from "@/lib/prisma";
import { toKingTitle, type KingTitle } from "@/lib/king-display";
import { isValidSlug } from "@/lib/slug";

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

export async function getKingSlugs(): Promise<string[]> {
  const rows = await getPrisma().king.findMany({ select: { slug: true } });
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
