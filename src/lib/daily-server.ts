import "server-only";

import { evaluateAnswer, isId } from "@/lib/answer-check";
import { dailyDateKey, isDateKey } from "@/lib/daily";
import { parseCrest } from "@/lib/heraldry";
import type { BoardEntry, Standing } from "@/lib/leaderboard";
import type { PlayerRow } from "@/lib/player-server";
import { getPrisma } from "@/lib/prisma";
import { getDailyQuestions } from "@/lib/questions";
import type { AnswerResult } from "@/lib/quiz-types";

// "Denní výzva" scored by the server. The browser sends only which answer it
// picked; the server knows the questions of the day, their order, which
// answer is right, and the time. One attempt per player and day (DB unique).

export type DailyState = { answered: number; marks: boolean[]; finished: boolean };

function isToday(date: unknown): date is string {
  return isDateKey(date) && date === dailyDateKey();
}

async function questionIds(date: string): Promise<number[]> {
  return (await getDailyQuestions(date)).map((question) => question.id);
}

/**
 * Starts (or resumes) today's attempt. `offlineAnswered`: questions the
 * browser already answered before it had a server attempt – they count as
 * wrong (can only lower the score, never raise it).
 */
export async function startDaily(
  player: PlayerRow,
  date: unknown,
  offlineAnswered: unknown,
): Promise<{ ok: true; state: DailyState | null } | { ok: false; error: string }> {
  if (!isToday(date)) return { ok: false, error: "Tahle výzva už skončila. Načti stránku znovu." };
  const prisma = getPrisma();
  const existing = await prisma.dailyAttempt.findUnique({ where: { playerId_date: { playerId: player.id, date } } });
  if (existing) return { ok: true, state: toState(existing) };

  const total = (await questionIds(date)).length;
  const skipped =
    typeof offlineAnswered === "number" && Number.isSafeInteger(offlineAnswered)
      ? Math.max(0, Math.min(offlineAnswered, total))
      : 0;
  // Finished entirely before the server knew about it: not in today's leaderboard.
  if (total === 0 || skipped >= total) return { ok: true, state: null };
  try {
    const created = await prisma.dailyAttempt.create({
      data: { playerId: player.id, date, answered: skipped, marks: Array<boolean>(skipped).fill(false) },
    });
    return { ok: true, state: toState(created) };
  } catch {
    // Created meanwhile by a parallel request.
    const again = await prisma.dailyAttempt.findUnique({ where: { playerId_date: { playerId: player.id, date } } });
    return again ? { ok: true, state: toState(again) } : { ok: false, error: "Výzvu se nepodařilo spustit." };
  }
}

function toState(row: { answered: number; marks: boolean[]; finishedAt: Date | null }): DailyState {
  return { answered: row.answered, marks: row.marks, finished: row.finishedAt !== null };
}

/** Checks and records the answer to the next question of today's attempt. */
export async function answerDaily(
  player: PlayerRow,
  date: unknown,
  questionId: unknown,
  answerId: unknown,
): Promise<AnswerResult & { finished?: boolean }> {
  if (!isToday(date)) return { ok: false, error: "Tahle výzva už skončila. Načti stránku znovu." };
  if (!isId(questionId) || !isId(answerId)) return { ok: false, error: "Neplatná odpověď." };
  const prisma = getPrisma();
  const attempt = await prisma.dailyAttempt.findUnique({ where: { playerId_date: { playerId: player.id, date } } });
  if (!attempt) return { ok: false, error: "Výzva ještě nezačala." };
  if (attempt.finishedAt) return { ok: false, error: "Dnešní výzvu už máš dohranou." };

  const ids = await questionIds(date);
  // Only the next question in order – no skipping, no answering twice.
  if (ids[attempt.answered] !== questionId) return { ok: false, error: "Neplatná odpověď." };

  const result = await evaluateAnswer(questionId, answerId);
  if (!result.ok) return result;

  const finished = attempt.answered + 1 >= ids.length;
  const now = new Date();
  const updated = await prisma.dailyAttempt.updateMany({
    // Optimistic check: a parallel request for the same question loses.
    where: { id: attempt.id, answered: attempt.answered, finishedAt: null },
    data: {
      answered: { increment: 1 },
      marks: { push: result.correct },
      ...(result.correct ? { score: { increment: 1 } } : {}),
      ...(finished
        ? { finishedAt: now, durationMs: Math.min(now.getTime() - attempt.startedAt.getTime(), 2_147_483_647) }
        : {}),
    },
  });
  if (updated.count !== 1) return { ok: false, error: "Tahle odpověď už je započítaná." };
  return { ...result, finished };
}

const finishedRanked = (date: string) => ({ date, finishedAt: { not: null }, player: { nickname: { not: null } } });

/** Top of today's leaderboard: most correct answers, then the shortest time. */
export async function getDailyLeaderboard(date: string, limit = 10): Promise<{ entries: BoardEntry[]; total: number }> {
  const prisma = getPrisma();
  const [rows, total] = await Promise.all([
    prisma.dailyAttempt.findMany({
      where: finishedRanked(date),
      orderBy: [{ score: "desc" }, { durationMs: "asc" }, { finishedAt: "asc" }],
      take: limit,
      select: { score: true, durationMs: true, player: { select: { nickname: true, crest: true } } },
    }),
    prisma.dailyAttempt.count({ where: finishedRanked(date) }),
  ]);
  return {
    total,
    entries: rows.map((row, i) => ({
      rank: i + 1,
      nickname: row.player.nickname ?? "",
      score: row.score,
      durationMs: row.durationMs,
      crest: parseCrest(row.player.crest),
    })),
  };
}

/** The player's place today (or where they would be without a nickname). */
export async function getDailyStanding(player: PlayerRow, date: unknown): Promise<Standing | null> {
  if (!isDateKey(date)) return null;
  const prisma = getPrisma();
  const mine = await prisma.dailyAttempt.findUnique({ where: { playerId_date: { playerId: player.id, date } } });
  if (!mine?.finishedAt || mine.durationMs === null) return null;

  const better = {
    ...finishedRanked(date),
    playerId: { not: player.id },
    OR: [
      { score: { gt: mine.score } },
      { score: mine.score, durationMs: { lt: mine.durationMs } },
      { score: mine.score, durationMs: mine.durationMs, finishedAt: { lt: mine.finishedAt } },
    ],
  };
  const [betterCount, total, above] = await Promise.all([
    prisma.dailyAttempt.count({ where: better }),
    prisma.dailyAttempt.count({ where: finishedRanked(date) }),
    prisma.dailyAttempt.findFirst({
      where: better,
      orderBy: [{ score: "asc" }, { durationMs: "desc" }, { finishedAt: "desc" }],
      select: { score: true, durationMs: true },
    }),
  ]);
  const ranked = player.nickname !== null;
  return {
    rank: betterCount + 1,
    total: ranked ? total : total + 1,
    score: mine.score,
    durationMs: mine.durationMs,
    ranked,
    above,
  };
}
