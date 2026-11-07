import Link from "next/link";
import { Crown, Zap } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-gold/30 bg-navy/95 text-parchment backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="size-5 text-gold" aria-hidden />
          <span className="font-heading text-lg font-bold tracking-wide">
            Český král
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
          >
            Sbírka
          </Link>
          <Link
            href="/rychlovka"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-gold transition-colors hover:bg-white/10"
          >
            <Zap className="size-4" aria-hidden />
            Rychlovka
          </Link>
        </nav>
      </div>
    </header>
  );
}
