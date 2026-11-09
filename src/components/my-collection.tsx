"use client";

import Link from "next/link";
import { Swords, Zap } from "lucide-react";

import {
  CollectionStatus,
  GoldenCount,
  KingGrid,
  useCollectionSummary,
} from "@/components/collection-summary";
import { CardCorners } from "@/components/ornaments";
import { MyCrestCard } from "@/components/my-crest-card";
import { PlayerPanel } from "@/components/player-panel";
import { ReignTimeline } from "@/components/reign-timeline";
import { RoyalCelebration } from "@/components/royal-celebration";
import { Button } from "@/components/ui/button";
import { useCollectionReady } from "@/lib/collection";
import type { KingSummary } from "@/lib/kings";

/** "Moje sbírka" – the player's collected kings and the ones still missing. */
export function MyCollection({ kings }: { kings: KingSummary[] }) {
  const ready = useCollectionReady();
  const { cards, collected, golden, total, rank, complete } = useCollectionSummary(kings);

  // localStorage is only readable after hydration – show a placeholder until then.
  if (!ready) return <MyCollectionSkeleton />;

  if (total === 0) {
    return <p className="text-center text-muted-foreground">Zatím tu nejsou žádní panovníci.</p>;
  }

  const owned = cards.filter((king) => king.collected);
  const missing = cards.filter((king) => !king.collected);
  const firstKing = cards[0];

  return (
    <>
      <MyCrestCard kingSlugs={kings.map((king) => king.slug)} />

      {complete ? (
        <RoyalCelebration total={total}>
          <GoldenCount golden={golden} total={total} />
        </RoyalCelebration>
      ) : (
        <CollectionStatus rank={rank} collected={collected} golden={golden} total={total} />
      )}

      <ReignTimeline variant="full" kings={kings} />

      {owned.length === 0 ? (
        <section className="parchment relative flex flex-col items-center gap-4 rounded-2xl px-6 py-10 text-center">
          <CardCorners className="m-1 size-8 text-gold-dark" />
          <h2 className="text-3xl font-bold">Sbírka je zatím prázdná</h2>
          <p className="max-w-sm text-ink/85">
            Odpověz správně aspoň na čtyři otázky z pěti a první karta je tvoje.
            Začni tam, kde začínají české dějiny.
          </p>
          <Button asChild variant="accent" size="lg">
            <Link href={`/kral/${firstKing.slug}`}>
              <Swords aria-hidden />
              Hrát o kartu: {firstKing.name}
            </Link>
          </Button>
        </section>
      ) : (
        <section aria-labelledby="owned-heading" className="flex flex-col gap-5">
          <h2 id="owned-heading" className="text-center text-4xl font-bold sm:text-left">
            Získaní panovníci
          </h2>
          <p className="-mt-3 text-center text-sm text-muted-foreground sm:text-left">
            Klepni na kartu a přečti si kroniku.
          </p>
          <KingGrid cards={owned} />
        </section>
      )}

      {missing.length > 0 && (
        <section aria-labelledby="missing-heading" className="flex flex-col gap-5">
          <h2 id="missing-heading" className="text-center text-4xl font-bold sm:text-left">
            Ještě chybí
          </h2>
          <KingGrid cards={missing} />
        </section>
      )}

      <PlayerPanel />

      {complete && (
        <div className="flex justify-center">
          <Button asChild variant="accent" size="lg">
            <Link href="/rychlovka">
              <Zap aria-hidden />
              Rychlovka
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export function MyCollectionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Načítám sbírku" className="flex flex-col gap-10">
      <div className="parchment h-28 animate-pulse rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-navy/80" />
        ))}
      </div>
    </div>
  );
}
