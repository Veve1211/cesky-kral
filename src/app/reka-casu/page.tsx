import type { Metadata } from "next";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { TimelineGame } from "@/components/timeline-game";
import { TIMELINE_SIZE } from "@/lib/games";

export const metadata: Metadata = {
  title: "Řeka času",
  description: "Seřaď české panovníky podle toho, kdo začal vládnout dřív. Kolik kol dáš bez chyby?",
};

export default function TimelinePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-3 overflow-hidden rounded-2xl bg-navy px-6 py-7 text-center text-parchment shadow-xl ring-2 ring-gold">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
        <CardCorners className="m-1 size-9 text-gold" />
        <span className="gilt flex size-12 items-center justify-center rounded-full text-2xl shadow-md" aria-hidden>
          🌊
        </span>
        <h1 className="text-4xl font-bold sm:text-5xl">Řeka času</h1>
        <OrnamentDivider />
        <p className="max-w-sm text-parchment/85">
          Seřaď {TIMELINE_SIZE} panovníky od toho, kdo začal vládnout nejdřív. Každé správné kolo se
          počítá, jedna chyba a je konec.
        </p>
      </header>
      <TimelineGame />
    </div>
  );
}
