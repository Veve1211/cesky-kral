// Picks one king round from the ruler's whole question pool (pure, shared by the
// client and the tests). Per difficulty of ROUND_PLAN (2 easy, 2 medium, 1 hard):
// unseen questions first, then the ones seen longest ago; random among equals.
import { ROUND_PLAN } from "@/lib/game-rules";
import type { QuizQuestion } from "@/lib/quiz-types";

export function pickRound(
  pool: readonly QuizQuestion[],
  seen: readonly number[],
  random: () => number = Math.random,
): QuizQuestion[] {
  // Unseen = -1, seen = position in the list (0 = seen longest ago).
  const rank = new Map(seen.map((id, index) => [id, index]));
  const rankOf = (question: QuizQuestion) => rank.get(question.id) ?? -1;

  return ROUND_PLAN.flatMap(({ difficulty, count }) =>
    pool
      .filter((question) => question.difficulty === difficulty)
      .map((question) => ({ question, tie: random() }))
      .sort((a, b) => rankOf(a.question) - rankOf(b.question) || a.tie - b.tie)
      .slice(0, count)
      .map(({ question }) => question),
  );
}
