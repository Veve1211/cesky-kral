import { fail, guard, ok } from "@/lib/api";
import { parseCrest } from "@/lib/heraldry";
import { findPlayer } from "@/lib/player-server";
import { getPrisma } from "@/lib/prisma";

/**
 * Saves the player's coat of arms for the leaderboards: only its parameters
 * (allowed parts, rule of tincture and the motto filter are checked again here).
 */
export async function POST(request: Request) {
  const input = await guard(request, "nickname");
  if ("response" in input) return input.response;
  const player = await findPlayer(input.body.token);
  if (!player) return fail("Neznámý hráč.", 404);
  const crest = parseCrest(input.body.crest);
  if (!crest) return fail("Erb nejde uložit: neplatný díl, barva proti pravidlu tinktur nebo nevhodné heslo.", 422);
  await getPrisma().player.update({ where: { id: player.id }, data: { crest } });
  return ok({ crest });
}
