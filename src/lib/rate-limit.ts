import "server-only";

// Simple fixed-window rate limit kept in the server's memory (one Railway
// instance). Resets on restart – good enough to stop scripts from hammering
// the score endpoints; the database rules (one attempt per day, answers in
// order) stay the real protection. IP addresses are never stored anywhere else.

type Window = { start: number; count: number };
const windows = new Map<string, Window>();
let lastSweep = 0;

export type Limit = { max: number; windowMs: number };

export const LIMITS = {
  createPlayer: { max: 10, windowMs: 10 * 60_000 },
  nickname: { max: 20, windowMs: 10 * 60_000 },
  answer: { max: 60, windowMs: 60_000 },
  read: { max: 120, windowMs: 60_000 },
  transferCreate: { max: 10, windowMs: 10 * 60_000 },
  transferRedeem: { max: 10, windowMs: 10 * 60_000 },
} satisfies Record<string, Limit>;

/**
 * Client address: the last entry of X-Forwarded-For, i.e. the one added by
 * our own proxy (Railway's edge), not whatever the client sent before it.
 * Next.js fills the header with the socket address when it is missing.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  return (last ?? "unknown").slice(0, 64);
}

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

/** True when the request may go on; false = too many requests. */
export function rateLimit(bucket: keyof typeof LIMITS, headers: Headers, now = Date.now()): boolean {
  const ip = clientIp(headers);
  // The E2E tests run hundreds of games from one machine; only there (never
  // set in production) requests from the local machine are not limited.
  if (process.env.E2E_RATE_LIMIT_LOOPBACK_EXEMPT === "1" && LOOPBACK.has(ip)) return true;

  const { max, windowMs } = LIMITS[bucket];
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [key, window] of windows) if (now - window.start > 10 * 60_000) windows.delete(key);
  }
  const key = `${bucket}:${ip}`;
  const current = windows.get(key);
  if (!current || now - current.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= max;
}
