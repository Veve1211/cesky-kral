import Link from "next/link";
import { Zap } from "lucide-react";

import { CrownMark } from "@/components/ornaments";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-navy/95 text-parchment shadow-md backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 min-[400px]:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <CrownMark className="h-5 w-7 shrink-0 text-gold max-[359px]:hidden" />
          <span className="truncate font-heading text-xl leading-none min-[400px]:text-2xl font-bold tracking-wide">
            Český král
          </span>
        </Link>
        <nav className="flex shrink-0 items-center text-[13px] font-medium min-[400px]:gap-1 min-[400px]:text-sm">
          <Link
            href="/"
            className="rounded-lg px-1.5 py-2 min-[400px]:px-2 transition-colors hover:bg-white/10 sm:px-2.5"
          >
            Galerie
          </Link>
          <Link
            href="/sbirka"
            className="rounded-lg px-1.5 py-2 min-[400px]:px-2 transition-colors hover:bg-white/10 sm:px-2.5"
          >
            <span className="sm:hidden">Sbírka</span>
            <span className="hidden sm:inline">Moje sbírka</span>
          </Link>
          <Link
            href="/rychlovka"
            className="flex items-center gap-1 rounded-lg px-1.5 py-2 min-[400px]:px-2 text-gold sm:px-2.5 transition-colors hover:bg-white/10"
          >
            <Zap className="size-4 max-[359px]:hidden" aria-hidden />
            Rychlovka
          </Link>
        </nav>
      </div>
      {/* gilded rule under the header */}
      <div className="gilt h-[3px]" aria-hidden />
    </header>
  );
}
