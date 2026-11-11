"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

import { KingGrid, useCollectionSummary } from "@/components/collection-summary";
import { RoyalCelebration } from "@/components/royal-celebration";
import { Button } from "@/components/ui/button";
import type { KingSummary } from "@/lib/kings";

export function CollectionGallery({ kings }: { kings: KingSummary[] }) {
  const { cards, total, complete } = useCollectionSummary(kings);

  return (
    <>
      {/* All rulers collected: the "Pán / Paní erbovní knihy" ceremony. The rank
          itself is the small pill at the top of the page. */}
      {complete && (
        <RoyalCelebration total={total}>
          <Button asChild variant="accent" size="lg" className="mt-2">
            <Link href="/rychlovka">
              <Zap aria-hidden />
              Rychlovka
            </Link>
          </Button>
        </RoyalCelebration>
      )}

      <section aria-labelledby="gallery-heading" className="flex flex-col gap-5">
        <h2 id="gallery-heading" className="text-center text-4xl font-bold sm:text-left">
          Galerie panovníků
        </h2>
        {/* Crowns of learning only in Moje sbírka, not on the home page. */}
        {cards.length === 0 ? (
          <p className="text-muted-foreground">Zatím tu nejsou žádní panovníci.</p>
        ) : (
          <KingGrid cards={cards.map((card) => ({ ...card, tier: 0 as const }))} />
        )}
      </section>
    </>
  );
}
