import { connection } from "next/server";

import { fail, ok, TOO_MANY } from "@/lib/api";
import { dailyDateKey } from "@/lib/daily";
import { getDailyLeaderboard } from "@/lib/daily-server";
import { rateLimit } from "@/lib/rate-limit";

/** Today's leaderboard (public: nickname, score, time – nothing else). */
export async function GET(request: Request) {
  await connection();
  if (!rateLimit("read", request.headers)) return fail(TOO_MANY, 429);
  const date = dailyDateKey();
  return ok({ date, ...(await getDailyLeaderboard(date)) });
}
