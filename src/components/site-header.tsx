import { Suspense } from "react";
import Link from "next/link";

import { CrownMark } from "@/components/ornaments";
import { SiteNav, SiteNavLinks } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-navy/95 text-parchment shadow-md backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-1 px-3 min-[360px]:gap-2 min-[360px]:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-1.5 min-[360px]:gap-2">
          <CrownMark className="h-4 w-6 shrink-0 text-gold min-[360px]:h-5 min-[360px]:w-7" />
          <span className="truncate font-heading text-xl leading-none font-bold tracking-wide min-[360px]:text-2xl">
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
