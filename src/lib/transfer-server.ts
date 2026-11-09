import "server-only";
import { randomInt } from "node:crypto";

import { hashSecret, isToken, type PlayerRow } from "@/lib/player-server";
import { getPrisma } from "@/lib/prisma";
import { CODE_ALPHABET, CODE_LENGTH, cleanPayload, normalizeCode, TRANSFER_MINUTES, type TransferPayload } from "@/lib/transfer-code";

// The code is single-use and valid for 30 minutes; only its hash is stored.
// The payload carries the player's token so the other device plays as the
// same player (nickname, leaderboards). The row is deleted when redeemed.

function newCode(): string {
  return Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
}

export async function createTransfer(
  player: PlayerRow,
  token: string,
  rawPayload: unknown,
): Promise<{ ok: true; code: string; expiresAt: string } | { ok: false; error: string }> {
  const payload = cleanPayload(rawPayload);
  if (!payload) return { ok: false, error: "Postup se nepodařilo připravit." };
  const prisma = getPrisma();
  const now = new Date();
  // Housekeeping: drop expired codes.
  await prisma.transferCode.deleteMany({ where: { expiresAt: { lt: now } } });
  const expiresAt = new Date(now.getTime() + TRANSFER_MINUTES * 60_000);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    try {
      await prisma.transferCode.create({
        data: { codeHash: hashSecret(code), playerId: player.id, expiresAt, payload: { ...payload, token } },
      });
      return { ok: true, code, expiresAt: expiresAt.toISOString() };
    } catch {
      // Extremely rare collision – try another code.
    }
  }
  return { ok: false, error: "Kód se nepodařilo vytvořit. Zkus to znovu." };
}

export async function redeemTransfer(
  rawCode: unknown,
): Promise<{ ok: true; token: string; payload: TransferPayload } | { ok: false; error: string }> {
  const code = normalizeCode(rawCode);
  const invalid = { ok: false, error: "Kód neplatí. Zkontroluj ho nebo si vytvoř nový." } as const;
  if (!code) return invalid;
  const prisma = getPrisma();
  const row = await prisma.transferCode.findUnique({ where: { codeHash: hashSecret(code) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return invalid;
  // Single use: whoever deletes the row first wins.
  const deleted = await prisma.transferCode.deleteMany({ where: { id: row.id } });
  if (deleted.count !== 1) return invalid;
  const stored = row.payload as Record<string, unknown>;
  const payload = cleanPayload(stored);
  if (!payload || !isToken(stored.token)) return invalid;
  return { ok: true, token: stored.token, payload };
}
