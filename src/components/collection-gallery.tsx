"use client";

import Link from "next/link";
import { Shield, Zap } from "lucide-react";

import { KingCard } from "@/components/king-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCollection } from "@/lib/collection";
import { getRank } from "@/lib/game-rules";
import { kingInitial } from "@/lib/king-initial";
import type { KingSummary } from "@/lib/kings";

export function CollectionGallery({ kings }: { kings: KingSummary[] }) {
  const collection = useCollection();
  const owned = new Set(collection);

  const cards = kings.map((king) => ({
    ...king,
    initial: kingInitial(king.name),
    collected: owned.has(king.slug),
  }));
  // Count only kings that exist in the DB (ignores stale slugs).
  const collected = cards.filter((king) => king.collected).length;
  const rank = getRank(collected, cards.length);

  return (
    <>
      <section className="flex flex-col gap-4 rounded-2xl border border-gold/40 bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-navy text-gold">
            <Shield className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Tvoje hodnost</p>
            <p className="font-heading text-xl font-bold">{rank}</p>
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
        </div>
        <Button asChild variant="accent">
          <Link href="/rychlovka">
            <Zap aria-hidden />
            Rychlovka
          </Link>
        </Button>
      </section>

      <section aria-labelledby="gallery-heading" className="flex flex-col gap-4">
        <h2 id="gallery-heading" className="text-2xl font-bold">
          Galerie
        </h2>
        {cards.length === 0 ? (
          <p className="text-muted-foreground">Zatím tu nejsou žádní panovníci.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {cards.map((king, index) => (
              <li key={king.slug}>
                <KingCard king={king} index={index} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
