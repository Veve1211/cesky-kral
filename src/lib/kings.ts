import "server-only";

import { getPrisma } from "@/lib/prisma";
import { isValidSlug } from "@/lib/slug";

export type KingSummary = {
  slug: string;
  name: string;
  reignFrom: number;
  reignTo: number;
  dynasty: string;
  imageUrl: string | null;
};

export async function getKings(): Promise<KingSummary[]> {
  return getPrisma().king.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      reignFrom: true,
      reignTo: true,
      dynasty: true,
      imageUrl: true,
    },
  });
}

export async function getKingSlugs(): Promise<string[]> {
  const rows = await getPrisma().king.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}

export async function getKingBySlug(slug: string) {
  // Reject anything that is not a well-formed slug before hitting the DB.
  if (!isValidSlug(slug)) return null;

  return getPrisma().king.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      reignFrom: true,
      reignTo: true,
      dynasty: true,
      shortBio: true,
      imageUrl: true,
    },
  });
}

export { kingInitial } from "@/lib/king-initial";
