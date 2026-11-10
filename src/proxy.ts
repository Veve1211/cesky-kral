import { NextResponse, type NextRequest } from "next/server";

import { crestFromQuery } from "@/lib/heraldry";
import { getPrisma } from "@/lib/prisma";
import { isValidSlug } from "@/lib/slug";

/** Check existence (rulers) or validity (shared crest) before the streamed page commits its HTTP 200 headers. */
export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  // A shared coat of arms lives only in its link: a broken link is a real 404.
  if (request.nextUrl.pathname === "/erb") {
    const crest = crestFromQuery(Object.fromEntries(request.nextUrl.searchParams));
    return crest ? NextResponse.next() : missingKing(request);
  }

  let slug: string;
  try {
    slug = decodeURIComponent(request.nextUrl.pathname.split("/")[2]);
  } catch {
    return missingKing(request);
  }
  if (!isValidSlug(slug)) return missingKing(request);

  const king = await getPrisma().king.findUnique({
    where: { slug },
    select: { slug: true },
  });
  return king ? NextResponse.next() : missingKing(request);
}

function missingKing(request: NextRequest) {
  // An unmatched local path renders the existing root not-found UI, without a redirect.
  return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
}

export const config = {
  matcher: ["/kral/:slug", "/kral/:slug/zlate-kolo", "/erb"],
};
