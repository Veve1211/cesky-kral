"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

import {
  CollectionStatus,
  GoldenCount,
  KingGrid,
  useCollectionSummary,
} from "@/components/collection-summary";
import { MyCrestCard } from "@/components/my-crest-card";
import { RoyalCelebration } from "@/components/royal-celebration";
import { Button } from "@/components/ui/button";
import type { KingSummary } from "@/lib/kings";

export function CollectionGallery({ kings }: { kings: KingSummary[] }) {
  const { cards, collected, golden, total, rank, complete } = useCollectionSummary(kings);

  return (
    <>
      {complete ? (
        <RoyalCelebration total={total}>
          <GoldenCount golden={golden} total={total} />
          <Button asChild variant="accent" size="lg" className="mt-2">
            <Link href="/rychlovka">
              <Zap aria-hidden />
              Rychlovka
            </Link>
          </Button>
        </RoyalCelebration>
      ) : (
        <CollectionStatus
          rank={rank}
          collected={collected}
          golden={golden}
          total={total}
          action={
            <Button asChild variant="accent">
              <Link href="/rychlovka">
                <Zap aria-hidden />
                Rychlovka
              </Link>
            </Button>
          }
        />
      )}

      {/* Right next to the rank: the player's crest (or an invitation to make one). */}
      <MyCrestCard kingSlugs={kings.map((king) => king.slug)} className="-mt-4 sm:-mt-6" />

      <section aria-labelledby="gallery-heading" className="flex flex-col gap-5">
        <h2 id="gallery-heading" className="text-center text-4xl font-bold sm:text-left">
          Galerie panovníků
        </h2>
        {cards.length === 0 ? (
          <p className="text-muted-foreground">Zatím tu nejsou žádní panovníci.</p>
        ) : (
          <KingGrid cards={cards} />
        )}
      </section>
    </>
  );
}
