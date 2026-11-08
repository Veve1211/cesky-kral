// "Kdo vládl dřív?" – types and helpers shared by server and client.
// Reign years are NOT part of `WhoFirstKing`: the browser learns them only
// from the server action, after the player has answered.

import type { KingTitle } from "@/lib/king-display";

export type WhoFirstKing = {
  slug: string;
  name: string;
  title: KingTitle;
  imageUrl: string | null;
};

/** Indices of two different kings in the list. */
export type WhoFirstPair = readonly [number, number];

export type WhoFirstReign = { slug: string; from: number; to: number | null };

export type WhoFirstResult =
  | {
      ok: true;
      correct: boolean;
      /** Slug of the king who started to reign first. */
      earlierSlug: string;
      reigns: WhoFirstReign[];
    }
  | { ok: false; error: string };

function samePair(a: WhoFirstPair, b: WhoFirstPair | null): boolean {
  if (!b) return false;
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

/**
 * Random pair of two different kings that is not the same pair as `previous`
 * (in any order). Returns null when there are fewer than two kings.
 */
export function pickPair(count: number, previous: WhoFirstPair | null = null): WhoFirstPair | null {
  if (count < 2) return null;
  // With only two kings the pair can't change – just swap the sides.
  if (count === 2) return previous ? [previous[1], previous[0]] : [0, 1];
  for (;;) {
    const first = Math.floor(Math.random() * count);
    let second = Math.floor(Math.random() * (count - 1));
    if (second >= first) second += 1;
    const pair: WhoFirstPair = [first, second];
    if (!samePair(pair, previous)) return pair;
  }
}

/** "1346–1378" (or "od 1346" when the end is unknown). */
export function formatReignYears(reign: WhoFirstReign): string {
  return reign.to === null ? `od ${reign.from}` : `${reign.from}–${reign.to}`;
}
