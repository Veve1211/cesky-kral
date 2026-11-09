"use client";

import { useSyncExternalStore } from "react";

import { parseCrest, type CrestDesign } from "@/lib/heraldry";

// The player's own coat of arms in the browser: { version: 1, design }.
// User-controlled – parsed with `parseCrest` (allowed parts only, rules checked).
export const CREST_KEY = "cesky-kral:crest";

function parse(raw: string | null): CrestDesign | null {
  if (!raw || raw.length > 2_000) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { version, design } = data as Record<string, unknown>;
    return version === 1 ? parseCrest(design) : null;
  } catch {
    return null;
  }
}

let cachedRaw: string | null | undefined;
let cached: CrestDesign | null = null;

function getSnapshot(): CrestDesign | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CREST_KEY);
  } catch {
    return null;
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
    if (event.key === null || event.key === CREST_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedCrest(): CrestDesign | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function readSavedCrest(): CrestDesign | null {
  return getSnapshot();
}

export function saveCrest(design: CrestDesign): boolean {
  const valid = parseCrest(design);
  if (!valid) return false;
  try {
    window.localStorage.setItem(CREST_KEY, JSON.stringify({ version: 1, design: valid }));
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}

/** "Přenos postupu": keeps this device's crest, takes the other one only when there is none. */
export function mergeCrestFrom(raw: unknown): boolean {
  if (typeof raw !== "string" || getSnapshot()) return true;
  const theirs = parse(raw);
  return theirs ? saveCrest(theirs) : true;
}
