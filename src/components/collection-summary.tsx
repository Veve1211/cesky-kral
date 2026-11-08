"use client";

import type { ReactNode } from "react";
import { Shield } from "lucide-react";

import { KingCard, type KingCardData } from "@/components/king-card";
import { CardCorners } from "@/components/ornaments";
import { Progress } from "@/components/ui/progress";
import { useCollection } from "@/lib/collection";
import { getRank, type Rank } from "@/lib/game-rules";
import { kingInitial } from "@/lib/king-initial";
import type { KingSummary } from "@/lib/kings";

export type CollectionSummary = {
  cards: KingCardData[];
  collected: number;
  total: number;
  rank: Rank;
  complete: boolean;
};

/** Merges kings from the DB with the player's collection (localStorage). */
export function useCollectionSummary(kings: KingSummary[]): CollectionSummary {
  const owned = new Set(useCollection());
  const cards = kings.map((king) => ({
    ...king,
    initial: kingInitial(king.name),
    collected: owned.has(king.slug),
  }));
  // Count only kings that exist in the DB (ignores stale slugs).
  const collected = cards.filter((king) => king.collected).length;
  return {
    cards,
    collected,
    total: cards.length,
    rank: getRank(collected, cards.length),
    complete: cards.length > 0 && collected === cards.length,
  };
}

/** Parchment panel with the player's rank and collection progress. */
export function CollectionStatus({
  rank,
  collected,
  total,
  action,
}: {
  rank: Rank;
  collected: number;
  total: number;
  action?: ReactNode;
}) {
  return (
    <section
      aria-label="Postup sbírky"
      className="parchment relative flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6"
    >
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
            {collected} z {total}
          </strong>
        </p>
        <Progress value={collected} max={total} label="Získaní panovníci" />
      </div>
      {action}
    </section>
  );
}

/** Grid of king cards (2 columns on mobile, 3 from `sm`; a lone last card is centred). */
export function KingGrid({ cards }: { cards: KingCardData[] }) {
  return (
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
  );
}
