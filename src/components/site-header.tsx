import { Suspense } from "react";
import Link from "next/link";

import { CrownMark } from "@/components/ornaments";
import { SiteNav, SiteNavLinks } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-navy/95 text-parchment shadow-md backdrop-blur">
      {/* One line when logo and menu fit; otherwise the menu wraps onto a
          second line, so the logo stays whole and every label readable. */}
      <div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center justify-between gap-x-1 px-3 py-1 min-[390px]:gap-x-2 min-[390px]:px-4">
        <Link href="/" className="flex min-h-12 items-center gap-1.5 min-[390px]:gap-2">
          <CrownMark className="h-4 w-6 shrink-0 text-gold min-[390px]:h-5 min-[390px]:w-7" />
          <span className="font-heading text-xl leading-none font-bold tracking-wide whitespace-nowrap min-[390px]:text-2xl">
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
