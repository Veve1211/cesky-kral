import Image from "next/image";

import { Crest } from "@/components/crest";
import { CardCorners } from "@/components/ornaments";
import { TierCrown } from "@/components/tier-crown";
import type { Tier } from "@/lib/mastery";
import { safeKingImage } from "@/lib/king-image";
import { cn } from "@/lib/utils";

/**
 * King portrait in a gilded, illuminated-manuscript frame.
 * Locked kings are shown as a dark silhouette with a question mark.
 * Without an image a decorative crest with the initial is used.
 * `crown` puts the ruler's "koruna učenosti" on top of the frame (on the head).
 */
export function KingPortrait({
  name,
  initial,
  imageUrl,
  locked = false,
  priority = false,
  sizes = "(max-width: 640px) 45vw, 260px",
  crown = 0,
  crownClassName,
  className,
}: {
  name: string;
  initial: string;
  imageUrl?: string | null;
  locked?: boolean;
  priority?: boolean;
  sizes?: string;
  crown?: Tier;
  /** E.g. the descending animation on the celebration screen. */
  crownClassName?: string;
  className?: string;
}) {
  const src = safeKingImage(imageUrl);

  return (
    <div
      className={cn(
        "gilt relative aspect-[4/5] w-full rounded-xl p-[5px] shadow-[0_6px_18px_-6px_rgb(60_40_10/0.6)]",
        className,
      )}
    >
      <div className="relative size-full overflow-hidden rounded-[9px] bg-navy ring-1 ring-gold-dark/60">
        {src ? (
          <Image
            src={src}
            alt={locked ? "" : `Portrét: ${name}`}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              "object-cover object-top transition-[filter,transform] duration-500",
              locked && "scale-105 brightness-[0.18] contrast-125 grayscale",
            )}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#22335c,var(--brand-navy)_70%)] p-[18%]">
            <Crest initial={initial} locked={locked} />
          </div>
        )}

        {/* inner gold hairline + corner flourishes */}
        <div className="pointer-events-none absolute inset-1.5 rounded-md border border-gold/60" />
        <CardCorners className="m-0.5 size-7 text-gold" />

        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/40">
            <span
              aria-hidden
              className="gilt-text font-heading text-7xl font-bold drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)]"
            >
              ?
            </span>
          </div>
        )}
      </div>
      {crown > 0 && (
        <TierCrown
          tier={crown as 1 | 2 | 3}
          className={cn(
            "pointer-events-none absolute top-0 left-1/2 z-10 w-[46%] max-w-28 -translate-x-1/2 -translate-y-[55%]",
            crownClassName,
          )}
        />
      )}
    </div>
  );
}
