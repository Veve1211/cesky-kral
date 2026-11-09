import { fail, guard, ok } from "@/lib/api";
import { startDaily } from "@/lib/daily-server";
import { findPlayer } from "@/lib/player-server";

/** Starts or resumes today's attempt; the clock starts at the first call. */
export async function POST(request: Request) {
  const input = await guard(request, "read");
  if ("response" in input) return input.response;
  const player = await findPlayer(input.body.token);
  if (!player) return fail("Neznámý hráč.", 404);
  const result = await startDaily(player, input.body.date, input.body.offlineAnswered);
  return result.ok ? ok({ state: result.state }) : fail(result.error, 409);
}
