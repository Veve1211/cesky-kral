"use client";

import { useSyncExternalStore } from "react";

import { isValidSlug } from "@/lib/slug";

// Player's collection stored in localStorage.
//   version 2: { version: 2, kings: string[], golden: string[] }
//   version 1 (legacy): { version: 1, kings: string[] } – migrated to v2,
//   every collected king is kept, golden starts empty.
// Data in localStorage is user-controlled – always parse defensively.
const STORAGE_KEY = "cesky-kral:collection";
const CURRENT_VERSION = 2;
const MAX_KINGS = 500;

export type Collection = {
  readonly kings: readonly string[];
  /** Golden cards – always a subset of `kings`. */
  readonly golden: readonly string[];
};

const EMPTY: Collection = Object.freeze({
  kings: Object.freeze([]) as readonly string[],
  golden: Object.freeze([]) as readonly string[],
});

function cleanSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isValidSlug))].slice(0, MAX_KINGS);
}

type Parsed = { collection: Collection; version: number } | null;

/** Returns null for missing or unreadable data. */
function parse(raw: string | null): Parsed {
  if (!raw || raw.length > 100_000) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { version, kings, golden } = data as Record<string, unknown>;
    if (!Array.isArray(kings)) return null;

    if (version === 1) {
      return { version: 1, collection: freeze(cleanSlugs(kings), []) };
    }
    if (version === 2) {
      return { version: 2, collection: freeze(cleanSlugs(kings), cleanSlugs(golden)) };
    }
    return null;
  } catch {
    return null;
  }
}

function freeze(kings: string[], golden: string[]): Collection {
  const owned = new Set(kings);
  return Object.freeze({
    kings: Object.freeze(kings),
    // A golden card without the king itself makes no sense – drop it.
    golden: Object.freeze(golden.filter((slug) => owned.has(slug))),
  });
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode, disabled cookies...)
  }
}

function write(collection: Collection): boolean {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: CURRENT_VERSION,
        kings: collection.kings,
        golden: collection.golden,
      }),
    );
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}

/**
 * Rewrites version 1 data as version 2. Only runs when the old data
 * parsed successfully, so nothing is ever lost; unreadable data is left
 * untouched.
 */
function migrateIfNeeded() {
  const parsed = parse(readRaw());
  if (parsed && parsed.version < CURRENT_VERSION) write(parsed.collection);
}

// Cache the parsed value so useSyncExternalStore gets a stable snapshot.
let cachedRaw: string | null | undefined;
let cachedValue: Collection = EMPTY;

function getSnapshot(): Collection {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw)?.collection ?? EMPTY;
  }
  return cachedValue;
}

function getServerSnapshot(): Collection {
  return EMPTY;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  if (listeners.size === 0) migrateIfNeeded();
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

/** Current collection (outside React). */
export function readCollection(): Collection {
  return getSnapshot();
}

export function useCollection(): Collection {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Adds a king to the collection. Returns false if storage is unavailable. */
export function addToCollection(slug: string): boolean {
  if (!isValidSlug(slug)) return false;
  const current = getSnapshot();
  if (current.kings.includes(slug)) return true;
  return write({ kings: [...current.kings, slug], golden: current.golden });
}

/**
 * Marks a collected king as a golden card. Refuses kings that are not
 * in the collection. Returns false if not allowed or storage is unavailable.
 */
export function addGoldenCard(slug: string): boolean {
  if (!isValidSlug(slug)) return false;
  const current = getSnapshot();
  if (!current.kings.includes(slug)) return false;
  if (current.golden.includes(slug)) return true;
  return write({ kings: current.kings, golden: [...current.golden, slug] });
}

const noopSubscribe = () => () => {};

/**
 * False during server render and hydration, true once localStorage can be read.
 * Lets pages avoid flashing an "empty collection" state before hydration.
 */
export function useCollectionReady(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
