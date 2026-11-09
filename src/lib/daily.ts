// "Denní výzva" – helpers shared by server, client and tests (no DB, no window).
//
// Every day has one set of questions, the same for every player. The day is
// the calendar date in the Czech time zone, so a new challenge starts at
// midnight in Prague (DST included).
import { ROUND_PLAN, type Difficulty } from "@/lib/game-rules";
import { shareIcons } from "@/lib/share-text";

export const DAILY_TIME_ZONE = "Europe/Prague";
/** Same shape as a king round: 2 easy, 2 medium, 1 hard. */
export const DAILY_PLAN = ROUND_PLAN;
export const DAILY_QUESTIONS = DAILY_PLAN.reduce((sum, step) => sum + step.count, 0);

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "2026-11-08" – the calendar date in Prague at `now`. */
// en-CA formats as YYYY-MM-DD.
const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: DAILY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function dailyDateKey(now: Date = new Date()): string {
  return dateFormat.format(now);
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_KEY.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** The date key `days` days after `key` (negative = before). */
export function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** "8. 11." – the Czech short date of a key. */
export function formatDailyDate(key: string): string {
  const [, m, d] = key.split("-").map(Number);
  return `${d}. ${m}.`;
}

/** Milliseconds until the next midnight in Prague. */
export function msUntilNextDaily(now: Date = new Date()): number {
  const [y, m, d] = shiftDateKey(dailyDateKey(now), 1).split("-").map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d);
  // Prague is UTC+1 or UTC+2 (and never switches at midnight), so local
  // midnight is a whole number of hours before UTC midnight. The earliest
  // such instant that already falls on the new day is the local midnight.
  for (let hours = 3; hours >= 0; hours--) {
    const candidate = utcMidnight - hours * 60 * 60 * 1000;
    if (dailyDateKey(new Date(candidate)) !== dailyDateKey(now)) {
      return Math.max(0, candidate - now.getTime());
    }
  }
  return Math.max(0, utcMidnight - now.getTime());
}

/** "05:12:33" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const parts = [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60];
  return parts.map((n) => String(n).padStart(2, "0")).join(":");
}

/** "1 den", "3 dny", "5 dní" */
export function formatStreakDays(days: number): string {
  if (days === 1) return "1 den";
  if (days >= 2 && days <= 4) return `${days} dny`;
  return `${days} dní`;
}

// --- deterministic choice of questions --------------------------------------

/** FNV-1a – a small, stable string hash. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 – a tiny seeded PRNG, returns numbers in [0, 1). */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type DailyCandidate = { kingSlug: string; text: string; difficulty: Difficulty };

/**
 * Picks the questions of the day: by DAILY_PLAN (easy → hard), each from a
 * different king when possible. Depends only on the date and the content
 * (king slug + question text), never on database ids – those change with
 * every seed.
 */
export function pickDailyQuestions<T extends DailyCandidate>(dateKey: string, pool: readonly T[]): T[] {
  const random = seededRandom(hash(`cesky-kral:${dateKey}`));
  const sorted = [...pool].sort((a, b) =>
    a.kingSlug === b.kingSlug ? (a.text < b.text ? -1 : a.text > b.text ? 1 : 0) : a.kingSlug < b.kingSlug ? -1 : 1,
  );
  const usedKings = new Set<string>();
  const picked: T[] = [];

  for (const { difficulty, count } of DAILY_PLAN) {
    const candidates = sorted.filter((q) => q.difficulty === difficulty);
    // Seeded Fisher–Yates.
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const chosen: T[] = [];
    // First pass: one question per king. Second pass (only with too few
    // kings): any question not chosen yet.
    for (const firstPass of [true, false]) {
      for (const question of candidates) {
        if (chosen.length === count) break;
        if (chosen.includes(question)) continue;
        if (firstPass && usedKings.has(question.kingSlug)) continue;
        chosen.push(question);
        usedKings.add(question.kingSlug);
      }
    }
    picked.push(...chosen);
  }
  return picked;
}

// --- share text --------------------------------------------------------------

/**
 * "Český král – výzva 8. 11. 4/5 👑👑👑👑⚔️" (+ streak when 2 days or more,
 * + place in today's leaderboard when the player is in it).
 */
export function dailyShareText(
  dateKey: string,
  marks: readonly boolean[],
  streak: number,
  place: { rank: number; total: number } | null = null,
): string {
  const score = marks.filter(Boolean).length;
  const icons = shareIcons(marks);
  const streakText = streak >= 2 ? ` 🔥 ${formatStreakDays(streak)}` : "";
  const placeText = place ? ` 🏆 ${place.rank}. místo z ${place.total}` : "";
  return `Český král – výzva ${formatDailyDate(dateKey)} ${score}/${marks.length} ${icons}${streakText}${placeText}`;
}
