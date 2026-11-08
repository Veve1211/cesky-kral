"use server";

import { getPrisma } from "@/lib/prisma";
import { isValidSlug } from "@/lib/slug";
import type { WhoFirstResult } from "@/lib/who-first";

/**
 * "Kdo vládl dřív?" – checks on the server which of the two kings started
 * to reign first (by `reignFrom`). Legends and kings without years are
 * not allowed.
 */
export async function checkWhoFirst(
  firstSlug: unknown,
  secondSlug: unknown,
  chosenSlug: unknown,
): Promise<WhoFirstResult> {
  if (
    !isValidSlug(firstSlug) ||
    !isValidSlug(secondSlug) ||
    !isValidSlug(chosenSlug) ||
    firstSlug === secondSlug ||
    (chosenSlug !== firstSlug && chosenSlug !== secondSlug)
  ) {
    return { ok: false, error: "Neplatná odpověď." };
  }

  const rows = await getPrisma().king.findMany({
    where: { slug: { in: [firstSlug, secondSlug] }, isLegend: false, reignFrom: { not: null } },
    select: { slug: true, reignFrom: true, reignTo: true },
  });
  if (rows.length !== 2) return { ok: false, error: "Panovník neexistuje." };

  const reigns = rows.map((row) => ({
    slug: row.slug,
    from: row.reignFrom as number, // filtered by the query above
    to: row.reignTo,
  }));
  const earliest = Math.min(...reigns.map((reign) => reign.from));
  const chosen = reigns.find((reign) => reign.slug === chosenSlug);
  const other = reigns.find((reign) => reign.slug !== chosenSlug);
  if (!chosen || !other) return { ok: false, error: "Neplatná odpověď." };

  return {
    ok: true,
    // A tie (same year) counts as correct for both.
    correct: chosen.from === earliest,
    earlierSlug: chosen.from <= other.from ? chosen.slug : other.slug,
    reigns,
  };
}
