import "server-only";
import { randomBytes, randomInt } from "node:crypto";

import { evaluateAnswer, isId } from "@/lib/answer-check";
import { dailyDateKey, pragueDayStart, weekStartKey } from "@/lib/daily";
import { QUICK_ROUND_QUESTIONS } from "@/lib/game-rules";
import {
  isChronological,
  TIMELINE_SIZE,
  type BestResult,
  type GameMode,
  type GameRuler,
  type Period,
  type Reign,
} from "@/lib/games";
import { parseCrest } from "@/lib/heraldry";
import type { BoardEntry } from "@/lib/leaderboard";
import type { PlayerRow } from "@/lib/player-server";
import { getPrisma } from "@/lib/prisma";
import { getRandomQuestions } from "@/lib/questions";
import type { AnswerResult, QuizQuestion } from "@/lib/quiz-types";
import { isValidSlug } from "@/lib/slug";

// Rychlovka, "Kdo vládl dřív?" and "Řeka času" scored on the server. The
// server decides what is asked (questions, pairs, rulers), keeps it in the
// session and checks every answer itself; the browser never sends a score.

type Ruler = GameRuler & { from: number; to: number | null };

/** Rulers with a known start of reign (no legends), years included – server only. */
async function datedRulers(): Promise<Ruler[]> {
  const rows = await getPrisma().king.findMany({
    where: { isLegend: false, reignFrom: { not: null } },
    orderBy: { order: "asc" },
    select: { slug: true, name: true, title: true, imageUrl: true, reignFrom: true, reignTo: true },
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    title: row.title,
    imageUrl: row.imageUrl,
    from: row.reignFrom as number,
    to: row.reignTo,
  }));
}

const publicRuler = ({ slug, name, title, imageUrl }: Ruler): GameRuler => ({ slug, name, title, imageUrl });
const reignOf = ({ slug, from, to }: Ruler): Reign => ({ slug, from, to });

/** `count` different random items, not exactly the same set as `previous`. */
function pickSlugs(all: readonly string[], count: number, previous: readonly string[] = []): string[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const pool = [...all];
    const picked: string[] = [];
    while (picked.length < count && pool.length > 0) picked.push(pool.splice(randomInt(pool.length), 1)[0]);
    const same = previous.length === picked.length && picked.every((slug) => previous.includes(slug));
    if (!same || all.length <= count) return picked;
  }
  return all.slice(0, count);
}

type QuickState = { questionIds: number[] };
type SlugsState = { slugs: string[] };

export type StartResult =
  | { mode: "quick"; sessionId: string; questions: QuizQuestion[] }
  | { mode: "who-first" | "timeline"; sessionId: string; rulers: GameRuler[]; slugs: string[] };

export async function startGame(player: PlayerRow, mode: GameMode): Promise<StartResult | null> {
  const prisma = getPrisma();
  const sessionId = randomBytes(16).toString("base64url");
  if (mode === "quick") {
    const questions = await getRandomQuestions(QUICK_ROUND_QUESTIONS);
    if (questions.length === 0) return null;
    const state: QuickState = { questionIds: questions.map((q) => q.id) };
    await prisma.gameSession.create({ data: { publicId: sessionId, playerId: player.id, mode, state } });
    return { mode, sessionId, questions };
  }
  const rulers = await datedRulers();
  const size = mode === "who-first" ? 2 : TIMELINE_SIZE;
  if (rulers.length < size) return null;
  const slugs = pickSlugs(rulers.map((r) => r.slug), size);
  const state: SlugsState = { slugs };
  await prisma.gameSession.create({ data: { publicId: sessionId, playerId: player.id, mode, state } });
  return { mode, sessionId, rulers: rulers.map(publicRuler), slugs };
}

async function findSession(player: PlayerRow, sessionId: unknown, mode: GameMode) {
  if (typeof sessionId !== "string" || !/^[A-Za-z0-9_-]{22}$/.test(sessionId)) return null;
  const session = await getPrisma().gameSession.findUnique({ where: { publicId: sessionId } });
  return session && session.playerId === player.id && session.mode === mode ? session : null;
}

type Session = NonNullable<Awaited<ReturnType<typeof findSession>>>;

/**
 * Saves one answer atomically: only if nobody saved this step meanwhile
 * (double click, replayed request). Returns false when it was too late.
 */
