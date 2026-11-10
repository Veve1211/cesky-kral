import { fail, guard, ok } from "@/lib/api";
import { startGame } from "@/lib/game-server";
import { isGameMode } from "@/lib/games";
import { findPlayer } from "@/lib/player-server";

/** Starts a scored game; the server picks the questions or rulers. */
export async function POST(request: Request) {
  const input = await guard(request, "read");
  if ("response" in input) return input.response;
  const { token, mode } = input.body;
  if (!isGameMode(mode)) return fail("Neznámá hra.");
  const player = await findPlayer(token);
  if (!player) return fail("Neznámý hráč.", 404);
  const game = await startGame(player, mode);
  return game ? ok({ game }) : fail("Hru teď nejde spustit.", 503);
}
