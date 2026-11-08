import "server-only";

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
};

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
    },
  });
  return rows.map((row) => ({ ...row, title: toKingTitle(row.title) }));
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
    },
  });
  return row ? { ...row, title: toKingTitle(row.title) } : null;
}

export { kingInitial } from "@/lib/king-initial";