async function saveStep(session: Session, correct: boolean, finished: boolean, state?: object): Promise<boolean> {
  const now = new Date();
  const updated = await getPrisma().gameSession.updateMany({
    where: { id: session.id, answered: session.answered, finishedAt: null },
    data: {
      answered: { increment: 1 },
      ...(correct ? { score: { increment: 1 } } : {}),
      ...(state ? { state } : {}),
      ...(finished
        ? { finishedAt: now, durationMs: Math.min(now.getTime() - session.startedAt.getTime(), 2_147_483_647) }
        : {}),
    },
  });
  return updated.count === 1;
}

export type Finish = { score: number; best: BestResult | null; newRecord: boolean };

/** The player's best finished game in `mode` before this one, and whether this one beats it. */
async function finishInfo(player: PlayerRow, mode: GameMode, sessionDbId: number): Promise<Finish> {
  const prisma = getPrisma();
  const [mine, bestBefore] = await Promise.all([
    prisma.gameSession.findUnique({ where: { id: sessionDbId }, select: { score: true, durationMs: true } }),
    prisma.gameSession.findFirst({
      where: { playerId: player.id, mode, finishedAt: { not: null }, id: { not: sessionDbId } },
      orderBy: [{ score: "desc" }, { durationMs: "asc" }],
      select: { score: true, durationMs: true },
    }),
  ]);
  const score = mine?.score ?? 0;
  const better =
    !bestBefore ||
    score > bestBefore.score ||
    (mode === "quick" && score === bestBefore.score && (mine?.durationMs ?? Infinity) < (bestBefore.durationMs ?? Infinity));
  const best = better && mine ? mine : bestBefore;
  return { score, best, newRecord: better && score > 0 };
}

const GONE = { ok: false, error: "Hra už skončila nebo neexistuje. Začni novou." } as const;
const TOO_LATE = { ok: false, error: "Tahle odpověď už je započítaná." } as const;

/** Rychlovka: checks the next question in order. */
export async function answerQuick(
  player: PlayerRow,
  sessionId: unknown,
  questionId: unknown,
  answerId: unknown,
): Promise<AnswerResult & { finish?: Finish }> {
  if (!isId(questionId) || !isId(answerId)) return { ok: false, error: "Neplatná odpověď." };
  const session = await findSession(player, sessionId, "quick");
  if (!session || session.finishedAt) return GONE;
  const { questionIds } = session.state as QuickState;
  if (!Array.isArray(questionIds) || questionIds[session.answered] !== questionId) return { ok: false, error: "Neplatná odpověď." };
  const result = await evaluateAnswer(questionId, answerId);
  if (!result.ok) return result;
  const finished = session.answered + 1 >= questionIds.length;
  if (!(await saveStep(session, result.correct, finished))) return TOO_LATE;
  return finished ? { ...result, finish: await finishInfo(player, "quick", session.id) } : result;
}

export type DuelAnswer =
  | {
      ok: true;
      correct: boolean;
      earlierSlug: string;
      reigns: Reign[];
      /** The next pair (after a right pick) – the game goes on. */
      next: string[] | null;
      finish: Finish | null;
    }
  | { ok: false; error: string };

/** "Kdo vládl dřív?": the pick must be one of the two rulers the server offered. */
export async function answerWhoFirst(player: PlayerRow, sessionId: unknown, choice: unknown): Promise<DuelAnswer> {
  if (!isValidSlug(choice)) return { ok: false, error: "Neplatná odpověď." };
  const session = await findSession(player, sessionId, "who-first");
  if (!session || session.finishedAt) return GONE;
  const { slugs } = session.state as SlugsState;
  if (!Array.isArray(slugs) || !slugs.includes(choice)) return { ok: false, error: "Neplatná odpověď." };
  const rulers = await datedRulers();
  const pair = slugs.map((slug) => rulers.find((r) => r.slug === slug)).filter((r): r is Ruler => r !== undefined);
  if (pair.length !== 2) return GONE;
  const chosen = pair.find((r) => r.slug === choice)!;
  const other = pair.find((r) => r.slug !== choice)!;
  const correct = chosen.from <= other.from; // a tie counts for both
  const next = correct ? pickSlugs(rulers.map((r) => r.slug), 2, slugs) : null;
  if (!(await saveStep(session, correct, !correct, next ? { slugs: next } : undefined))) return TOO_LATE;
  return {
    ok: true,
    correct,
    earlierSlug: chosen.from <= other.from ? chosen.slug : other.slug,
    reigns: pair.map(reignOf),
    next,
    finish: correct ? null : await finishInfo(player, "who-first", session.id),
  };
}

