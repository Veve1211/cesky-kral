import "server-only";
import { randomInt } from "node:crypto";

import { pickDailyQuestions } from "@/lib/daily";
import { GOLDEN_DIFFICULTY, toDifficulty } from "@/lib/game-rules";
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
 * All questions of a king (without correctness) – the client picks the round
 * from them and prefers questions the player has not seen (`pickRound`).
 */
export async function getKingQuestionPool(slug: string): Promise<QuizQuestion[]> {
  if (!isValidSlug(slug)) return [];
  const rows = await getPrisma().question.findMany({
    where: { king: { slug } },
    select: questionSelect,
    orderBy: { id: "asc" },
  });
  return rows.map(toQuizQuestion);
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

// The question ids of a day never change while the server runs (the seed runs
// before `next start`), so they are picked once per day and remembered. Only
// the last few days are kept, so the map cannot grow.
const DAILY_CACHE_DAYS = 3;
const dailyIds = new Map<string, number[]>();

/**
 * Ids of "Denní výzva" questions of `dateKey`, in play order, the same for every
 * player (see `pickDailyQuestions`). Reads only the light columns of the pool,
 * and only once per day.
 */
export async function getDailyQuestionIds(dateKey: string): Promise<number[]> {
  const cached = dailyIds.get(dateKey);
  if (cached) return cached;
  const rows = await getPrisma().question.findMany({
    select: { id: true, text: true, difficulty: true, king: { select: { slug: true } } },
  });
  const pool = rows.map((row) => ({
    id: row.id,
    kingSlug: row.king.slug,
    text: row.text,
    difficulty: toDifficulty(row.difficulty),
  }));
  const ids = pickDailyQuestions(dateKey, pool).map(({ id }) => id);
  // An empty database (before the seed) is not remembered.
  if (ids.length > 0) {
    dailyIds.set(dateKey, ids);
    for (const key of [...dailyIds.keys()].slice(0, -DAILY_CACHE_DAYS)) dailyIds.delete(key);
  }
  return ids;
}

/**
 * "Denní výzva": the questions of `dateKey`, the same for every player.
 * Answers are shuffled as in every other mode.
 */
export async function getDailyQuestions(dateKey: string): Promise<QuizQuestion[]> {
  const ids = await getDailyQuestionIds(dateKey);
  const rows = await getPrisma().question.findMany({
    where: { id: { in: ids } },
    select: questionSelect,
  });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is QuestionRow => row !== undefined)
    .map(toQuizQuestion);
}
