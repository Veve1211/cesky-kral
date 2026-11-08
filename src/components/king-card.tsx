import Link from "next/link";

import { GoldenBadge } from "@/components/golden-badge";
import { KingPortrait } from "@/components/king-portrait";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners, CrownMark } from "@/components/ornaments";
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
  collected: boolean;
  golden: boolean;
};

export function KingCard({ king, index }: { king: KingCardData; index: number }) {
  const locked = !king.collected;
  const golden = king.collected && king.golden;
  const reign = formatReign(king);
  const status = locked ? "hrát o kartu" : golden ? "zlatá karta" : "ve sbírce";

  return (
    // The whole card is clickable through the stretched main link; the
    // golden round button sits above it (no nested links).
    <div
      className="group animate-card-reveal relative h-full rounded-2xl transition-[translate] duration-300 hover:-translate-y-1"
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
          <CardCorners
            className={cn("m-1 size-8", locked ? "text-gold/50" : "text-gold-dark")}
          />

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
            <h3 className="text-xl leading-tight font-bold sm:text-2xl">
              <Link
                href={`/kral/${king.slug}`}
                aria-label={`${king.title} ${king.name}${king.isLegend ? " (pověst)" : ""} – ${status}`}
                className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-4 focus-visible:after:ring-ring/60"
              >
                {king.name}
              </Link>
            </h3>
            {reign && (
              <p
                className={cn(
                  "text-xs",
                  locked ? "text-parchment/70" : "text-muted-foreground",
                )}
              >
                {reign}
              </p>
            )}
          </div>

          {locked ? (
            <span className="gilt mt-auto w-full rounded-lg px-3 py-2 text-center text-sm font-bold text-navy shadow-md transition-[background-position] duration-700 group-hover:bg-right">
              Hrát o kartu
            </span>
          ) : (
            <div className="mt-auto flex w-full flex-col items-center gap-2">
              {golden ? (
                <GoldenBadge />
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-gold">
                  <CrownMark className="h-3 w-4 text-gold" />
                  Ve sbírce
                </span>
              )}
              <Link
                href={`/kral/${king.slug}/zlate-kolo`}
                aria-label={`Zlaté kolo: ${king.name}`}
                className="relative z-10 w-full rounded-lg border border-gold-dark/60 bg-navy px-2 py-1.5 text-center text-xs font-bold text-gold shadow-sm outline-none transition-colors hover:bg-navy/90 focus-visible:ring-4 focus-visible:ring-ring/60 sm:text-sm"
              >
                ✨ Zlaté kolo
              </Link>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
