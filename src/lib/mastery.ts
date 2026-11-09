// "Koruny učenosti" – knowledge crowns per ruler. Shared by server, client and tests.
//
// Every distinct question of a ruler answered correctly (in any quiz mode)
// counts once. Thresholds scale with the ruler's number of questions, so new
// rulers with a different count work too: 1/3 → bronze, 2/3 → silver, all → gold
// (3, 6 and 9 for nine questions).
//
// Named "koruna učenosti" so it is never mixed up with the existing "zlaté
// kolo" / "zlatá karta" (the golden round).

export type Tier = 0 | 1 | 2 | 3; // 0 = none, 1 bronze, 2 silver, 3 gold

export const TIER_KEYS = { 1: "bronze", 2: "silver", 3: "gold" } as const;
export type TierKey = (typeof TIER_KEYS)[1 | 2 | 3];

export const TIER_NAMES: Record<1 | 2 | 3, string> = {
  1: "Bronzová koruna učenosti",
  2: "Stříbrná koruna učenosti",
  3: "Zlatá koruna učenosti",
};

/** Short form for crowns in the collection ("bronzová koruna"). */
export const TIER_SHORT: Record<1 | 2 | 3, string> = {
  1: "bronzová koruna",
  2: "stříbrná koruna",
  3: "zlatá koruna",
};

/** One sentence in the style of a chronicle – no historical claims. */
export const TIER_LINES: Record<1 | 2 | 3, string> = {
  1: "Kronikář namočil brk a zapsal: tento panovník má nového znalce.",
  2: "O tvém vědění se už šeptá na hradech i v podhradí. Kronikář přidal stříbrnou iniciálu.",
  3: "Zlatým inkoustem zapsáno navěky: o tomto panovníkovi víš vše, co kronika zná.",
};

/** Correct answers needed for each tier with `total` questions. */
export function tierThresholds(total: number): [number, number, number] {
  const t = Math.max(1, Math.floor(total));
  return [Math.ceil(t / 3), Math.ceil((2 * t) / 3), t];
}

export function tierFor(known: number, total: number): Tier {
  if (!Number.isFinite(total) || total < 1) return 0;
  const [bronze, silver, gold] = tierThresholds(total);
  if (known >= gold) return 3;
  if (known >= silver) return 2;
  if (known >= bronze) return 1;
  return 0;
}

/** FNV-1a with a given offset basis – small, stable, no crypto needed. */
function fnv(text: string, basis: number): number {
  let h = basis >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Stable id of a question across deployments (database ids change with every
 * seed): two 32-bit hashes of ruler slug + question text, base 36.
 */
export function questionKey(kingSlug: string, text: string): string {
  const source = `${kingSlug}\n${text.trim()}`;
  return fnv(source, 0x811c9dc5).toString(36) + fnv(source, 0x01234567).toString(36);
}

export const QUESTION_KEY_PATTERN = /^[a-z0-9]{2,16}$/;
