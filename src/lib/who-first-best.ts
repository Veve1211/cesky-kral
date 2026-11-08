"use client";

import { useSyncExternalStore } from "react";

// Best streak in "Kdo vládl dřív?", stored in localStorage as
// { version: 1, best: number }. User-controlled data – parse defensively.
const STORAGE_KEY = "cesky-kral:who-first";
const MAX_BEST = 100_000;

function parse(raw: string | null): number {
  if (!raw || raw.length > 1_000) return 0;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return 0;
    const { version, best } = data as Record<string, unknown>;
    if (version !== 1 || typeof best !== "number") return 0;
    return Number.isSafeInteger(best) && best >= 0 && best <= MAX_BEST ? best : 0;
  } catch {
    return 0;
  }
}

function getSnapshot(): number {
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 0; // storage blocked
  }
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

export function useBestStreak(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

/** Saves `streak` if it beats the stored best. Returns the best streak. */
export function saveBestStreak(streak: number): number {
  const best = getSnapshot();
  if (!Number.isSafeInteger(streak) || streak <= best || streak > MAX_BEST) return best;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, best: streak }));
  } catch {
    return best;
  }
  listeners.forEach((listener) => listener());
  return streak;
}
