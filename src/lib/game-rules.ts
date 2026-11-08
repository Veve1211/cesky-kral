// Game constants (see CLAUDE.md, section "Herní logika").
export const QUESTIONS_PER_KING = 5; // questions in one round

export type Difficulty = 1 | 2 | 3; // 1 easy, 2 medium, 3 hard

// One king round: 2 easy, 2 medium, 1 hard – in this order.
export const ROUND_PLAN: readonly { difficulty: Difficulty; count: number }[] = [
  { difficulty: 1, count: 2 },
  { difficulty: 2, count: 2 },
  { difficulty: 3, count: 1 },
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Lehká otázka",
  2: "Střední otázka",
  3: "Těžká otázka",
};

export function toDifficulty(value: number): Difficulty {
  return value === 3 ? 3 : value === 2 ? 2 : 1;
}
export const ANSWERS_PER_QUESTION = 3;
export const CORRECT_TO_COLLECT = 4;
export const QUICK_ROUND_QUESTIONS = 10;

// Rank names in ascending order.
export const RANKS = [
  "Panoš",
  "Rytíř",
  "Šlechtic",
  "Český král / Česká královna",
] as const;
export type Rank = (typeof RANKS)[number];

/**
 * Rank from the share of collected kings:
 * none → Panoš, under half → Rytíř, half or more → Šlechtic,
 * all → Český král / Česká královna.
 */
export function getRank(collected: number, total: number): Rank {
  if (collected <= 0 || total <= 0) return RANKS[0];
  if (collected >= total) return RANKS[3];
  return collected / total < 0.5 ? RANKS[1] : RANKS[2];
}
