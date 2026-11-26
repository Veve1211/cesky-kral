import { indexNowKey } from "@/lib/indexnow";
import { isIndexable } from "@/lib/site-url";

export function GET() {
  const key = indexNowKey();
  if (!isIndexable() || !key) return new Response(null, { status: 404 });

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
