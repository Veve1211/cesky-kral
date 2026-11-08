"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import { IlluminatedInitial } from "@/components/illuminated-initial";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Chronicle } from "@/lib/chronicle";
import { formatReign, type KingTitle } from "@/lib/king-display";

export type ChronicleKing = {
  name: string;
  title: KingTitle;
  dynasty: string;
  isLegend: boolean;
  reignFrom: number | null;
  reignTo: number | null;
  chronicle: Chronicle;
};

/** Opens the king's chronicle – a page of an illuminated manuscript. */
export function ChronicleDialog({
  king,
  trigger,
  footer,
}: {
  king: ChronicleKing;
  /** Element that opens the dialog (rendered with `asChild`). */
  trigger: ReactNode;
  /** Optional actions at the bottom of the page. */
  footer?: ReactNode;
}) {
  const { intro, facts, sources } = king.chronicle;
  const subtitle = [king.title, king.dynasty, formatReign(king)]
    .filter(Boolean)
    .join(" · ");
  const first = intro.charAt(0);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel="Zavřít kroniku" className="parchment text-navy">
        <article className="relative flex min-h-full flex-col gap-5 px-5 pt-14 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
          <CardCorners className="m-1.5 size-9 text-gold-dark" />

          <header className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">
              📜 Kronika panovníka
            </p>
            <DialogTitle className="text-4xl leading-tight font-bold sm:text-5xl">
              Kronika: {king.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground first-letter:uppercase">
              {subtitle}
            </DialogDescription>
            <OrnamentDivider />
          </header>

          {king.isLegend && <LegendBadge className="self-start" />}

          <p className="text-left leading-relaxed text-ink/90 sm:text-lg">
            <IlluminatedInitial letter={first} />
            <span className="sr-only">{first}</span>
            {intro.slice(1)}
          </p>

          {facts.length > 0 && (
            <section
              aria-labelledby="chronicle-facts"
              className="clear-both flex flex-col gap-3 rounded-xl border border-gold/50 bg-white/35 p-4 sm:p-5"
            >
              <h3 id="chronicle-facts" className="text-2xl font-bold">
                ✨ Věděli jste, že…
              </h3>
              <ul className="flex flex-col gap-2.5">
                {facts.map((fact, i) => (
                  <li key={i} className="flex gap-2.5 text-ink/90">
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden
                      className="mt-1.5 size-3 shrink-0 fill-gold-dark"
                    >
                      <path d="M8 0l3 8-3 8-3-8z" />
                    </svg>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sources.length > 0 && (
            <footer className="clear-both flex flex-col gap-1.5 border-t border-gold/40 pt-4">
              <h3 className="text-sm font-semibold tracking-[0.2em] text-gold-dark uppercase font-sans">
                Zdroje
              </h3>
              <ul className="flex flex-col gap-1">
                {sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-navy"
                    >
                      {source.label}
                      <ExternalLink className="size-3" aria-hidden />
                      <span className="sr-only">(otevře se v novém okně)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </footer>
          )}

          {footer && <div className="mt-auto flex justify-center pt-2">{footer}</div>}
        </article>
      </DialogContent>
    </Dialog>
  );
}
