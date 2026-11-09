"use client";

import { useSyncExternalStore } from "react";

import { QUESTION_KEY_PATTERN, tierFor, type Tier } from "@/lib/mastery";
import { isValidSlug } from "@/lib/slug";

// "Koruny učenosti" progress, stored in the browser next to the collection
// (same approach as `cesky-kral:collection`, nothing goes to the server):
//   { version: 1, kings: { [slug]: { known: string[], tier: 0–3 } } }
// - known: stable keys of the ruler's questions answered correctly (each once)
// - tier:  highest crown reached; its celebration has been shown. A crown is
//          never taken away (e.g. when a ruler gets new questions later).
// User-controlled data – parse defensively.
const STORAGE_KEY = "cesky-kral:mastery";
const MAX_KINGS = 500;
const MAX_KNOWN = 200;

export type KingMastery = { readonly known: readonly string[]; readonly tier: Tier };
export type Mastery = Readonly<Record<string, KingMastery>>;

const EMPTY: Mastery = Object.freeze({});

function parse(raw: string | null): Mastery {
  if (!raw || raw.length > 400_000) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return EMPTY;
    const { version, kings } = data as Record<string, unknown>;
    if (version !== 1 || typeof kings !== "object" || kings === null || Array.isArray(kings)) return EMPTY;
    const result: Record<string, KingMastery> = {};
    for (const [slug, value] of Object.entries(kings).slice(0, MAX_KINGS)) {
      if (!isValidSlug(slug) || typeof value !== "object" || value === null) continue;
      const { known, tier } = value as Record<string, unknown>;
      const keys = Array.isArray(known)
        ? [...new Set(known.filter((k): k is string => typeof k === "string" && QUESTION_KEY_PATTERN.test(k)))].slice(0, MAX_KNOWN)
        : [];
      const validTier: Tier = tier === 1 || tier === 2 || tier === 3 ? tier : 0;
      result[slug] = Object.freeze({ known: Object.freeze(keys), tier: validTier });
    }
    return Object.freeze(result);
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked
  }
}

let cachedRaw: string | null | undefined;
let cached: Mastery = EMPTY;

function getSnapshot(): Mastery {
  const raw = readRaw();
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

export function useMastery(): Mastery {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** Current crowns (outside React). */
export function readMastery(): Mastery {
  return getSnapshot();
}

export function tierOf(mastery: Mastery, slug: string): Tier {
  return mastery[slug]?.tier ?? 0;
}

/**
 * Records a correct answer. Returns the crown reached by THIS answer (to be
 * celebrated right now), or null. The new tier is saved together with the
 * answer, so each celebration shows only once – even after a reload.
 * When storage is blocked, nothing is celebrated (it could not be remembered).
 */
export function recordCorrectAnswer(slug: string, key: string, total: number): 1 | 2 | 3 | null {
  if (!isValidSlug(slug) || !QUESTION_KEY_PATTERN.test(key) || !Number.isSafeInteger(total) || total < 1) return null;
  const all = getSnapshot();
  const current = all[slug] ?? { known: [], tier: 0 as Tier };
  if (current.known.includes(key)) return null; // already counted
  const known = [...current.known, key].slice(0, MAX_KNOWN);
  const reached = tierFor(known.length, total);
  const tier = (Math.max(current.tier, reached) as Tier);
  const next = { ...all, [slug]: { known, tier } };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, kings: next }));
  } catch {
    return null;
  }
  listeners.forEach((listener) => listener());
  return tier > current.tier ? (tier as 1 | 2 | 3) : null;
}

/**
 * "Přenos postupu": merges crowns from another device (raw text of this
 * storage key) – known questions are joined, the higher tier wins.
 */
export function mergeMasteryFrom(raw: unknown): boolean {
  if (typeof raw !== "string") return true;
  const incoming = parse(raw);
  const all: Record<string, KingMastery> = { ...getSnapshot() };
  for (const [slug, theirs] of Object.entries(incoming)) {
    const mine = all[slug] ?? { known: [], tier: 0 as Tier };
    all[slug] = {
      known: [...new Set([...mine.known, ...theirs.known])].slice(0, MAX_KNOWN),
      tier: Math.max(mine.tier, theirs.tier) as Tier,
    };
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, kings: all }));
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}
