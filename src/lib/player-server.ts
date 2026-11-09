import "server-only";
import { createHash, randomBytes } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { checkNickname } from "@/lib/nickname";
import { getPrisma } from "@/lib/prisma";

// Anonymous players. The browser keeps a random token (256 bits); the
// database keeps only its SHA-256 hash, so a database leak reveals no token.

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}

export function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function createPlayer(): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await getPrisma().player.create({ data: { tokenHash: hashSecret(token) } });
  return token;
}

export type PlayerRow = { id: number; nickname: string | null };

export async function findPlayer(token: unknown): Promise<PlayerRow | null> {
  if (!isToken(token)) return null;
  return getPrisma().player.findUnique({
    where: { tokenHash: hashSecret(token) },
    select: { id: true, nickname: true },
  });
}

export type NicknameResult = { ok: true; nickname: string } | { ok: false; error: string };

export async function setNickname(player: PlayerRow, raw: unknown): Promise<NicknameResult> {
  const check = checkNickname(raw);
  if (!check.ok) return check;
  try {
    await getPrisma().player.update({
      where: { id: player.id },
      data: { nickname: check.nickname, nicknameKey: check.key },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Tuhle přezdívku už někdo má. Zkus jinou." };
    }
    throw error;
  }
  return { ok: true, nickname: check.nickname };
}
