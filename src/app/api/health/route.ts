import { connection } from "next/server";

import { getPrisma } from "@/lib/prisma";

// Health check for uptime monitors and the hosting platform: 200 when the app
// and the database answer, 503 otherwise. Never returns error details.

const DB_TIMEOUT_MS = 3_000;
const HEADERS = { "Cache-Control": "no-store" };

async function databaseUp(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<false>((resolve) => {
    timer = setTimeout(() => resolve(false), DB_TIMEOUT_MS);
  });
  try {
    const query = getPrisma()
      .$queryRaw`SELECT 1`.then(() => true)
      .catch(() => false);
    return await Promise.race([query, timeout]);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  // Always checked at request time, never prerendered at build.
  await connection();
  const db = await databaseUp();
  return Response.json(
    { status: db ? "ok" : "error", db: db ? "ok" : "error" },
    { status: db ? 200 : 503, headers: HEADERS },
  );
}
