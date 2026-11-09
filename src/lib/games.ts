// Server-scored game modes with weekly and all-time leaderboards.
// Shared by server, client and tests (no DB, no window).

export const GAME_MODES = ["who-first", "timeline", "quick"] as const;
export type GameMode = (typeof GAME_MODES)[number];

export function isGameMode(value: unknown): value is GameMode {
  return typeof value === "string" && (GAME_MODES as readonly string[]).includes(value);
}

export const GAME_INFO: Record<GameMode, { name: string; icon: string; href: string; unit: string; timed: boolean }> = {
  "who-first": { name: "Kdo vládl dřív?", icon: "⏳", href: "/kdo-driv", unit: "série", timed: false },
  timeline: { name: "Řeka času", icon: "🌊", href: "/reka-casu", unit: "kola", timed: false },
  quick: { name: "Rychlovka", icon: "⚡", href: "/rychlovka", unit: "správně z 10", timed: true },
};

export type Period = "week" | "all";
export const PERIOD_NAMES: Record<Period, string> = { week: "Tento týden", all: "Celkově" };

/** "Řeka času": how many rulers to put in order in one round. */
export const TIMELINE_SIZE = 4;

/** A ruler as the browser sees it in these games – never with years. */
export type GameRuler = { slug: string; name: string; title: string; imageUrl: string | null };
export type Reign = { slug: string; from: number; to: number | null };

/** True when `order` puts the rulers from the earliest start of reign (ties allowed). */
export function isChronological(order: readonly string[], reigns: readonly Reign[]): boolean {
  const from = new Map(reigns.map((reign) => [reign.slug, reign.from]));
  for (let i = 1; i < order.length; i++) {
    const a = from.get(order[i - 1]);
    const b = from.get(order[i]);
    if (a === undefined || b === undefined || a > b) return false;
  }
  return true;
}

export type BestResult = { score: number; durationMs: number | null };
