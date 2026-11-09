import { fail, guard, ok } from "@/lib/api";
import { answerDaily } from "@/lib/daily-server";
import { findPlayer } from "@/lib/player-server";

/**
 * Checks one answer of today's challenge and records it. Reads only
 * token, date, questionId and answerId – anything else in the body (a
 * "score", "marks", "time"…) is ignored.
 */
export async function POST(request: Request) {
  const input = await guard(request, "answer");
  if ("response" in input) return input.response;
  const { token, date, questionId, answerId } = input.body;
  const player = await findPlayer(token);
  if (!player) return fail("Neznámý hráč.", 404);
  const result = await answerDaily(player, date, questionId, answerId);
  return result.ok ? ok({ result }) : fail(result.error, 409);
}
