"use client";

import { useCollection, useCollectionReady } from "@/lib/collection";

/**
 * "1576–1611 · Habsburkové" under the king's name on /kral/[slug].
 * The years are the answers of "Kdo vládl dřív?", so until the king is in
 * the player's collection (localStorage) they show as "???? – ????".
 */
export function KingReignLine({
  slug,
  reign,
  dynasty,
}: {
  slug: string;
  /** Formatted reign, or null for legends (no years at all). */
  reign: string | null;
  dynasty: string;
}) {
  const ready = useCollectionReady();
  const { kings } = useCollection();
  const owned = ready && kings.includes(slug);

  return (
    <p data-testid="king-reign" className="text-sm text-muted-foreground tabular-nums">
      {reign &&
        (owned ? (
          reign
        ) : (
          <>
            <span aria-hidden>???? – ????</span>
            <span className="sr-only">roky jsou skryté</span>
          </>
        ))}
      {reign && dynasty && " · "}
      {dynasty}
    </p>
  );
}
