// "Začni hrát" / "Pokračuj" – where the main home button leads.
// Pure logic (no DB, no window), shared by the client and the tests.

export type StepKing = { slug: string; name: string };

export type NextStep =
  | { kind: "start"; href: string; label: "Začni hrát"; detail: string }
  | { kind: "continue"; href: string; label: "Pokračuj"; detail: string };

/**
 * - new player (empty collection): the first ruler in order
 * - returning player: the next ruler (in order) not collected yet
 * - everyone collected: the first ruler without a golden card (Mistrovské kolo)
 * - everything golden: Rychlovka
 * `kings` must be sorted by `order`. Returns null when there are no rulers.
 */
export function nextStep(
  kings: readonly StepKing[],
  collected: readonly string[],
  golden: readonly string[],
): NextStep | null {
  if (kings.length === 0) return null;
  const owned = new Set(collected);
  const ownedHere = kings.filter((king) => owned.has(king.slug));
  if (ownedHere.length === 0) {
    const first = kings[0];
    return { kind: "start", href: `/kral/${first.slug}`, label: "Začni hrát", detail: `První karta: ${first.name}` };
  }
  const missing = kings.find((king) => !owned.has(king.slug));
  if (missing) {
    return { kind: "continue", href: `/kral/${missing.slug}`, label: "Pokračuj", detail: `Další karta: ${missing.name}` };
  }
  const goldenSet = new Set(golden);
  const notGolden = kings.find((king) => !goldenSet.has(king.slug));
  if (notGolden) {
    return {
      kind: "continue",
      href: `/kral/${notGolden.slug}/zlate-kolo`,
      label: "Pokračuj",
      detail: `Mistrovské kolo: ${notGolden.name}`,
    };
  }
  return { kind: "continue", href: "/rychlovka", label: "Pokračuj", detail: "Rychlovka napříč všemi panovníky" };
}
