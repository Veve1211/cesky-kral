"use client";

import { useSyncExternalStore } from "react";

import { isValidSlug } from "@/lib/slug";

// Player's collection stored in localStorage: { version: 1, kings: string[] }.
// Data in localStorage is user-controlled – always parse defensively.
const STORAGE_KEY = "cesky-kral:collection";
const MAX_KINGS = 500;
const EMPTY: readonly string[] = Object.freeze([]);

function parse(raw: string | null): readonly string[] {
  if (!raw || raw.length > 50_000) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (
      typeof data !== "object" ||
      data === null ||
      (data as { version?: unknown }).version !== 1 ||
      !Array.isArray((data as { kings?: unknown }).kings)
    ) {
      return EMPTY;
    }
    const kings = (data as { kings: unknown[] }).kings.filter(isValidSlug);
    return Object.freeze([...new Set(kings)].slice(0, MAX_KINGS));
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode, disabled cookies...)
  }
}

// Cache the parsed value so useSyncExternalStore gets a stable snapshot.
let cachedRaw: string | null | undefined;
let cachedValue: readonly string[] = EMPTY;

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
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

export function useCollection(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Adds a king to the collection. Returns false if storage is unavailable. */
export function addToCollection(slug: string): boolean {
  if (!isValidSlug(slug)) return false;
  const current = getSnapshot();
  if (current.includes(slug)) return true;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, kings: [...current, slug] }),
    );
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}
