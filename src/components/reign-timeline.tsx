"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { ChronicleDialog } from "@/components/chronicle-dialog";
import { LegendBadge } from "@/components/legend-badge";
import { NewBadge } from "@/components/new-badge";
import { Button } from "@/components/ui/button";
import { useCollection, useCollectionReady } from "@/lib/collection";
import { formatReign } from "@/lib/king-display";
import { safeKingImage } from "@/lib/king-image";
import { kingInitial } from "@/lib/king-initial";
import type { KingSummary } from "@/lib/kings";
import { markNewestSeen, newestCollected, readSeenNewest } from "@/lib/timeline-new";
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
 * Only collected kings are shown (portrait + name + years, click = chronicle).
 * The rest is one line "X panovníků čeká na objevení" – no names, links or
 * order, so the river can't be used to answer "Kdo vládl dřív?".
 * The most recently collected king carries a "Nový" badge until the player
 * has seen it here once (see `useNewBadge`).
 */
export function ReignTimeline({ kings, variant }: { kings: KingSummary[]; variant: Variant }) {
  const collection = useCollection();
  const owned = new Set(collection.kings);
  const golden = new Set(collection.golden);
  const compact = variant === "compact";
  const { newSlug, newStopRef, scrollerRef } = useNewBadge(kings, collection.kings, compact);

  if (kings.length === 0) return null;

  const known = byReign(kings).filter((king) => owned.has(king.slug));
  const unknownCount = kings.length - known.length;

  return (
    <section aria-labelledby={`timeline-${variant}`} className="flex min-w-0 flex-col gap-2">
      <div className={cn("flex flex-col", compact ? "items-center gap-0.5 text-center sm:items-start sm:text-left" : "items-center gap-1 text-center sm:items-start sm:text-left")}>
        <h2 id={`timeline-${variant}`} className={cn("font-bold", compact ? "text-2xl" : "text-4xl")}>
          Řeka času
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {known.length === 0 ? (
            "Získej panovníka a objeví se tu."
          ) : compact ? (
            <>
              <span className="lg:hidden">Posuň do strany. </span>Klepni na panovníka.
            </>
          ) : (
            "Panovníci tak, jak šli po sobě."
          )}
        </p>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "parchment relative rounded-2xl",
          compact
            ? "overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
            : "px-4 py-5 sm:px-6",
        )}
        // A scrollable region must be reachable from the keyboard.
        tabIndex={compact && known.length > 0 ? 0 : undefined}
        role={compact ? "region" : undefined}
        aria-label={compact ? "Řeka času, posuvný pruh" : undefined}
      >
        {known.length > 0 && (
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
            {known.map((king) => (
              <li
                key={king.slug}
                ref={king.slug === newSlug ? newStopRef : undefined}
                className={cn(
                  "relative",
                  compact ? "w-[78px] shrink-0" : "lg:min-w-0 lg:flex-1",
                )}
              >
                <TimelineStop
                  king={king}
                  golden={golden.has(king.slug)}
                  isNew={king.slug === newSlug}
                  compact={compact}
                />
              </li>
            ))}
          </ol>
        )}
        {unknownCount > 0 && (
          <p
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground italic",
              compact ? "px-4 pb-3" : "",
              compact && known.length === 0 && "pt-3",
              !compact && known.length > 0 && "mt-4",
            )}
          >
            <MissingDot compact={compact} />
            <span data-testid="timeline-unknown">{unknownLabel(unknownCount)}</span>
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * "Nový" badge for the most recently collected king.
 * The seen state is read once on mount, so the badge stays for this whole
 * visit; once the king's stop has been on screen it is remembered and the
 * badge is gone next time (on / and /sbirka alike).
 */
function useNewBadge(kings: KingSummary[], collected: readonly string[], compact: boolean) {
  const ready = useCollectionReady();
  // undefined = not read yet (server render / hydration).
  const [seenAtMount] = useState<string | null | undefined>(() =>
    typeof window === "undefined" ? undefined : readSeenNewest(),
  );
  const newest = newestCollected(collected, new Set(kings.map((king) => king.slug)));
  const newSlug = ready && seenAtMount !== undefined && newest !== seenAtMount ? newest : null;

  const newStopRef = useRef<HTMLLIElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stop = newStopRef.current;
    if (!newSlug || !stop) return;

    // In the scrolling strip, bring the new king into view (only the strip moves).
    const scroller = scrollerRef.current;
    if (compact && scroller) {
      scroller.scrollLeft = stop.offsetLeft - (scroller.clientWidth - stop.offsetWidth) / 2;
    }

    if (typeof IntersectionObserver === "undefined") {
      markNewestSeen(newSlug);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          markNewestSeen(newSlug);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(stop);
    return () => observer.disconnect();
  }, [newSlug, compact]);

  return { newSlug, newStopRef, scrollerRef };
}

/** "3 panovníci čekají na objevení" (Czech plural forms, including an empty collection). */
function unknownLabel(count: number): string {
  if (count === 1) return "1 panovník čeká na objevení";
  if (count >= 2 && count <= 4) return `${count} panovníci čekají na objevení`;
  return `${count} panovníků čeká na objevení`;
}

function TimelineStop({
  king,
  golden,
  isNew,
  compact,
}: {
  king: KingSummary;
  golden: boolean;
  /** Most recently collected and not seen here yet. */
  isNew: boolean;
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
          "relative flex shrink-0 items-center justify-center",
          compact ? "h-11 w-full" : "h-14 w-14 lg:w-full",
        )}
      >
        <Portrait king={king} golden={golden} compact={compact} />
        {isNew && <NewBadge className="absolute -bottom-1.5 left-1/2 z-10 -translate-x-1/2" />}
      </span>
      <span className={cn("flex min-w-0 flex-col", compact ? "items-center" : "items-start lg:items-center")}>
        <span
          className={cn(
            "font-heading leading-tight font-bold text-balance group-hover:underline",
            compact ? "text-[13px]" : "text-lg lg:text-sm",
          )}
        >
          {king.name}
        </span>
        {king.isLegend ? (
          <LegendBadge className={cn("mt-0.5", compact && "px-1.5 text-[9px]")} />
        ) : (
          reign && (
            <span className={cn("text-muted-foreground tabular-nums", compact ? "text-[10px]" : "text-xs")}>
              {reign}
            </span>
          )
        )}
      </span>
    </>
  );

  const status = `${isNew ? "nově získaný, " : ""}${golden ? "zlatá karta" : "ve sbírce"}`;

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
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-navy font-heading font-bold not-italic text-gold shadow ring-2 ring-gold",
        compact ? "size-7 text-base" : "size-8 text-lg",
      )}
    >
      ?
    </span>
  );
}
