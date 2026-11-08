import { Suspense } from "react";
import Link from "next/link";

import { CrownMark } from "@/components/ornaments";
import { SiteNav, SiteNavLinks } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-navy/95 text-parchment shadow-md backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <CrownMark className="h-5 w-7 shrink-0 text-gold" />
          <span className="truncate font-heading text-2xl leading-none font-bold tracking-wide">
            Český král
          </span>
        </Link>
        {/* The current path is known only per request – stream the active state in. */}
        <Suspense fallback={<SiteNavLinks pathname={null} />}>
          <SiteNav />
        </Suspense>
      </div>
      {/* gilded rule under the header */}
      <div className="gilt h-[3px]" aria-hidden />
    </header>
  );
}
