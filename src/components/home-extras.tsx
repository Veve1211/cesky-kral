"use client";

import Link from "next/link";

import { CollectionStatus, useCollectionSummary } from "@/components/collection-summary";
import { CardCorners } from "@/components/ornaments";
import { CrestSvg } from "@/components/crest-svg";
import { useCollectionReady } from "@/lib/collection";
import { useSavedCrest } from "@/lib/crest-progress";
import { DEFAULT_CREST } from "@/lib/heraldry";
import type { KingSummary } from "@/lib/kings";

/**
 * Home page, top: the rank as a proper block (rank, cards collected, golden
 * cards). Compact on phones so the main button below stays above the fold.
 */
export function HomeRank({ kings }: { kings: KingSummary[] }) {
  const { rank, collected, golden, total } = useCollectionSummary(kings);
  return (
    <CollectionStatus
      rank={rank}
      collected={collected}
      golden={golden}
      total={total}
      showGolden={false}
      className="w-full max-w-xl gap-2 p-4 text-left max-sm:[&_.font-heading]:text-xl"
    />
  );
}

/** Home page, bottom: two cards – the player's crest (→ Můj erb) and "Kdo vládl dřív?". */
export function HomeMoreLinks() {
  const ready = useCollectionReady();
  const saved = useSavedCrest();
  const design = (ready && saved) || DEFAULT_CREST;
  const card =
    "parchment group relative flex items-center gap-4 rounded-2xl p-4 ring-1 ring-gold/50 outline-none transition-transform hover:-translate-y-0.5 hover:ring-gold focus-visible:ring-4 focus-visible:ring-ring/60";
  return (
    <nav aria-label="Další na Českém králi" className="grid gap-4 sm:grid-cols-2">
      <Link href="/muj-erb" data-testid="home-crest-link" aria-label="Můj erb" className={card}>
        <CardCorners className="m-1 size-6 text-gold-dark" />
        <CrestSvg design={design} withMotto={false} label="" className="h-20 w-auto shrink-0 drop-shadow" />
        <span className="flex flex-col gap-1">
          <span className="font-heading text-2xl leading-tight font-bold">Můj erb</span>
          <span className="text-sm text-ink/80">{saved ? "Ozdob svůj štít novými díly." : "Navrhni si vlastní rodový erb."}</span>
        </span>
      </Link>
      <Link href="/kdo-driv" aria-label="Kdo vládl dřív?" className={card}>
        <CardCorners className="m-1 size-6 text-gold-dark" />
        <span
          aria-hidden
          className="gilt flex size-20 shrink-0 items-center justify-center rounded-full p-[3px] shadow"
        >
          <span className="flex size-full items-center justify-center rounded-full bg-navy text-4xl">⏳</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-heading text-2xl leading-tight font-bold">Kdo vládl dřív?</span>
          <span className="text-sm text-ink/80">Dva panovníci, jedna otázka: kdo byl první?</span>
        </span>
      </Link>
    </nav>
  );
}
