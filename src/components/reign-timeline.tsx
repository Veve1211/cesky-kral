"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { ChronicleDialog } from "@/components/chronicle-dialog";
import { LegendBadge } from "@/components/legend-badge";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/lib/collection";
import { formatReign } from "@/lib/king-display";
import { safeKingImage } from "@/lib/king-image";
import { kingInitial } from "@/lib/king-initial";
import type { KingSummary } from "@/lib/kings";
import { cn } from "@/lib/utils";

type Variant = "full" | "compact";

/** Legends (no year) first, then by the year the reign started. */
function byReign(kings: KingSummary[]): KingSummary[] {
  return kings
    .map((king, index) => ({ king, index }))
    .sort((a, b) => {
      const from = (k: KingSummary) => (k.isLegend || k.reignFrom === null ? -Infinity : k.reignFrom);
      return from(a.king) - from(b.king) || a.index - b.index;
    })
    .map(({ king }) => king);
}

/**
 * "Řeka času" – the rulers in the order they reigned.
 * `full` (Moje sbírka): vertical on mobile, horizontal from `lg`.
 * `compact` (home page): one horizontal strip that scrolls on its own.
 * Collected: small portrait + name + years (click = chronicle);
 * missing: a dot with a question mark (click = play for the card).
 */
export function ReignTimeline({ kings, variant }: { kings: KingSummary[]; variant: Variant }) {
  const collection = useCollection();
  const owned = new Set(collection.kings);
  const golden = new Set(collection.golden);
  const compact = variant === "compact";

  if (kings.length === 0) return null;

  return (
    <section aria-labelledby={`timeline-${variant}`} className="flex min-w-0 flex-col gap-2">
      <div className={cn("flex flex-col", compact ? "items-center gap-0.5 text-center sm:items-start sm:text-left" : "items-center gap-1 text-center sm:items-start sm:text-left")}>
        <h2 id={`timeline-${variant}`} className={cn("font-bold", compact ? "text-2xl" : "text-4xl")}>
          Řeka času
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {compact ? (
            <>
              <span className="lg:hidden">Posuň do strany. </span>Klepni na panovníka.
            </>
          ) : (
            "Panovníci tak, jak šli po sobě."
          )}
        </p>
      </div>

      <div
        className={cn(
          "parchment relative rounded-2xl",
          compact
            ? "overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
            : "px-4 py-5 sm:px-6",
        )}
        // A scrollable region must be reachable from the keyboard.
        tabIndex={compact ? 0 : undefined}
        role={compact ? "region" : undefined}
        aria-label={compact ? "Řeka času, posuvný pruh" : undefined}
      >
        <ol
          className={cn(
            "relative flex",
            compact
              ? "w-max min-w-full flex-row px-3 pt-3 pb-2.5"
              : "flex-col gap-3 lg:flex-row lg:gap-0",
          )}
        >
          {/* the gilded river */}
          <span
            aria-hidden
            className={cn(
              "gilt absolute rounded-full",
              compact
                ? "inset-x-6 top-[32px] h-[3px]"
                : "top-4 bottom-4 left-[26.5px] w-[3px] lg:inset-x-8 lg:top-[26.5px] lg:bottom-auto lg:h-[3px] lg:w-auto",
            )}
          />
          {byReign(kings).map((king) => (
            <li
              key={king.slug}
              className={cn(
                "relative",
                compact ? "w-[78px] shrink-0" : "lg:min-w-0 lg:flex-1",
              )}
            >
              <TimelineStop
                king={king}
                collected={owned.has(king.slug)}
                golden={owned.has(king.slug) && golden.has(king.slug)}
                compact={compact}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineStop({
  king,
  collected,
  golden,
  compact,
}: {
  king: KingSummary;
  collected: boolean;
  golden: boolean;
  compact: boolean;
}) {
  const label = `${king.title} ${king.name}${king.isLegend ? " (pověst)" : ""}`;
  const reign = formatReign(king);
  const className = cn(
    "group flex w-full cursor-pointer rounded-xl text-navy outline-none focus-visible:ring-4 focus-visible:ring-ring/60",
    compact
      ? "flex-col items-center gap-1 px-0.5 text-center"
      : "items-center gap-3 text-left lg:flex-col lg:gap-1.5 lg:px-1 lg:text-center",
  );

  const body = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          compact ? "h-11 w-full" : "h-14 w-14 lg:w-full",
        )}
      >
        {collected ? (
          <Portrait king={king} golden={golden} compact={compact} />
        ) : (
          <MissingDot compact={compact} />
        )}
      </span>
      <span className={cn("flex min-w-0 flex-col", compact ? "items-center" : "items-start lg:items-center")}>
        {collected && (
          <span
            className={cn(
              "font-heading leading-tight font-bold text-balance group-hover:underline",
              compact ? "text-[13px]" : "text-lg lg:text-sm",
            )}
          >
            {king.name}
          </span>
        )}
        {king.isLegend ? (
          <LegendBadge className={cn("mt-0.5", compact && "px-1.5 text-[9px]")} />
        ) : (
          collected &&
          reign && (
            <span className={cn("text-muted-foreground tabular-nums", compact ? "text-[10px]" : "text-xs")}>
              {reign}
            </span>
          )
        )}
        {!collected && !compact && (
          <span className="text-xs text-muted-foreground lg:hidden">Hrát o kartu</span>
        )}
      </span>
    </>
  );

  if (!collected) {
    return (
      <Link href={`/kral/${king.slug}`} aria-label={`${label} – hrát o kartu`} className={className}>
        {body}
      </Link>
    );
  }

  const status = golden ? "zlatá karta" : "ve sbírce";

  if (!king.chronicle) {
    return (
      <Link href={`/kral/${king.slug}`} aria-label={`${label} – ${status}, zahrát si znovu`} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <ChronicleDialog
      king={{ ...king, chronicle: king.chronicle }}
      trigger={
        <button type="button" aria-label={`${label} – ${status}, přečíst kroniku`} className={className}>
          {body}
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
  );
}

function Portrait({ king, golden, compact }: { king: KingSummary; golden: boolean; compact: boolean }) {
  const src = safeKingImage(king.imageUrl);
  return (
    <Ring golden={golden} compact={compact}>
      {src ? (
        <Image src={src} alt="" fill sizes={compact ? "44px" : "56px"} className="object-cover object-top" />
      ) : (
        <span className="font-initial text-xl text-gold">{kingInitial(king.name)}</span>
      )}
    </Ring>
  );
}

/** Round gilded frame; golden cards get the shimmering golden frame. */
function Ring({ golden, compact, children }: { golden: boolean; compact: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "relative block shrink-0 rounded-full transition-transform duration-300 group-hover:scale-105",
        compact ? "size-11" : "size-14",
        golden ? "golden-frame p-[3px]" : "gilt p-[2px] shadow-md",
      )}
    >
      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-navy ring-1 ring-gold-dark/60">
        {children}
      </span>
    </span>
  );
}

function MissingDot({ compact }: { compact: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-navy font-heading font-bold text-gold shadow ring-2 ring-gold transition-transform duration-300 group-hover:scale-110",
        compact ? "size-7 text-base" : "size-8 text-lg",
      )}
    >
      ?
    </span>
  );
}
