import "server-only";
import { randomInt } from "node:crypto";

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
  king: { select: { name: true } },
  answers: { select: { id: true, text: true }, orderBy: { id: "asc" } },
} as const;

type QuestionRow = {
  id: number;
  text: string;
  king: { name: string };
  answers: { id: number; text: string }[];
};

function toQuizQuestion(row: QuestionRow): QuizQuestion {
  return {
    id: row.id,
    text: row.text,
    kingName: row.king.name,
    answers: shuffle(row.answers),
  };
}

export async function getKingQuestions(slug: string): Promise<QuizQuestion[]> {
  if (!isValidSlug(slug)) return [];
  const rows = await getPrisma().question.findMany({
    where: { king: { slug } },
    orderBy: { id: "asc" },
    select: questionSelect,
  });
  return rows.map(toQuizQuestion);
}

export async function getRandomQuestions(count: number): Promise<QuizQuestion[]> {
  const prisma = getPrisma();
  const ids = await prisma.question.findMany({ select: { id: true } });
  const picked = shuffle(ids.map((q) => q.id)).slice(0, count);

  const rows = await prisma.question.findMany({
    where: { id: { in: picked } },
    select: questionSelect,
  });
  // Keep the random order of `picked`.
  const byId = new Map(rows.map((row) => [row.id, row]));
  return picked
    .map((id) => byId.get(id))
    .filter((row): row is QuestionRow => row !== undefined)
    .map(toQuizQuestion);
}
