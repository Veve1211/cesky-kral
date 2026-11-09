"use client";

import { IlluminatedInitial } from "@/components/illuminated-initial";
import { useCollection, useCollectionReady } from "@/lib/collection";

/**
 * The ruler's short description on /kral/[slug] – only once the card is in
 * the collection. Before, it would give away answers of the round (e.g.
 * "Poslední český král" next to "Čím je výjimečný?").
 */
export function KingBio({ slug, bio }: { slug: string; bio: string }) {
  const ready = useCollectionReady();
  const { kings } = useCollection();
  if (!bio) return null;
  if (!ready || !kings.includes(slug)) {
    return (
      <p data-testid="king-bio-locked" className="text-center text-sm text-muted-foreground italic">
        Kdo to byl? Odpověz na otázky – popis i roky vlády se odemknou s kartou.
      </p>
    );
  }
  return (
    <p data-testid="king-bio" className="text-left text-ink/90">
      <IlluminatedInitial letter={bio.charAt(0)} size="md" />
      <span className="sr-only">{bio.charAt(0)}</span>
      {bio.slice(1)}
    </p>
  );
}
