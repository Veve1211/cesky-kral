"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { GoldenCount, useKingCards } from "@/components/collection-gallery";
import { KingCard } from "@/components/king-card";
import { CardCorners } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIsClient } from "@/lib/collection";
import { getRank } from "@/lib/game-rules";
import type { KingSummary } from "@/lib/kings";

/** Only the kings the player owns, with collection and golden counters. */
export function MyCollection({ kings }: { kings: KingSummary[] }) {
  const isClient = useIsClient();
  const cards = useKingCards(kings);
  const owned = cards.filter((king) => king.collected);
  const golden = owned.filter((king) => king.golden).length;
  const rank = getRank(owned.length, cards.length);

  // The collection lives in localStorage – unknown until hydration.
  if (!isClient) {
    return <div aria-busy="true" className="parchment h-40 animate-pulse rounded-2xl" />;
  }

  return (
    <>
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
              {owned.length} z {cards.length}
            </strong>
          </p>
          <Progress value={owned.length} max={cards.length} label="Získaní králové" />
          <GoldenCount golden={golden} total={cards.length} />
        </div>
      </section>

      {owned.length === 0 ? (
        <section className="parchment relative flex flex-col items-center gap-4 rounded-2xl p-8 text-center">
          <CardCorners className="m-1 size-7 text-gold-dark" />
          <p className="font-heading text-2xl font-bold">Sbírka je zatím prázdná</p>
          <p className="max-w-sm text-muted-foreground">
            Vyber si panovníka v galerii a vyhraj jeho kartu. Pak se ti tu
            odemkne i zlaté kolo.
          </p>
          <Button asChild variant="accent" size="lg">
            <Link href="/">Do galerie</Link>
          </Button>
        </section>
      ) : (
        <ul
          aria-label="Získaní panovníci"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5"
        >
          {owned.map((king, index) => (
            <li
              key={king.slug}
              className="last:odd:col-span-2 last:odd:mx-auto last:odd:w-[calc(50%-0.375rem)] sm:last:odd:col-span-1 sm:last:odd:mx-0 sm:last:odd:w-auto"
            >
              <KingCard king={king} index={index} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
