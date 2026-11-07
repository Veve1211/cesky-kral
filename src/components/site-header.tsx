import Link from "next/link";
import { Zap } from "lucide-react";

import { CrownMark } from "@/components/ornaments";

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
        <nav className="flex shrink-0 items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="rounded-lg px-2.5 py-2 transition-colors hover:bg-white/10"
          >
            Sbírka
          </Link>
          <Link
            href="/rychlovka"
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-gold transition-colors hover:bg-white/10"
          >
            <Zap className="size-4" aria-hidden />
            Rychlovka
          </Link>
        </nav>
      </div>
      {/* gilded rule under the header */}
      <div className="gilt h-[3px]" aria-hidden />
    </header>
  );
}
