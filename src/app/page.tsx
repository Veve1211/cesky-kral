import Link from "next/link";
import { Shield, Zap } from "lucide-react";

import { KingCard } from "@/components/king-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { demoKings } from "@/lib/demo-kings";
import { RANKS } from "@/lib/game-rules";

export default function GalleryPage() {
  const collected = demoKings.filter((king) => king.collected).length;
  const total = demoKings.length;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Sbírka panovníků
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Získej všechny české krále
        </h1>
        <p className="max-w-xl text-muted-foreground sm:text-lg">
          Vyber si panovníka a odpověz na pět otázek. Když trefíš aspoň čtyři,
          jeho karta je tvoje.
        </p>
      </section>

      {/* Player status */}
      <section className="flex flex-col gap-4 rounded-2xl border border-gold/40 bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-navy text-gold">
            <Shield className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Tvoje hodnost</p>
            <p className="font-heading text-xl font-bold">{RANKS[0]}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm">
            Ve sbírce:{" "}
            <strong>
              {collected} z {total}
            </strong>
          </p>
          <Progress value={collected} max={total} label="Získaní králové" />
        </div>
        <Button asChild variant="accent">
          <Link href="/rychlovka">
            <Zap aria-hidden />
            Rychlovka
          </Link>
        </Button>
      </section>

      <section aria-labelledby="gallery-heading" className="flex flex-col gap-4">
        <h2 id="gallery-heading" className="text-2xl font-bold">
          Galerie
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {demoKings.map((king, index) => (
            <li key={king.slug}>
              <KingCard king={king} index={index} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
