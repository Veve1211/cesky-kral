import { fail, guard, ok } from "@/lib/api";
import { getPersonalBest } from "@/lib/game-server";
import { isGameMode } from "@/lib/games";
import { findPlayer } from "@/lib/player-server";

/** The player's personal record in a game (and nickname, for the form). */
export async function POST(request: Request) {
  const input = await guard(request, "read");
  if ("response" in input) return input.response;
  const { token, mode } = input.body;
  if (!isGameMode(mode)) return fail("Neznámá hra.");
  const player = await findPlayer(token);
  if (!player) return fail("Neznámý hráč.", 404);
  return ok({ best: await getPersonalBest(player, mode), nickname: player.nickname });
}
