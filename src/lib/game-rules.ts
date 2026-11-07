// Game constants (see CLAUDE.md, section "Herní logika").
export const QUESTIONS_PER_KING = 5;
export const ANSWERS_PER_QUESTION = 3;
export const CORRECT_TO_COLLECT = 4;
export const QUICK_ROUND_QUESTIONS = 10;

// Rank names in ascending order.
export const RANKS = ["Panoš", "Rytíř", "Šlechtic", "Rádce krále"] as const;
export type Rank = (typeof RANKS)[number];

/**
 * Rank from the share of collected kings:
 * none → Panoš, under half → Rytíř, half or more → Šlechtic, all → Rádce krále.
 */
export function getRank(collected: number, total: number): Rank {
  if (collected <= 0 || total <= 0) return RANKS[0];
  if (collected >= total) return RANKS[3];
  return collected / total < 0.5 ? RANKS[1] : RANKS[2];
}
