// Progressive reveal of game modes for new players (game audit, point 3 / task 15).
//
// A brand-new player sees only the main game (Hra o kartu) and the gallery.
// After the first card: Denní výzva and Můj erb. After three cards (or when the
// player already used a later mode on this device): every mode.
//
// Only menus and home-page entries are hidden – every page still works by its
// address. Without JavaScript or storage nothing is hidden (no attribute).
//
// The level lives on <html data-reveal="0|1|2">; CSS (globals.css) hides
// elements marked `data-reveal-at="1|2"` above the current level. The inline
// script in the root layout sets it before the first paint (no flash, no layout
// shift); `applyReveal()` updates it when a card is won.

export const REVEAL_DAILY_AT = 1; // cards for Denní výzva + Můj erb
export const REVEAL_ALL_AT = 3; // cards for Rychlovka, Kdo vládl dřív?, Řeka času, Žebříčky

export type RevealLevel = 0 | 1 | 2;

/** Pure rule, shared with tests. */
export function revealLevel(cards: number, usedLaterModes: boolean): RevealLevel {
  if (usedLaterModes || cards >= REVEAL_ALL_AT) return 2;
  return cards >= REVEAL_DAILY_AT ? 1 : 0;
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
export const REVEAL_SCRIPT = `(function(){try{var s=window.localStorage,c=0,r=s.getItem("cesky-kral:collection");if(r){var d=JSON.parse(r);if(d&&Array.isArray(d.kings))c=d.kings.length}var u=s.getItem("cesky-kral:daily")!==null||s.getItem("cesky-kral:who-first")!==null;document.documentElement.setAttribute("data-reveal",String(u||c>=${REVEAL_ALL_AT}?2:c>=${REVEAL_DAILY_AT}?1:0))}catch(e){}})();`;