export type TimelineAnswer =
  | { ok: true; correct: boolean; reigns: Reign[]; next: string[] | null; finish: Finish | null }
  | { ok: false; error: string };

/** "Řeka času": the order must be exactly the offered rulers, earliest first. */
export async function answerTimeline(player: PlayerRow, sessionId: unknown, order: unknown): Promise<TimelineAnswer> {
  const session = await findSession(player, sessionId, "timeline");
  if (!session || session.finishedAt) return GONE;
  const { slugs } = session.state as SlugsState;
  if (
    !Array.isArray(order) ||
    !Array.isArray(slugs) ||
    order.length !== slugs.length ||
    !order.every(isValidSlug) ||
    new Set(order).size !== order.length ||
    !order.every((slug) => slugs.includes(slug))
  ) {
    return { ok: false, error: "Neplatná odpověď." };
  }
  const rulers = await datedRulers();
  const reigns = slugs
    .map((slug) => rulers.find((r) => r.slug === slug))
    .filter((r): r is Ruler => r !== undefined)
    .map(reignOf)
    .sort((a, b) => a.from - b.from);
  if (reigns.length !== slugs.length) return GONE;
  const correct = isChronological(order as string[], reigns);
  const next = correct ? pickSlugs(rulers.map((r) => r.slug), TIMELINE_SIZE, slugs) : null;
  if (!(await saveStep(session, correct, !correct, next ? { slugs: next } : undefined))) return TOO_LATE;
  return { ok: true, correct, reigns, next, finish: correct ? null : await finishInfo(player, "timeline", session.id) };
}

/** Start of the leaderboard period: Monday 00:00 in Prague, or the beginning of time. */
export function periodStart(period: Period, now = new Date()): Date {
  return period === "week" ? pragueDayStart(weekStartKey(dailyDateKey(now))) : new Date(0);
}

type BoardRow = { nickname: string; score: number; durationMs: number | null; crest: unknown };

/**
 * Best result of every player with a nickname in the period: highest score;
 * a tie goes to the shorter time (Rychlovka) or to whoever got there first.
 */
export async function getGameLeaderboard(mode: GameMode, period: Period, limit = 10): Promise<{ entries: BoardEntry[]; total: number }> {
  const since = periodStart(period);
  const timed = mode === "quick";
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<BoardRow[]>`
    SELECT nickname, score, "durationMs", crest FROM (
      SELECT DISTINCT ON (s."playerId") p.nickname, p.crest, s.score, s."durationMs", s."finishedAt"
      FROM "GameSession" s JOIN "Player" p ON p.id = s."playerId"
      WHERE s.mode = ${mode} AND s."finishedAt" IS NOT NULL AND s."finishedAt" >= ${since}
        AND p.nickname IS NOT NULL AND s.score > 0
      ORDER BY s."playerId", s.score DESC,
        CASE WHEN ${timed} THEN s."durationMs" END ASC NULLS LAST, s."finishedAt" ASC
    ) best
    ORDER BY score DESC, CASE WHEN ${timed} THEN "durationMs" END ASC NULLS LAST, "finishedAt" ASC
    LIMIT ${limit}`;
  const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT s."playerId") AS count
    FROM "GameSession" s JOIN "Player" p ON p.id = s."playerId"
    WHERE s.mode = ${mode} AND s."finishedAt" IS NOT NULL AND s."finishedAt" >= ${since}
      AND p.nickname IS NOT NULL AND s.score > 0`;
  return {
    total: Number(count),
    entries: rows.map((row, i) => ({
      rank: i + 1,
      nickname: row.nickname,
      score: row.score,
      durationMs: timed ? row.durationMs : null,
      crest: parseCrest(row.crest),
    })),
  };
}

/** The player's personal best in `mode` (all time). */
export async function getPersonalBest(player: PlayerRow, mode: GameMode): Promise<BestResult | null> {
  return getPrisma().gameSession.findFirst({
    where: { playerId: player.id, mode, finishedAt: { not: null } },
    orderBy: [{ score: "desc" }, { durationMs: "asc" }],
    select: { score: true, durationMs: true },
  });
}
