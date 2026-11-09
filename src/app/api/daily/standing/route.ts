import { fail, guard, ok } from "@/lib/api";
import { getDailyStanding } from "@/lib/daily-server";
import { findPlayer } from "@/lib/player-server";

/** The player's place in the daily leaderboard and the gap to the next place. */
export async function POST(request: Request) {
  const input = await guard(request, "read");
  if ("response" in input) return input.response;
  const player = await findPlayer(input.body.token);
  if (!player) return fail("Neznámý hráč.", 404);
  return ok({ standing: await getDailyStanding(player, input.body.date), nickname: player.nickname });
}
