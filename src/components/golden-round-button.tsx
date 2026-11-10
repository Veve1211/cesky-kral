"use client";

import Link from "next/link";

import { GoldenBadge } from "@/components/golden-badge";
import { Button } from "@/components/ui/button";
import { useCollection, useCollectionReady } from "@/lib/collection";
import { cn } from "@/lib/utils";

/**
 * Golden round entry on the king page. Unlocked only when the king is in
 * the player's collection (localStorage), otherwise shown as locked.
 */
export function GoldenRoundButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const isClient = useCollectionReady();
  const { kings, golden } = useCollection();

  // Nothing before hydration and nothing for an unowned ruler: a newcomer sees the round, not a locked button.
  if (!isClient) return null;

  const owned = kings.includes(slug);
  const isGolden = golden.includes(slug);

  if (!owned) return null;
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {isGolden && <GoldenBadge />}
      <Button asChild variant="default" size="lg" className="text-gold">
        <Link href={`/kral/${slug}/zlate-kolo`}>✨ Mistrovské kolo</Link>
      </Button>
    </div>
  );
}

/** Applies the golden frame to a king header once the card is golden. */
export function GoldenHeaderFrame({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { golden } = useCollection();
  const isGolden = golden.includes(slug);
  return (
    <div className={cn("rounded-2xl", isGolden && "golden-frame")}>
      <header
        className={cn(
          "relative flex flex-col items-center gap-2 rounded-2xl p-4 text-center sm:gap-3 sm:p-5",
          isGolden ? "golden-sheet golden-sheen rounded-[12px]" : "parchment",
        )}
      >
        {children}
      </header>
    </div>
  );
}
