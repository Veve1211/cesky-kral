import "server-only";
import { randomInt } from "node:crypto";

import { GOLDEN_DIFFICULTY, ROUND_PLAN, toDifficulty } from "@/lib/game-rules";
import { getPrisma } from "@/lib/prisma";
import { isValidSlug } from "@/lib/slug";
import type { QuizQuestion } from "@/lib/quiz-types";

// Fisher–Yates shuffle (returns a new array).
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Only public fields – `isCorrect` and `explanation` stay on the server.
const questionSelect = {
  id: true,
  text: true,
  difficulty: true,
  king: { select: { name: true, isLegend: true } },
  answers: { select: { id: true, text: true }, orderBy: { id: "asc" } },
} as const;

type QuestionRow = {
  id: number;
  text: string;
  difficulty: number;
  king: { name: string; isLegend: boolean };
  answers: { id: number; text: string }[];
};

function toQuizQuestion(row: QuestionRow): QuizQuestion {
  return {
    id: row.id,
    text: row.text,
    difficulty: toDifficulty(row.difficulty),
    kingName: row.king.name,
    isLegend: row.king.isLegend,
    answers: shuffle(row.answers),
  };
}

/**
 * One king round: picks questions by ROUND_PLAN (2 easy, 2 medium, 1 hard),
 * random within each level, ordered from easy to hard.
 */
export async function getKingQuestions(slug: string): Promise<QuizQuestion[]> {
  if (!isValidSlug(slug)) return [];
  const rows = await getPrisma().question.findMany({
    where: { king: { slug } },
    select: questionSelect,
  });

  return ROUND_PLAN.flatMap(({ difficulty, count }) =>
    shuffle(rows.filter((row) => toDifficulty(row.difficulty) === difficulty))
      .slice(0, count)
      .map(toQuizQuestion),
  );
}

/**
 * Golden round: every hard question (difficulty 3) of the king,
 * in random order.
 */
export async function getGoldenQuestions(slug: string): Promise<QuizQuestion[]> {
  if (!isValidSlug(slug)) return [];
  const rows = await getPrisma().question.findMany({
    where: { king: { slug }, difficulty: GOLDEN_DIFFICULTY },
    select: questionSelect,
  });
  return shuffle(rows).map(toQuizQuestion);
}

export async function getRandomQuestions(count: number): Promise<QuizQuestion[]> {
  const prisma = getPrisma();
  const ids = await prisma.question.findMany({ select: { id: true } });
  const picked = shuffle(ids.map((q) => q.id)).slice(0, count);

  const rows = await prisma.question.findMany({
    where: { id: { in: picked } },
    select: questionSelect,
  });
  // Random order of `picked`, then stable sort from easy to hard.
  const byId = new Map(rows.map((row) => [row.id, row]));
  return picked
    .map((id) => byId.get(id))
    .filter((row): row is QuestionRow => row !== undefined)
    .sort((a, b) => a.difficulty - b.difficulty)
    .map(toQuizQuestion);
}
