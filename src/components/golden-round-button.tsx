"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

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

  // Collection is unknown until hydration – keep the space, show nothing.
  if (!isClient) return <div className={cn("min-h-12", className)} aria-hidden />;

  const owned = kings.includes(slug);
  const isGolden = golden.includes(slug);

  if (!owned) {
    return (
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <Button variant="outline" size="lg" disabled aria-disabled>
          <Lock aria-hidden />
          ✨ Zlaté kolo
        </Button>
        <p className="text-xs text-muted-foreground">
          Odemkne se, až získáš kartu.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {isGolden && <GoldenBadge />}
      <Button asChild variant="default" size="lg" className="text-gold">
        <Link href={`/kral/${slug}/zlate-kolo`}>✨ Zlaté kolo</Link>
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
          "relative flex flex-col items-center gap-4 rounded-2xl p-5 text-center sm:p-6",
          isGolden ? "golden-sheet golden-sheen rounded-[12px]" : "parchment",
        )}
      >
        {children}
      </header>
    </div>
  );
}
