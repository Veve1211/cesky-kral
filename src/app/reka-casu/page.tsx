import type { Metadata } from "next";

import { ModeHeader } from "@/components/mode-header";
import { TimelineGame } from "@/components/timeline-game";
import { TIMELINE_SIZE } from "@/lib/games";
import { LockedPage } from "@/components/locked-page";

export const metadata: Metadata = {
  title: "Řeka času",
  description: "Seřaď české panovníky podle toho, kdo začal vládnout dřív. Kolik kol dáš bez chyby?",
};

function TimelinePageContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:gap-6">
      <ModeHeader icon="🌊" title="Řeka času" className="mx-auto w-full max-w-2xl">
        <p className="max-w-sm text-sm text-parchment/85 sm:text-base">
          Seřaď {TIMELINE_SIZE} panovníky od toho, kdo začal vládnout nejdřív. Každé správné kolo se
          počítá, jedna chyba a je konec.
        </p>
      </ModeHeader>
      <TimelineGame />
    </div>
  );
}

// New players see a lock until their first card (src/lib/reveal.ts).
export default function TimelinePage() {
  return (
    <LockedPage name="Řeka času">
      <TimelinePageContent />
    </LockedPage>
  );
}
