// Game constants (see CLAUDE.md, section "Herní logika").
export const QUESTIONS_PER_KING = 5; // questions in one round

export type Difficulty = 1 | 2 | 3; // 1 easy, 2 medium, 3 hard

// "Tři uzavřené kruhy" (three closed circles) – a question belongs to exactly one mode:
// - Hra o kartu: the ruler's easy and medium card questions,
// - Mistrovské kolo: the ruler's hard card questions (GOLDEN_DIFFICULTY),
// - Denní výzva: its own pool (Question.pool = "daily"), never shown elsewhere.
// Rychlovka mixes card questions of all rulers (never daily ones).
export type QuestionPool = "card" | "daily";

// One king round: 2 easy, 3 medium – in this order. No hard questions: those
// belong to the Mistrovské kolo only.
export const ROUND_PLAN: readonly { difficulty: Difficulty; count: number }[] = [
  { difficulty: 1, count: 2 },
  { difficulty: 2, count: 3 },
];
/** Difficulties of the card questions a king round draws from. */
export const ROUND_DIFFICULTIES: readonly Difficulty[] = ROUND_PLAN.map((step) => step.difficulty);

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Lehká otázka",
  2: "Střední otázka",
  3: "Těžká otázka",
};

export function toDifficulty(value: number): Difficulty {
  return value === 3 ? 3 : value === 2 ? 2 : 1;
}
// Golden round: all hard questions of a collected king, all must be correct.
export const GOLDEN_DIFFICULTY: Difficulty = 3;

export const ANSWERS_PER_QUESTION = 3;
export const CORRECT_TO_COLLECT = 4;
export const QUICK_ROUND_QUESTIONS = 10;

// Rank names in ascending order.
export const RANKS = [
  "Panoš",
  "Rytíř",
  "Šlechtic",
  "Pán / Paní erbovní knihy",
] as const;
export type Rank = (typeof RANKS)[number];

/**
 * Rank from the share of collected kings:
 * none → Panoš, under half → Rytíř, half or more → Šlechtic,
 * all → Pán / Paní erbovní knihy (renamed from "Český král", the name of the game).
 */
export function getRank(collected: number, total: number): Rank {
  if (collected <= 0 || total <= 0) return RANKS[0];
  if (collected >= total) return RANKS[3];
  return collected / total < 0.5 ? RANKS[1] : RANKS[2];
}
