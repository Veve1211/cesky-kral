import { fail, guard, ok } from "@/lib/api";
import { redeemTransfer } from "@/lib/transfer-server";

/** Redeems a code once: returns the progress and the player's token. */
export async function POST(request: Request) {
  const input = await guard(request, "transferRedeem");
  if ("response" in input) return input.response;
  const result = await redeemTransfer(input.body.code);
  return result.ok ? ok({ token: result.token, payload: result.payload }) : fail(result.error, 404);
}
