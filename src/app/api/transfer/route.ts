import { fail, guard, ok } from "@/lib/api";
import { findPlayer, isToken } from "@/lib/player-server";
import { createTransfer } from "@/lib/transfer-server";

/** Creates a short single-use code with a snapshot of the browser progress. */
export async function POST(request: Request) {
  const input = await guard(request, "transferCreate", 450_000);
  if ("response" in input) return input.response;
  const { token, payload } = input.body;
  const player = await findPlayer(token);
  if (!player || !isToken(token)) return fail("Neznámý hráč.", 404);
  const result = await createTransfer(player, token, payload);
  return result.ok ? ok({ code: result.code, expiresAt: result.expiresAt }) : fail(result.error, 422);
}
