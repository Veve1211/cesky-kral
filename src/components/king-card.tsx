"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { ChronicleDialog } from "@/components/chronicle-dialog";
import { KingPortrait } from "@/components/king-portrait";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners, CrownMark } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import type { Chronicle } from "@/lib/chronicle";
import { formatReign, type KingTitle } from "@/lib/king-display";
import { cn } from "@/lib/utils";

export type KingCardData = {
  slug: string;
  name: string;
  initial: string;
  title: KingTitle;
  isLegend: boolean;
  reignFrom: number | null;
  reignTo: number | null;
  dynasty: string;
  imageUrl: string | null;
  chronicle: Chronicle | null;
  collected: boolean;
};

const LINK_CLASS =
  "group block h-full rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-ring/60";

export function KingCard({ king, index }: { king: KingCardData; index: number }) {
  const label = `${king.title} ${king.name}${king.isLegend ? " (pověst)" : ""}`;
  const chronicle = king.chronicle;

  // Collected king with a chronicle: the whole card opens the chronicle.
  // The button is stretched over the card (valid HTML: no headings inside it).
  if (king.collected && chronicle) {
    return (
      <div className="group h-full rounded-2xl">
        <KingCardFace
          king={king}
          index={index}
          action={
            <ChronicleDialog
              king={{ ...king, chronicle }}
              trigger={
                <button
                  type="button"
                  aria-label={`${label} – ve sbírce, přečíst kroniku`}
                  className="cursor-pointer text-xs font-semibold text-gold-dark underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-4 focus-visible:after:ring-ring/60"
                >
                  📜 Přečíst kroniku
                </button>
              }
              footer={
                <Button asChild variant="outline">
                  <Link href={`/kral/${king.slug}`}>
                    <RotateCcw aria-hidden />
                    Zahrát si znovu
                  </Link>
                </Button>
              }
            />
          }
        />
      </div>
    );
  }

  return (
    <Link
      href={`/kral/${king.slug}`}
      aria-label={`${label}${king.collected ? " – ve sbírce" : " – hrát o kartu"}`}
      className={LINK_CLASS}
    >
      <KingCardFace king={king} index={index} />
    </Link>
  );
}

function KingCardFace({
  king,
  index,
  action,
}: {
  king: KingCardData;
  index: number;
  /** Extra control under "Ve sbírce" (the chronicle button). */
  action?: ReactNode;
}) {
  const locked = !king.collected;
  const reign = formatReign(king);

  return (
    <article
      className={cn(
        "animate-card-reveal relative flex h-full flex-col items-center gap-2.5 rounded-2xl p-3 pb-4 transition-all duration-300 group-hover:-translate-y-1 sm:p-4",
        locked ? "bg-navy text-parchment shadow-lg" : "parchment text-navy",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 90}ms` }}
    >
      <CardCorners className={cn("m-1 size-8", locked ? "text-gold/50" : "text-gold-dark")} />

      <div className="relative w-full">
        <KingPortrait
          name={king.name}
          initial={king.initial}
          imageUrl={king.imageUrl}
          locked={locked}
          priority={index < 2}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {king.isLegend && (
          <LegendBadge className="absolute -bottom-2 left-1/2 -translate-x-1/2" />
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 text-center">
        <p
          className={cn(
            "text-[10px] font-semibold tracking-[0.2em] uppercase",
            locked ? "text-gold/80" : "text-gold-dark",
            king.isLegend && "mt-1.5",
          )}
        >
          {king.title}
        </p>
        <h3 className="text-xl leading-tight font-bold sm:text-2xl">{king.name}</h3>
        {reign && (
          <p className={cn("text-xs", locked ? "text-parchment/70" : "text-muted-foreground")}>
            {reign}
          </p>
        )}
      </div>

      {locked ? (
        <div className="mt-auto flex w-full flex-col items-center gap-2">
          <span className="gilt w-full rounded-lg px-3 py-2 text-center text-sm font-bold text-navy shadow-md transition-[background-position] duration-700 group-hover:bg-right">
            Hrát o kartu
          </span>
          {king.chronicle && (
            <p className="text-center text-[11px] leading-snug text-parchment/70">
              Kronika se odemkne, až panovníka získáš.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-auto flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-gold">
            <CrownMark className="h-3 w-4 text-gold" />
            Ve sbírce
          </span>
          {action}
        </div>
      )}
    </article>
  );
}
