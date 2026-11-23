import "server-only";
import { NextResponse } from "next/server";

import { LIMITS, rateLimit } from "@/lib/rate-limit";

// Helpers for the JSON API routes (src/app/api). Every route reads a small
// JSON body, validates every field itself and never trusts numbers like a
// score from the browser – it does not even read them.

export type ApiError = { ok: false; error: string };

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error } satisfies ApiError, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function ok<T extends object>(data: T) {
  return NextResponse.json({ ok: true, ...data }, { headers: { "Cache-Control": "no-store" } });
}

export const TOO_MANY = "Moc pokusů najednou. Chvilku počkej a zkus to znovu.";

/** Parses a JSON object body of at most `maxBytes`; null for anything else. */
export async function readJson(request: Request, maxBytes = 4_000): Promise<Record<string, unknown> | null> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  const text = await readLimited(request, maxBytes);
  if (text === null) return null;
  try {
    const data: unknown = JSON.parse(text);
    return typeof data === "object" && data !== null && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Reads the body as text but stops as soon as it is larger than `maxBytes`, so an
 * oversized request never ends up whole in the server's memory.
 */
async function readLimited(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

/** Rate limit + JSON body in one step. */
export async function guard(
  request: Request,
  bucket: keyof typeof LIMITS,
  maxBytes?: number,
): Promise<{ body: Record<string, unknown> } | { response: NextResponse }> {
  if (!rateLimit(bucket, request.headers)) return { response: fail(TOO_MANY, 429) };
  const body = await readJson(request, maxBytes);
  if (!body) return { response: fail("Neplatný požadavek.") };
  return { body };
}
