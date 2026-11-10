"use client";

import { useMemo } from "react";

import { readCollection, useCollection } from "@/lib/collection";
import { crownCounts, newlyUnlocked, type CrownCounts } from "@/lib/heraldry";
import { readMastery, tierOf, useMastery } from "@/lib/mastery-progress";

// What the player has for unlocking crest parts: cards in the collection and
// knowledge crowns (both live in the browser).

/** Counts for the rulers of the game (`kingSlugs` from the database). */
export function useCrestCounts(kingSlugs: readonly string[]): CrownCounts {
  const mastery = useMastery();
  const { kings } = useCollection();
  return useMemo(() => {
    const owned = new Set(kings);
    return crownCounts(
      kingSlugs.map((slug) => tierOf(mastery, slug)),
      kingSlugs.length,
      kingSlugs.filter((slug) => owned.has(slug)).length,
    );
  }, [kingSlugs, mastery, kings]);
}

/** The same outside React, right now (`total` = number of rulers in the game). */
export function currentCrestCounts(total: number): CrownCounts {
  const mastery = readMastery();
  return crownCounts(
    Object.values(mastery).map((ruler) => ruler.tier),
    total,
    readCollection().kings.length,
  );
}

/**
 * Runs `change` (saving a card or a crown) and returns the crest parts it
 * unlocked, e.g. ["figura Klíč"] – for the celebration screen.
 */
export function unlockedBy(total: number, change: () => void): string[] {
  const before = currentCrestCounts(total);
  change();
  return newlyUnlocked(before, currentCrestCounts(total));
}
