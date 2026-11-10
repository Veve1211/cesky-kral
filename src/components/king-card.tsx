"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { ChronicleDialog } from "@/components/chronicle-dialog";
import { GoldenBadge } from "@/components/golden-badge";
import { KingPortrait } from "@/components/king-portrait";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners, CrownMark } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import type { Chronicle } from "@/lib/chronicle";
import { formatReign, type KingTitle } from "@/lib/king-display";
import { TIER_SHORT, type Tier } from "@/lib/mastery";
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
  /** Won in the golden round (only meaningful when collected). */
  golden: boolean;
  /** "Koruna učenosti" – 0 none, 1 bronze, 2 silver, 3 gold. */
  tier: Tier;
};

const LINK_CLASS =
  "group block h-full rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-ring/60";

// Stretched over the whole card (`after:inset-0`), so a click anywhere triggers it.
const STRETCHED_CLASS =
  "cursor-pointer text-xs font-semibold text-gold-dark underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-4 focus-visible:after:ring-ring/60";

export function KingCard({ king, index }: { king: KingCardData; index: number }) {
  const crown = king.tier > 0 ? `, ${TIER_SHORT[king.tier as 1 | 2 | 3]} učenosti` : "";
  const label = `${king.title} ${king.name}${king.isLegend ? " (pověst)" : ""}${crown}`;
  const chronicle = king.chronicle;

  if (!king.collected) {
    return (
      <Link
        href={`/kral/${king.slug}`}
        aria-label={`${label} – hrát o kartu`}
        className={LINK_CLASS}
      >
        <KingCardFace king={king} index={index} />
      </Link>
    );
  }

  const status = king.golden ? "zlatá karta" : "ve sbírce";

  // Collected king: the whole card opens the chronicle (or the game when
  // there is no chronicle). The golden round button sits above the stretched
  // control, so there are no nested interactive elements.
  return (
    <div className="group h-full rounded-2xl">
      <KingCardFace
        king={king}
        index={index}
        action={
          chronicle ? (
            <ChronicleDialog
              king={{ ...king, chronicle }}
              trigger={
                <button
                  type="button"
                  aria-label={`${label} – ${status}, přečíst kroniku`}
                  className={STRETCHED_CLASS}
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
          ) : (
            <Link
              href={`/kral/${king.slug}`}
              aria-label={`${label} – ${status}, zahrát si znovu`}
              className={STRETCHED_CLASS}
            >
              Zahrát si znovu
            </Link>
          )
        }
        goldenAction={
          <Link
            href={`/kral/${king.slug}/zlate-kolo`}
            aria-label={`Mistrovské kolo: ${king.name}`}
            className="relative z-10 w-full rounded-lg border border-gold-dark/60 bg-navy px-2 py-1.5 text-center text-xs font-bold text-gold shadow-sm outline-none transition-colors hover:bg-navy/90 focus-visible:ring-4 focus-visible:ring-ring/60 sm:text-sm"
          >
            ✨ Mistrovské kolo
          </Link>
        }
      />
    </div>
  );
}

function KingCardFace({
  king,
  index,
  action,
  goldenAction,
}: {
  king: KingCardData;
  index: number;
  /** Extra control under "Ve sbírce" (the chronicle button). */
  action?: ReactNode;
  /** Golden round button (collected kings only). */
  goldenAction?: ReactNode;
}) {
  const locked = !king.collected;
  const golden = king.collected && king.golden;
  const reign = formatReign(king);

  return (
    <div
      className="animate-card-reveal relative h-full rounded-2xl transition-[translate] duration-300 group-hover:-translate-y-1"
      style={{ animationDelay: `${Math.min(index, 8) * 90}ms` }}
    >
      <div className={cn("h-full rounded-2xl", golden && "golden-frame")}>
        <article
          className={cn(
            "relative flex h-full flex-col items-center gap-2.5 rounded-2xl p-3 pb-4 sm:p-4",
            locked
              ? "bg-navy text-parchment shadow-lg"
              : golden
                ? "golden-sheet golden-sheen rounded-[12px] text-navy"
                : "parchment text-navy",
          )}
        >
          <CardCorners className={cn("m-1 size-8", locked ? "text-gold/50" : "text-gold-dark")} />

          {/* With a crown, the portrait moves down so the crown stays inside the card. */}
          <div className={cn("relative w-full", king.tier > 0 && "mt-7 sm:mt-8")}>
            <KingPortrait
              crown={king.tier}
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
            {/* Years stay hidden until the king is collected, so the gallery
                can't be used as a cheat sheet for "Kdo vládl dřív?". */}
            {reign && (
              <p
                data-testid="king-card-reign"
                className={cn("h-4 text-xs leading-4 tabular-nums", locked ? "text-parchment/70" : "text-muted-foreground")}
              >
                {locked ? (
                  <>
                    <span aria-hidden>???? – ????</span>
                    <span className="sr-only">roky jsou skryté</span>
                  </>
                ) : (
                  reign
                )}
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
            <div className="mt-auto flex w-full flex-col items-center gap-1.5">
              {golden ? (
                <GoldenBadge />
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-gold">
                  <CrownMark className="h-3 w-4 text-gold" />
                  Ve sbírce
                </span>
              )}
              {action}
              {goldenAction}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
