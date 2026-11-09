import { fail, guard, ok } from "@/lib/api";
import { findPlayer } from "@/lib/player-server";

/** The player's public nickname (or null). */
export async function POST(request: Request) {
  const input = await guard(request, "read");
  if ("response" in input) return input.response;
  const player = await findPlayer(input.body.token);
  if (!player) return fail("Neznámý hráč.", 404);
  return ok({ nickname: player.nickname });
}
