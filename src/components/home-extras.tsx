"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { useCollectionSummary } from "@/components/collection-summary";
import { CrestSvg } from "@/components/crest-svg";
import { useCollectionReady } from "@/lib/collection";
import { useSavedCrest } from "@/lib/crest-progress";
import { DEFAULT_CREST } from "@/lib/heraldry";
import type { KingSummary } from "@/lib/kings";

/**
 * Home page, top: the player's rank as a small pill (links to Moje sbírka).
 * Before hydration the space is kept so nothing jumps.
 */
export function RankPill({ kings }: { kings: KingSummary[] }) {
  const ready = useCollectionReady();
  const { rank, collected, total } = useCollectionSummary(kings);
  return (
    <section aria-label="Postup sbírky" className="flex justify-center">
      <Link
        href="/sbirka"
        data-testid="rank-pill"
        className="parchment flex h-9 items-center gap-2 rounded-full px-3 text-sm ring-1 ring-gold/60 outline-none hover:ring-gold focus-visible:ring-4 focus-visible:ring-ring/60"
      >
        <Shield className="size-4 shrink-0 text-gold-dark" aria-hidden />
        <span className={ready ? undefined : "invisible"}>
          <strong className="font-heading text-base">{rank}</strong>
          <span className="text-muted-foreground">
            {" "}
            · Ve sbírce: {collected} z {total}
          </span>
        </span>
      </Link>
    </section>
  );
}

/** Home page, bottom: a small crest emblem (→ Můj erb) next to the "Kdo vládl dřív?" link. */
export function HomeMoreLinks() {
  const ready = useCollectionReady();
  const saved = useSavedCrest();
  const design = (ready && saved) || DEFAULT_CREST;
  const linkClass =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-navy underline decoration-gold underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-4 focus-visible:ring-ring/60";
  return (
    <nav aria-label="Další na Českém králi" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <Link href="/muj-erb" data-testid="home-crest-link" className={linkClass}>
        <CrestSvg design={design} withMotto={false} label="" className="h-8 w-auto" />
        Můj erb
      </Link>
      <Link href="/kdo-driv" className={linkClass}>
        <span aria-hidden>⏳</span>
        Kdo vládl dřív?
      </Link>
    </nav>
  );
}
