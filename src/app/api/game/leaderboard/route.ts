import { connection } from "next/server";

import { fail, ok, TOO_MANY } from "@/lib/api";
import { getGameLeaderboard } from "@/lib/game-server";
import { isGameMode } from "@/lib/games";
import { rateLimit } from "@/lib/rate-limit";

/** Weekly or all-time leaderboard of a game (public: nickname, score, time). */
export async function GET(request: Request) {
  await connection();
  if (!rateLimit("read", request.headers)) return fail(TOO_MANY, 429);
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const period = url.searchParams.get("period") === "all" ? "all" : "week";
  if (!isGameMode(mode)) return fail("Neznámá hra.");
  return ok({ mode, period, ...(await getGameLeaderboard(mode, period)) });
}
