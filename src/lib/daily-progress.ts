"use client";

import { useSyncExternalStore } from "react";

import { isDateKey, shiftDateKey } from "@/lib/daily";

// "Denní výzva" progress in localStorage:
//   { version: 1, date, marks, streak, lastCompleted }
// - date + marks: the attempt of that day, one boolean per answered question
//   (in order). An attempt of an older day simply doesn't count for today.
// - streak: days in a row with a finished challenge, ending at lastCompleted.
// User-controlled data – parse defensively.
const STORAGE_KEY = "cesky-kral:daily";
const MAX_MARKS = 20;
const MAX_STREAK = 100_000;

export type DailyProgress = {
  readonly date: string | null;
  readonly marks: readonly boolean[];
  readonly streak: number;
  readonly lastCompleted: string | null;
};

const EMPTY: DailyProgress = Object.freeze({ date: null, marks: Object.freeze([]), streak: 0, lastCompleted: null });

function parse(raw: string | null): DailyProgress {
  if (!raw || raw.length > 2_000) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return EMPTY;
    const { version, date, marks, streak, lastCompleted } = data as Record<string, unknown>;
    if (version !== 1) return EMPTY;
    const validDate = isDateKey(date) ? date : null;
    const validMarks =
      validDate && Array.isArray(marks) && marks.length <= MAX_MARKS && marks.every((m) => typeof m === "boolean")
        ? (marks as boolean[])
        : [];
    const validLast = isDateKey(lastCompleted) ? lastCompleted : null;
    const validStreak =
      validLast && typeof streak === "number" && Number.isSafeInteger(streak) && streak >= 1 && streak <= MAX_STREAK
        ? streak
        : 0;
    return Object.freeze({
      date: validDate,
      marks: Object.freeze([...validMarks]),
      streak: validStreak,
      lastCompleted: validStreak > 0 ? validLast : null,
    });
  } catch {
    return EMPTY;
  }
}

// useSyncExternalStore needs a stable snapshot: re-parse only when the raw text changes.
let cachedRaw: string | null = null;
let cached: DailyProgress = EMPTY;

function getSnapshot(): DailyProgress {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY; // storage blocked
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDailyProgress(): DailyProgress {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function readDailyProgress(): DailyProgress {
  return getSnapshot();
}

/** Answers already given in the challenge of `date` (empty for another day). */
export function marksFor(progress: DailyProgress, date: string): readonly boolean[] {
  return progress.date === date ? progress.marks : [];
}

/** Streak that is still alive on `today` (finished today or yesterday), else 0. */
export function currentStreak(progress: DailyProgress, today: string): number {
  if (!progress.lastCompleted) return 0;
  return progress.lastCompleted === today || progress.lastCompleted === shiftDateKey(today, -1)
    ? progress.streak
    : 0;
}

/**
 * Records the answer to question `index` (0-based) of the challenge of `date`.
 * Answers must come in order, so a reload can't replay a question.
 * The last answer finishes the day and extends the streak.
 * Returns false when the answer could not be saved.
 */
export function recordDailyAnswer(date: string, index: number, correct: boolean, total: number): boolean {
  if (!isDateKey(date) || !Number.isSafeInteger(total) || total < 1 || total > MAX_MARKS) return false;
  const current = getSnapshot();
  const marks = [...marksFor(current, date)];
  if (index !== marks.length || index >= total) return index < marks.length; // already recorded
  marks.push(correct);

  let { streak, lastCompleted } = current;
  if (marks.length === total && lastCompleted !== date) {
    streak = lastCompleted === shiftDateKey(date, -1) ? Math.min(streak + 1, MAX_STREAK) : 1;
    lastCompleted = date;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, date, marks, streak, lastCompleted }),
    );
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}
