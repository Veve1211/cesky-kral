import { fail, ok, TOO_MANY } from "@/lib/api";
import { createPlayer } from "@/lib/player-server";
import { rateLimit } from "@/lib/rate-limit";

/** Creates an anonymous player and returns its secret token (only once). */
export async function POST(request: Request) {
  if (!rateLimit("createPlayer", request.headers)) return fail(TOO_MANY, 429);
  return ok({ token: await createPlayer() });
}
