import Link from "next/link";
import { Lock, Crown } from "lucide-react";

import { Crest } from "@/components/crest";
import { cn } from "@/lib/utils";

export type KingCardData = {
  slug: string;
  name: string;
  initial: string;
  reignFrom: number;
  reignTo: number;
  dynasty: string;
  collected: boolean;
};

export function KingCard({ king, index }: { king: KingCardData; index: number }) {
  const locked = !king.collected;

  return (
    <Link
      href={`/kral/${king.slug}`}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
    >
      <article
        className={cn(
          "animate-card-reveal relative flex h-full flex-col items-center gap-3 overflow-hidden rounded-2xl border-2 p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg",
          locked
            ? "border-navy/40 bg-navy text-primary-foreground"
            : "border-gold bg-card text-card-foreground",
        )}
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-3 right-3",
            locked ? "text-primary-foreground/40" : "text-gold",
          )}
        >
          {locked ? <Lock className="size-4" /> : <Crown className="size-4" />}
        </span>

        <Crest
          initial={king.initial}
          locked={locked}
          className="w-24 transition-transform duration-300 group-hover:scale-105"
        />

        <div className="text-center">
          <h3 className="text-lg font-bold leading-tight">{king.name}</h3>
          <p
            className={cn(
              "mt-1 text-xs",
              locked ? "text-primary-foreground/60" : "text-muted-foreground",
            )}
          >
            {king.reignFrom}–{king.reignTo} · {king.dynasty}
          </p>
        </div>

        <span
          className={cn(
            "mt-auto rounded-full px-3 py-1 text-xs font-semibold",
            locked ? "bg-gold/20 text-gold" : "bg-navy text-parchment",
          )}
        >
          {locked ? "Hrát o kartu" : "Ve sbírce"}
        </span>
      </article>
    </Link>
  );
}
