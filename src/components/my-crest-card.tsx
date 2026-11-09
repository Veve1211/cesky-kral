"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

import { CrestSvg } from "@/components/crest-svg";
import { CardCorners } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCollectionReady } from "@/lib/collection";
import { useSavedCrest } from "@/lib/crest-progress";
import { useCrestCounts } from "@/lib/crest-unlocks";
import { unlockedPartCount, type CrestDesign } from "@/lib/heraldry";
import { postJson, readToken } from "@/lib/player";
import { cn } from "@/lib/utils";

/** A tempting example for players without a crest yet. */
const EXAMPLE: CrestDesign = {
  shape: "heater",
  division: "per-pale",
  field: "gules",
  second: "argent",
  charge: "eagle",
  chargeTincture: "or",
  motto: "",
};

/**
 * "Tvůj erb" – next to the rank on the home page and at the top of Moje
 * sbírka. Without a crest: an invitation with an example shield. With one:
 * the crest, the nickname, how many parts are unlocked and "Upravit erb".
 */
export function MyCrestCard({ kingSlugs, className }: { kingSlugs: string[]; className?: string }) {
  const ready = useCollectionReady();
  const crest = useSavedCrest();
  const counts = useCrestCounts(kingSlugs);
  const { unlocked, total } = unlockedPartCount(counts);
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    if (!crest) return;
    const token = readToken();
    let cancelled = false;
    void (token ? postJson<{ nickname: string | null }>("/api/player/me", { token }) : Promise.resolve(null)).then((result) => {
      if (!cancelled) setNickname(result?.ok ? result.nickname : null);
    });
    return () => {
      cancelled = true;
    };
  }, [crest]);

  if (!ready) return <div aria-hidden className={cn("parchment h-44 animate-pulse rounded-2xl", className)} />;

  return (
    <section
      aria-labelledby="my-crest-heading"
      data-testid="crest-card"
      data-has-crest={crest ? "true" : "false"}
      className={cn(
        "relative flex items-center gap-4 overflow-hidden rounded-2xl p-5 sm:gap-6 sm:p-6",
        crest ? "parchment" : "bg-navy text-parchment shadow-xl ring-2 ring-gold",
        className,
      )}
    >
      <CardCorners className={cn("m-1 size-7", crest ? "text-gold-dark" : "text-gold")} />
      <div className={cn("w-24 shrink-0 drop-shadow-lg sm:w-28", !crest && "animate-float")}>
        <CrestSvg design={crest ?? EXAMPLE} withMotto={Boolean(crest)} label={crest ? undefined : "Ukázkový erb"} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <p className={cn("text-xs font-semibold tracking-[0.2em] uppercase", crest ? "text-gold-dark" : "text-gold")}>Tvůj erb</p>
        <h2 id="my-crest-heading" className="text-3xl leading-tight font-bold">
          {crest ? (nickname ? `Erb hráče ${nickname}` : "Tvůj erb") : "Vytvoř si vlastní erb"}
        </h2>
        <p className={cn("text-sm", crest ? "text-ink/85" : "text-parchment/85")}>
          {crest
            ? "Ukazuje se vedle tvé přezdívky v žebříčcích."
            : "Štít, barvy, figura a heslo. Vzácné díly odemkneš kartami a korunami učenosti."}
        </p>
        <div className="flex w-full max-w-xs flex-col gap-1">
          <p className="text-sm" data-testid="crest-parts">
            Odemčeno <strong>{unlocked}</strong> z {total} dílů erbu
          </p>
          <Progress value={unlocked} max={total} label="Odemčené díly erbu" />
        </div>
        <Button asChild size="lg" variant={crest ? "outline" : "accent"} className="mt-1">
          <Link href="/muj-erb">
            <Shield aria-hidden />
            {crest ? "Upravit erb" : "Vytvořit erb"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
