// "Přenos postupu" codes – shared by server, client and tests.
// 8 characters without look-alikes (no I, O, 0, 1), shown as "ABCD-EFGH".
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 8;
export const TRANSFER_MINUTES = 30;

/** What the player typed → "ABCDEFGH", or null when it can't be a code. */
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 40) return null;
  const code = raw.toUpperCase().replace(/[\s-]/g, "");
  if (code.length !== CODE_LENGTH) return null;
  return [...code].every((char) => CODE_ALPHABET.includes(char)) ? code : null;
}

export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Browser storage keys that travel with the code (raw text of each). */
export const TRANSFER_KEYS = {
  collection: "cesky-kral:collection",
  mastery: "cesky-kral:mastery",
  daily: "cesky-kral:daily",
  whoFirst: "cesky-kral:who-first",
  crest: "cesky-kral:crest",
} as const;
export type TransferPayload = Partial<Record<keyof typeof TRANSFER_KEYS, string>>;

const MAX_ITEM = 100_000;

/** Keeps only known keys with string values of a sane size. */
export function cleanPayload(raw: unknown): TransferPayload | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const result: TransferPayload = {};
  for (const key of Object.keys(TRANSFER_KEYS) as (keyof typeof TRANSFER_KEYS)[]) {
    const value = (raw as Record<string, unknown>)[key];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string" || value.length > MAX_ITEM) return null;
    result[key] = value;
  }
  return result;
}
