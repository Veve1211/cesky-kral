// Game constants (see CLAUDE.md, section "Herní logika").
export const QUESTIONS_PER_KING = 5;
export const ANSWERS_PER_QUESTION = 3;
export const CORRECT_TO_COLLECT = 4;
export const QUICK_ROUND_QUESTIONS = 10;

// Rank names in ascending order. Thresholds will be decided later.
export const RANKS = ["Panoš", "Rytíř", "Šlechtic", "Rádce krále"] as const;
export type Rank = (typeof RANKS)[number];
