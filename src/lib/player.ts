"use client";

// The anonymous player in this browser: a random token from the server,
// kept in localStorage `cesky-kral:player` = { version: 1, token }.
// No account, no e-mail, no personal data. Whoever has the token plays as
// this player (that is how "Přenos postupu" moves it to another device).
const STORAGE_KEY = "cesky-kral:player";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function readToken(): string | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 500) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { version, token } = data as Record<string, unknown>;
    return version === 1 && typeof token === "string" && TOKEN_PATTERN.test(token) ? token : null;
  } catch {
    return null;
  }
}

export function writeToken(token: string): boolean {
  if (!TOKEN_PATTERN.test(token)) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, token }));
    return true;
  } catch {
    return false;
  }
}

export type ApiResult<T> = ({ ok: true } & T) | { ok: false; error: string };

/** POSTs JSON to one of our API routes; network errors become `{ ok: false }`. */
export async function postJson<T extends object>(url: string, body: object): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = (await response.json()) as ApiResult<T>;
    if (typeof data !== "object" || data === null || typeof data.ok !== "boolean") throw new Error("bad response");
    return data;
  } catch {
    return { ok: false, error: "Spojení se serverem se nepovedlo. Zkus to znovu." };
  }
}

let pending: Promise<string | null> | null = null;

/** The player's token; creates an anonymous player on first use. */
export function ensurePlayer(): Promise<string | null> {
  const existing = readToken();
  if (existing) return Promise.resolve(existing);
  pending ??= postJson<{ token: string }>("/api/player", {}).then((result) => {
    pending = null;
    if (!result.ok || !writeToken(result.token)) return null;
    return result.token;
  });
  return pending;
}

/** Tells leaderboards on the page to load again (after a game or a new nickname). */
export const LEADERBOARD_CHANGED = "cesky-kral:leaderboard-changed";
export function announceLeaderboardChange() {
  window.dispatchEvent(new Event(LEADERBOARD_CHANGED));
}
