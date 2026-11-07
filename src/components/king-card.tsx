import Link from "next/link";

import { KingPortrait } from "@/components/king-portrait";
import { CardCorners, CrownMark } from "@/components/ornaments";
import { cn } from "@/lib/utils";

export type KingCardData = {
  slug: string;
  name: string;
  initial: string;
  reignFrom: number;
  reignTo: number;
  dynasty: string;
  imageUrl: string | null;
  collected: boolean;
};

export function KingCard({ king, index }: { king: KingCardData; index: number }) {
  const locked = !king.collected;

  return (
    <Link
      href={`/kral/${king.slug}`}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
    >
      <article
        className={cn(
          "animate-card-reveal relative flex h-full flex-col items-center gap-3 rounded-2xl p-3 pb-4 transition-all duration-300 group-hover:-translate-y-1 sm:p-4",
          locked ? "bg-navy text-parchment shadow-lg" : "parchment text-navy",
        )}
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <CardCorners
          className={cn("m-1 size-8", locked ? "text-gold/50" : "text-gold-dark")}
        />

        <KingPortrait
          name={king.name}
          initial={king.initial}
          imageUrl={king.imageUrl}
          locked={locked}
          priority={index < 2}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="flex flex-col items-center gap-0.5 text-center">
          <h3 className="text-xl leading-tight font-bold sm:text-2xl">{king.name}</h3>
          <p
            className={cn(
              "text-xs",
              locked ? "text-parchment/70" : "text-muted-foreground",
            )}
          >
            {king.reignFrom}–{king.reignTo}
            <span className="hidden min-[400px]:inline"> · {king.dynasty}</span>
          </p>
        </div>

        {locked ? (
          <span className="gilt mt-auto w-full rounded-lg px-3 py-2 text-center text-sm font-bold text-navy shadow-md transition-[background-position] duration-700 group-hover:bg-right">
            Hrát o kartu
          </span>
        ) : (
          <span className="mt-auto flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-gold">
            <CrownMark className="h-3 w-4 text-gold" />
            Ve sbírce
          </span>
        )}
      </article>
    </Link>
  );
}
