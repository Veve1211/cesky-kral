"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { CrestSvg } from "@/components/crest-svg";
import { CardCorners } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { useSavedCrest } from "@/lib/crest-progress";
import { DEFAULT_CREST } from "@/lib/heraldry";

/** "Moje sbírka": the player's coat of arms (or an invitation to make one). */
export function MyCrestCard() {
  const crest = useSavedCrest();
  return (
    <section aria-labelledby="my-crest-heading" className="parchment relative flex items-center gap-4 rounded-2xl p-5">
      <CardCorners className="m-1 size-7 text-gold-dark" />
      <div className="w-20 shrink-0 sm:w-24">
        <CrestSvg design={crest ?? DEFAULT_CREST} label={crest ? undefined : ""} className={crest ? undefined : "opacity-40 grayscale"} />
      </div>
      <div className="flex flex-col items-start gap-2">
        <h2 id="my-crest-heading" className="text-3xl font-bold">
          Můj erb
        </h2>
        <p className="text-sm text-ink/85">
          {crest
            ? "Ukazuje se vedle tvé přezdívky v žebříčcích. Další díly odemkneš korunami učenosti."
            : "Slož si vlastní erb. Vzácnější díly odemkneš korunami učenosti."}
        </p>
        <Button asChild size="lg" variant={crest ? "outline" : "accent"}>
          <Link href="/muj-erb">
            <Shield aria-hidden />
            {crest ? "Upravit erb" : "Vytvořit erb"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
