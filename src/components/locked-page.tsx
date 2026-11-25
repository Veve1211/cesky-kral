import Link from "next/link";

import { CardCorners } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { FIRST_KING_HREF, LOCKED_NOTE } from "@/lib/reveal";

/**
 * A game mode a new player can't use yet (Veve, 25. 11.): until the first card the
 * page shows only a lock and "Získej českého panovníka" (src/lib/reveal.ts). Both variants
 * are in the HTML; CSS switches them before the first paint, so nothing flashes.
 * Without JavaScript or storage the page is open.
 */
export function LockedPage({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <>
      <section
        data-testid="locked-page"
        aria-labelledby="locked-page-title"
        className="reveal-locked parchment relative mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl p-8 text-center"
      >
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <span aria-hidden className="text-6xl">
          🔒
        </span>
        <h1 id="locked-page-title" className="text-4xl font-bold">
          {name}
        </h1>
        <p className="text-lg">
          {LOCKED_NOTE}. Odpověz správně aspoň na 4 z 5 otázek o panovníkovi a získej svou první kartu.
        </p>
        <Button asChild size="lg">
          <Link href={FIRST_KING_HREF}>Získej českého panovníka</Link>
        </Button>
      </section>
      <div className="reveal-open contents">{children}</div>
    </>
  );
}
