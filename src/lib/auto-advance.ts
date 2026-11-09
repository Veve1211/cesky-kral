"use client";

import { useSyncExternalStore } from "react";

// How long the feedback stays before the game moves on by itself.
// Kept short on purpose (about a second) so the game flows. A wrong answer
// in a quiz waits for "Další", so the right answer and its explanation can
// be read. With "reduce motion" switched on in the system, nothing moves on
// by itself – the player always decides when to continue.
export const AUTO_ADVANCE_MS = 1200;

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** False when the player asked the system for less motion (and on the server). */
export function useAutoAdvanceAllowed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(QUERY).matches,
    () => false,
  );
}
