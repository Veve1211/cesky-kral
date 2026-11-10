// Nickname rules – shared by server, client and tests.
// No registration, no personal data: just a short public name for leaderboards.
import { containsProfanity } from "@/lib/profanity";

export const NICKNAME_MIN = 3;
export const NICKNAME_MAX = 16;

// Letters (Czech too), digits, space, dot, dash and underscore.
const ALLOWED = /^[\p{L}\p{N} ._-]+$/u;
// Names that would look official or confuse other players.
const RESERVED = ["admin", "administrator", "moderator", "spravce", "ceskykral", "dnesnivladce", "kronikar", "system"];

/** Trimmed, single spaces, NFC. */
export function cleanNickname(raw: string): string {
  return raw.normalize("NFC").replace(/\s+/g, " ").trim();
}

/**
 * Key for uniqueness: lowercase, no diacritics, only letters and digits.
 * "Karel IV.", "karel-iv" and "KAREL IV" are the same nickname.
 */
export function nicknameKey(nickname: string): string {
  return cleanNickname(nickname)
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export type NicknameCheck = { ok: true; nickname: string; key: string } | { ok: false; error: string };

/** Validates a nickname typed by a player (uniqueness is checked by the database). */
export function checkNickname(raw: unknown): NicknameCheck {
  if (typeof raw !== "string") return { ok: false, error: "Napiš přezdívku." };
  const nickname = cleanNickname(raw);
  const length = [...nickname].length;
  if (length < NICKNAME_MIN) return { ok: false, error: `Přezdívka musí mít aspoň ${NICKNAME_MIN} znaky.` };
  if (length > NICKNAME_MAX) return { ok: false, error: `Přezdívka může mít nejvýš ${NICKNAME_MAX} znaků.` };
  if (!ALLOWED.test(nickname)) {
    return { ok: false, error: "Použij jen písmena, číslice, mezeru, tečku, pomlčku nebo podtržítko." };
  }
  const key = nicknameKey(nickname);
  if (!/\p{L}/u.test(key)) return { ok: false, error: "Přezdívka musí obsahovat aspoň jedno písmeno." };
  if (containsProfanity(nickname)) return { ok: false, error: "Tahle přezdívka se do kroniky nehodí. Zkus jinou." };
  if (RESERVED.some((word) => key.includes(word))) return { ok: false, error: "Tahle přezdívka je vyhrazená. Zkus jinou." };
  return { ok: true, nickname, key };
}
