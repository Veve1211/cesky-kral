"use client";

// Which freshly collected king the player has already seen in "Řeka času".
// Stored in localStorage as { version: 1, slug: string }. While the newest
// king in the collection differs from this slug, the river shows a "Nový"
// badge on it. User-controlled data – parse defensively.
import { isValidSlug } from "@/lib/slug";

const STORAGE_KEY = "cesky-kral:timeline-seen";

function parse(raw: string | null): string | null {
  if (!raw || raw.length > 1_000) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { version, slug } = data as Record<string, unknown>;
    return version === 1 && isValidSlug(slug) ? slug : null;
  } catch {
    return null;
  }
}

/** Slug of the last king whose "Nový" badge was seen, or null. */
export function readSeenNewest(): string | null {
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null; // storage blocked or server render
  }
}

/** Remembers that the badge of `slug` has been seen. */
export function markNewestSeen(slug: string): void {
  if (!isValidSlug(slug)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, slug }));
  } catch {
    // Storage blocked – the badge simply shows again next time.
  }
}

/** The most recently collected king that still exists (collection keeps insertion order). */
export function newestCollected(collected: readonly string[], existing: ReadonlySet<string>): string | null {
  for (let i = collected.length - 1; i >= 0; i -= 1) {
    if (existing.has(collected[i])) return collected[i];
  }
  return null;
}
