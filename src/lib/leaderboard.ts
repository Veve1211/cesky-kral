// Leaderboard helpers shared by server, client and tests (no DB, no window).
import type { CrestDesign } from "@/lib/heraldry";

export type BoardEntry = {
  rank: number;
  nickname: string;
  score: number;
  /** Time in milliseconds (shorter wins on equal score), null when not timed. */
  durationMs: number | null;
  /** The player's own coat of arms (validated parameters), if any. */
  crest?: CrestDesign | null;
};

export type Standing = {
  rank: number;
  /** Players in the leaderboard (including this one when ranked). */
  total: number;
  score: number;
  durationMs: number | null;
  /** False when the player has no nickname yet (rank is "would be"). */
  ranked: boolean;
  /** The result one place higher, null for the first place. */
  above: { score: number; durationMs: number | null } | null;
};

/** "42 s", "1 min 05 s" */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  if (total < 60) return `${total} s`;
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, "0")} s`;
}

function answersWord(n: number): string {
  if (n === 1) return "1 správná odpověď";
  if (n >= 2 && n <= 4) return `${n} správné odpovědi`;
  return `${n} správných odpovědí`;
}

function missedVerb(n: number): string {
  return n === 1 ? "chyběla" : n >= 2 && n <= 4 ? "chyběly" : "chybělo";
}

/**
 * What the player missed for one place higher, e.g.
 * "Na 2. místo ti chyběla 1 správná odpověď." or "Na 1. místo ti chybělo 4 s."
 */
export function gapText(standing: Pick<Standing, "rank" | "score" | "durationMs" | "above">): string | null {
  const { above } = standing;
  if (!above || standing.rank <= 1) return null;
  const place = `Na ${standing.rank - 1}. místo`;
  if (above.score > standing.score) {
    const n = above.score - standing.score;
    return `${place} ti ${missedVerb(n)} ${answersWord(n)}.`;
  }
  if (above.durationMs !== null && standing.durationMs !== null) {
    const seconds = Math.ceil((standing.durationMs - above.durationMs) / 1000);
    if (seconds >= 1) {
      const unit = seconds === 1 ? "sekunda" : seconds <= 4 ? "sekundy" : "sekund";
      return `${place} ti ${missedVerb(seconds)} ${seconds} ${unit}.`;
    }
  }
  return `${place} ti chyběl jen zlomek sekundy.`;
}

/** "3. z 25" */
export function placeText(rank: number, total: number): string {
  return `${rank}. z ${total}`;
}
