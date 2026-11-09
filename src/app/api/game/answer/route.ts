import { fail, guard, ok } from "@/lib/api";
import { answerQuick, answerTimeline, answerWhoFirst } from "@/lib/game-server";
import { findPlayer } from "@/lib/player-server";

/**
 * One answer in a scored game. Reads only the fields of that game (session,
 * question + answer / choice / order) – a "score" or "streak" is never read.
 */
export async function POST(request: Request) {
  const input = await guard(request, "answer");
  if ("response" in input) return input.response;
  const { token, mode, sessionId } = input.body;
  const player = await findPlayer(token);
  if (!player) return fail("Neznámý hráč.", 404);
  const result =
    mode === "quick"
      ? await answerQuick(player, sessionId, input.body.questionId, input.body.answerId)
      : mode === "who-first"
        ? await answerWhoFirst(player, sessionId, input.body.choice)
        : mode === "timeline"
          ? await answerTimeline(player, sessionId, input.body.order)
          : ({ ok: false, error: "Neznámá hra." } as const);
  return result.ok ? ok({ result }) : fail(result.error, 409);
}
