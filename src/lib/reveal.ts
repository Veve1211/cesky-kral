// Locked game modes for new players (game audit, point 3 / task 15; changed by
// Veve 25. 11. 2026: show everything at once, locked until the first card).
//
// A brand-new player sees every mode, but Denní výzva, Rychlovka, Kdo vládl dřív?,
// Žebříčky and Můj erb carry a 🔒 and lead to the first card round ("Odemkne se po
// první kartě"). The first card (or earlier use of a later mode on this device)
// unlocks everything. Every page still works by its address (teachers' links).
//
// The state lives on <html data-reveal="0|1"> (0 = locked). Elements come in two
// variants: `.reveal-open` (the real link) and `.reveal-locked` (lock + link to the
// first card round); CSS in globals.css shows one of them. The inline script in the
// root layout sets the attribute before the first paint (no flash, no layout
// shift); `applyReveal()` updates it when a card is won. Without JavaScript or
// storage there is no attribute and everything is open.

/** Cards needed to unlock every mode. */
export const UNLOCK_AT = 1;

/** The first ruler of the game (seed order 1) – where a locked entry leads. */
export const FIRST_KING_HREF = "/kral/libuse";

export type RevealLevel = 0 | 1;

/** Pure rule, shared with tests. */
export function revealLevel(cards: number, usedLaterModes: boolean): RevealLevel {
  return usedLaterModes || cards >= UNLOCK_AT ? 1 : 0;
}

// Mirrors the storage keys of collection.ts ("cesky-kral:collection"),
// daily-progress.ts and who-first-best.ts. Blocked storage = no attribute.
function computeInBrowser(): RevealLevel | null {
  try {
    const storage = window.localStorage;
    let cards = 0;
    const raw = storage.getItem("cesky-kral:collection");
    if (raw) {
      const data: unknown = JSON.parse(raw);
      const kings = typeof data === "object" && data !== null ? (data as { kings?: unknown }).kings : null;
      if (Array.isArray(kings)) cards = kings.length;
    }
    const used = storage.getItem("cesky-kral:daily") !== null || storage.getItem("cesky-kral:who-first") !== null;
    return revealLevel(cards, used);
  } catch {
    return null;
  }
}

/** Recomputes the level from storage and sets it on <html>. */
export function applyReveal() {
  const level = computeInBrowser();
  if (level === null) document.documentElement.removeAttribute("data-reveal");
  else document.documentElement.setAttribute("data-reveal", String(level));
}

/** Inline script for <head> (same rule as `revealLevel`) – a constant string, no user data. */
export const REVEAL_SCRIPT = `(function(){try{var s=window.localStorage,c=0,r=s.getItem("cesky-kral:collection");if(r){var d=JSON.parse(r);if(d&&Array.isArray(d.kings))c=d.kings.length}var u=s.getItem("cesky-kral:daily")!==null||s.getItem("cesky-kral:who-first")!==null;document.documentElement.setAttribute("data-reveal",u||c>=${UNLOCK_AT}?"1":"0")}catch(e){}})();`;

/** Shown on locked entries and read by screen readers. */
export const LOCKED_NOTE = "Odemkne se po první kartě";
