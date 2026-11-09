import { fail, guard, ok } from "@/lib/api";
import { findPlayer, setNickname } from "@/lib/player-server";

/** Sets or changes the nickname (3–16 chars, filtered, unique). */
export async function POST(request: Request) {
  const input = await guard(request, "nickname");
  if ("response" in input) return input.response;
  const player = await findPlayer(input.body.token);
  if (!player) return fail("Neznámý hráč.", 404);
  const result = await setNickname(player, input.body.nickname);
  return result.ok ? ok({ nickname: result.nickname }) : fail(result.error, 422);
}
