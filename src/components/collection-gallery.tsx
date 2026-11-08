"use client";

import Link from "next/link";
import { Shield, Zap } from "lucide-react";

import { KingCard, type KingCardData } from "@/components/king-card";
import { CardCorners } from "@/components/ornaments";
import { RoyalCelebration } from "@/components/royal-celebration";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCollection } from "@/lib/collection";
import { getRank } from "@/lib/game-rules";
import { kingInitial } from "@/lib/king-initial";
import type { KingSummary } from "@/lib/kings";

export function CollectionGallery({ kings }: { kings: KingSummary[] }) {
  const cards = useKingCards(kings);
  // Count only kings that exist in the DB (ignores stale slugs).
  const collected = cards.filter((king) => king.collected).length;
  const golden = cards.filter((king) => king.golden).length;
  const rank = getRank(collected, cards.length);
  const complete = cards.length > 0 && collected === cards.length;

  return (
    <>
      {complete ? (
        <RoyalCelebration total={cards.length}>
          <GoldenCount golden={golden} total={cards.length} />
          <Button asChild variant="accent" size="lg" className="mt-2">
            <Link href="/rychlovka">
              <Zap aria-hidden />
              Rychlovka
            </Link>
          </Button>
        </RoyalCelebration>
      ) : (
        <section className="parchment relative flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
          <CardCorners className="m-1 size-7 text-gold-dark" />
          <div className="flex items-center gap-3">
            <span className="gilt flex size-12 items-center justify-center rounded-full p-[3px] shadow">
              <span className="flex size-full items-center justify-center rounded-full bg-navy text-gold">
                <Shield className="size-5" aria-hidden />
              </span>
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Tvoje hodnost</p>
              <p className="font-heading text-2xl leading-tight font-bold">{rank}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm">
              Ve sbírce:{" "}
              <strong>
                {collected} z {cards.length}
              </strong>
            </p>
            <Progress value={collected} max={cards.length} label="Získaní králové" />
            <GoldenCount golden={golden} total={cards.length} />
          </div>
          <Button asChild variant="accent">
            <Link href="/rychlovka">
              <Zap aria-hidden />
              Rychlovka
            </Link>
          </Button>
        </section>
      )}

      <section aria-labelledby="gallery-heading" className="flex flex-col gap-5">
        <h2 id="gallery-heading" className="text-center text-4xl font-bold sm:text-left">
          Galerie panovníků
        </h2>
        {cards.length === 0 ? (
          <p className="text-muted-foreground">Zatím tu nejsou žádní panovníci.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {cards.map((king, index) => (
              <li
                key={king.slug}
                className="last:odd:col-span-2 last:odd:mx-auto last:odd:w-[calc(50%-0.375rem)] sm:last:odd:col-span-1 sm:last:odd:mx-0 sm:last:odd:w-auto"
              >
                <KingCard king={king} index={index} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Gallery cards with the player's collected / golden state. */
export function useKingCards(kings: KingSummary[]): KingCardData[] {
  const { kings: ownedSlugs, golden: goldenSlugs } = useCollection();
  const owned = new Set(ownedSlugs);
  const golden = new Set(goldenSlugs);
  return kings.map((king) => ({
    ...king,
    initial: kingInitial(king.name),
    collected: owned.has(king.slug),
    golden: owned.has(king.slug) && golden.has(king.slug),
  }));
}

export function GoldenCount({ golden, total }: { golden: number; total: number }) {
  return (
    <p className="text-sm">
      <span aria-hidden>✨ </span>
      Zlatých:{" "}
      <strong>
        {golden} z {total}
      </strong>
    </p>
  );
}
