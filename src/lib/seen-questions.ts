// Which king-round questions the player has already been shown, so the next round
// prefers questions they have not seen yet. Stored in localStorage as
// { version: 1, ids: number[] } (oldest first, at most SEEN_LIMIT ids). Nothing goes
// to the server and no cookie is used. User-controlled data – parse defensively.

const STORAGE_KEY = "cesky-kral:seen";

/** Enough for several rounds of every ruler; older ids drop out first. */
export const SEEN_LIMIT = 60;

/** Parses the stored value; anything unexpected counts as "nothing seen". */
export function parseSeen(raw: string | null): number[] {
  if (!raw || raw.length > 5_000) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return [];
    const { version, ids } = data as Record<string, unknown>;
    if (version !== 1 || !Array.isArray(ids)) return [];
    const valid = ids.filter((id): id is number => Number.isSafeInteger(id) && id > 0);
    return [...new Set(valid)].slice(-SEEN_LIMIT);
  } catch {
    return [];
  }
}

/** Moves `shown` to the newest end (no duplicates) and keeps the last SEEN_LIMIT ids. */
export function addSeen(seen: readonly number[], shown: readonly number[], limit = SEEN_LIMIT): number[] {
  const fresh = new Set(shown);
  return [...seen.filter((id) => !fresh.has(id)), ...fresh].slice(-limit);
}

/** Ids already shown, oldest first. */
export function readSeen(): number[] {
  try {
    return parseSeen(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return []; // storage blocked or server render
  }
}

/** Remembers that these questions were shown in a round. */
export function markSeen(shown: readonly number[]): void {
  try {
    const ids = addSeen(readSeen(), shown);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ids }));
  } catch {
    // Storage blocked – rounds are simply random, as before.
  }
}
