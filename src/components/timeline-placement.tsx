"use client";

import { KingPortrait } from "@/components/king-portrait";
import { useCollection } from "@/lib/collection";
import { cn } from "@/lib/utils";

/** A ruler as the river needs it – no years (the order is the game order, by reign). */
export type TimelineKing = { slug: string; name: string; initial: string; imageUrl: string | null };

/**
 * End of a won card (first time): the new ruler drops into its place in
 * "Řeka času" among the rulers already collected (Veve, 25. 11.). Only collected
 * rulers are shown, in the game order (= order of reign, legends first), so the
 * river never tells anything about the ones still missing. Reduced motion: no
 * movement, the new ruler is only highlighted.
 */
export function TimelinePlacement({ kings, newSlug, name }: { kings: readonly TimelineKing[]; newSlug: string; name: string }) {
  const collection = useCollection();
  const owned = new Set([...collection.kings, newSlug]);
  const river = kings.filter((king) => owned.has(king.slug));
  if (!river.some((king) => king.slug === newSlug)) return null;

  return (
    <section
      aria-label="Řeka času"
      data-testid="timeline-placement"
      className="animate-tier-rise flex w-full max-w-md flex-col items-center gap-2 [animation-delay:1.4s]"
    >
      <p className="text-[11px] font-semibold tracking-[0.3em] text-[var(--tier-light)] uppercase">Řeka času</p>
      {/* the river: a blue band, the rulers stand on it in order */}
      <div className="relative w-full overflow-x-auto overscroll-x-contain">
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#1e3a6e,#3a6fb0,#1e3a6e)] opacity-70" />
        <ol className="relative mx-auto flex w-max items-center gap-2 px-2 py-3">
          {river.map((king) => {
            const isNew = king.slug === newSlug;
            return (
              <li
                key={king.slug}
                data-new={isNew || undefined}
                className={cn("shrink-0", isNew ? "timeline-drop-in w-14" : "w-10 opacity-80")}
              >
                <span className="sr-only">{king.name}</span>
                <div className={cn("rounded-lg p-0.5", isNew ? "gilt shadow-[0_0_18px_var(--tier-light)]" : "bg-navy ring-1 ring-gold/50")}>
                  <KingPortrait name={king.name} initial={king.initial} imageUrl={king.imageUrl} sizes="56px" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="text-sm text-parchment/85">
        <strong className="text-parchment">{name}</strong> zaujímá své místo v Řece času.
      </p>
    </section>
  );
}
