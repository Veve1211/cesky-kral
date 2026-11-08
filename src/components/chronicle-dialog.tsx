"use client";

import { Fragment, type ReactNode } from "react";
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
  const { intro, sections, facts, sources } = king.chronicle;
  const subtitle = [king.title, king.dynasty, formatReign(king)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* Only the body scrolls, so the title and the close button stay on top. */}
      <DialogContent
        closeLabel="Zavřít kroniku"
        className="parchment flex flex-col overflow-hidden text-navy"
      >
        <header className="flex shrink-0 flex-col items-center gap-0.5 border-b border-gold/50 px-13 pt-3 pb-2.5 text-center shadow-[0_6px_10px_-8px_rgb(20_33_61/0.35)] sm:pt-4">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-gold-dark uppercase sm:text-xs">
            📜 Kronika panovníka
          </p>
          <DialogTitle className="text-2xl leading-tight font-bold text-balance min-[360px]:text-3xl sm:text-4xl">
            Kronika: {king.name}
          </DialogTitle>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <article className="relative flex flex-col gap-5 px-5 pt-5 pb-8 sm:px-10 sm:pb-10">
            <CardCorners className="m-1.5 size-9 text-gold-dark" />

            <div className="flex flex-col items-center gap-2 text-center">
              <DialogDescription className="text-sm text-muted-foreground first-letter:uppercase">
                {subtitle}
              </DialogDescription>
              <OrnamentDivider />
            </div>

            {king.isLegend && <LegendBadge className="self-start" />}

            {sections.length > 0 ? (
              sections.map((section, i) => (
                <Fragment key={i}>
                  {i > 0 && <OrnamentDivider className="mx-auto" />}
                  <section aria-labelledby={`chronicle-section-${i}`} className="flex flex-col gap-2">
                    <h3
                      id={`chronicle-section-${i}`}
                      className="flex items-center gap-2 text-2xl leading-tight font-bold sm:text-3xl"
                    >
                      <Fleuron />
                      {section.heading}
                    </h3>
                    {/* Ornate initial only at the start of the first section. */}
                    <ChronicleText text={section.text} initial={i === 0} />
                  </section>
                </Fragment>
              ))
            ) : (
              <ChronicleText text={intro} initial />
            )}

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
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Paragraph of chronicle text, optionally opened with an illuminated initial. */
function ChronicleText({ text, initial }: { text: string; initial?: boolean }) {
  if (!initial) {
    return <p className="leading-relaxed text-ink/90 sm:text-lg">{text}</p>;
  }
  const first = text.charAt(0);
  return (
    // flow-root keeps the floated initial inside the paragraph
    <p className="flow-root text-left leading-relaxed text-ink/90 sm:text-lg">
      <IlluminatedInitial letter={first} />
      <span className="sr-only">{first}</span>
      {text.slice(1)}
    </p>
  );
}

/** Small gilded fleuron in front of a section heading. */
function Fleuron() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden className="h-4 w-6 shrink-0 text-gold-dark">
      <g fill="currentColor">
        <path d="M12 1 l5 7 l-5 7 l-5 -7z" />
        <circle cx="3" cy="8" r="1.6" />
        <circle cx="21" cy="8" r="1.6" />
      </g>
      <path d="M12 5 l2.5 3 l-2.5 3 l-2.5 -3z" fill="var(--brand-navy)" />
    </svg>
  );
}
