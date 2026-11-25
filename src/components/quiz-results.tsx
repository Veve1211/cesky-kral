"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowRight, Lock, RotateCcw } from "lucide-react";

import { ChronicleDialog } from "@/components/chronicle-dialog";
import { GoldenBadge } from "@/components/golden-badge";
import { KingPortrait } from "@/components/king-portrait";
import { KofiButton } from "@/components/kofi-button";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { HEADING_FOCUS, type QuizKing, type QuizProps } from "@/components/quiz-shared";
import { RoyalCelebration } from "@/components/royal-celebration";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readCollection } from "@/lib/collection";
import { CORRECT_TO_COLLECT } from "@/lib/game-rules";
import { nextUncollected } from "@/lib/next-step";
import { quickShareText } from "@/lib/share-text";
import { cn } from "@/lib/utils";

// Result screens of the quiz: king round (card flip, next card), golden round, Rychlovka.

export function Results(
  props: QuizProps & {
    score: number;
    total: number;
    marks: readonly boolean[];
    collected: boolean;
    completedAll: boolean;
    onRestart: () => void;
    onRetrySave: () => void;
    headingRef: RefObject<HTMLHeadingElement | null>;
  },
) {
  const { score, total, onRestart, headingRef } = props;
  const [revealed, setRevealed] = useState(false);
  const onRevealed = useCallback(() => setRevealed(true), []);

  if (props.mode === "golden") {
    return props.collected ? (
      <div className="flex flex-col gap-6">
        <GoldenWin king={props.king} score={score} total={total} headingRef={headingRef} />
        <KofiButton />
      </div>
    ) : (
      <Card className="animate-card-reveal items-center text-center">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <CardContent className="flex flex-col items-center gap-4">
          <h2
            ref={headingRef}
            id="quiz-result-heading"
            tabIndex={-1}
            aria-describedby="quiz-result-score"
            className={cn("font-sans text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase", HEADING_FOCUS)}
          >
            Konec mistrovského kola
          </h2>
          <p id="quiz-result-score" className="font-heading text-7xl font-bold">
            {score}
            <span className="text-3xl text-muted-foreground"> z {total}</span>
          </p>
          <OrnamentDivider />
          <p className="text-muted-foreground">
            Na zlatou kartu musí být správně všechny odpovědi. Karta zůstává
            ve sbírce, jen zatím bez zlata.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={onRestart} size="lg" variant="accent">
              <RotateCcw aria-hidden />
              Zkus to znovu
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sbirka">Moje sbírka</Link>
            </Button>
          </div>
          <KofiButton className="mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (props.mode === "king" && score >= CORRECT_TO_COLLECT && !props.collected) {
    return (
      <Card className="items-center text-center">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <CardContent className="flex flex-col items-center gap-4">
          <p id="quiz-result-score" className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
            Skóre {score} z {total}
          </p>
          <div role="alert" className="flex flex-col gap-3">
            <h2
              ref={headingRef}
              id="quiz-result-heading"
              tabIndex={-1}
              aria-describedby="quiz-result-score"
              className={cn("text-3xl font-bold", HEADING_FOCUS)}
            >
              Kartu se nepodařilo uložit
            </h2>
            <p className="text-muted-foreground">
              Povol ukládání v prohlížeči nebo uvolni místo a zkus uložení znovu.
              Kvíz nemusíš opakovat. Skóre zůstane zachované, dokud tuto stránku
              nezavřeš nebo neobnovíš.
            </p>
          </div>
          <Button onClick={props.onRetrySave} variant="accent" size="lg">
            <RotateCcw aria-hidden />
            Zkusit uložit znovu
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (props.mode === "king" && props.collected) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="items-center text-center">
          <CardCorners className="m-1 size-8 text-gold-dark" />
          <CardContent className="flex flex-col items-center gap-4">
            <p id="quiz-result-score" className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
              Skóre {score} z {total}
            </p>
            <CardFlipReveal king={props.king} onRevealed={onRevealed} />
            <h2
              ref={headingRef}
              id="quiz-result-heading"
              tabIndex={-1}
              aria-describedby="quiz-result-score"
              className={cn("text-4xl font-bold", HEADING_FOCUS)}
            >
              Král je ve tvé sbírce!
            </h2>
            {revealed && props.king.chronicle && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ChronicleDialog
                  king={{ ...props.king, chronicle: props.king.chronicle }}
                  trigger={
                    <Button variant="outline" size="lg">
                      📜 Přečíst kroniku
                    </Button>
                  }
                />
              </div>
            )}
            <OrnamentDivider />
            <p className="text-muted-foreground">
              Skvělá práce. Karta už na tebe čeká ve sbírce.
            </p>
            {!props.completedAll && <NextCardActions allKingSlugs={props.allKingSlugs} />}
          </CardContent>
        </Card>
        {props.completedAll && (
          <RoyalCelebration total={props.allKingSlugs.length}>
            <Button asChild variant="accent" size="lg" className="mt-2">
              <Link href="/sbirka">Prohlédnout sbírku</Link>
            </Button>
          </RoyalCelebration>
        )}
        <KofiButton />
      </div>
    );
  }

  const isKing = props.mode === "king";

  return (
    <Card className="animate-card-reveal items-center text-center">
      <CardCorners className="m-1 size-8 text-gold-dark" />
      <CardContent className="flex flex-col items-center gap-4">
        <h2
          ref={headingRef}
          id="quiz-result-heading"
          tabIndex={-1}
          aria-describedby="quiz-result-score"
          className={cn("font-sans text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase", HEADING_FOCUS)}
        >
          {isKing ? "Konec hry" : "Konec rychlovky"}
        </h2>
        <p id="quiz-result-score" className="font-heading text-7xl font-bold">
          {score}
          <span className="text-3xl text-muted-foreground"> z {total}</span>
        </p>
        <OrnamentDivider />
        <p className="text-muted-foreground">
          {isKing
            ? `Na kartu potřebuješ aspoň ${CORRECT_TO_COLLECT} správné odpovědi. Zkus to znovu!`
            : score === total
              ? "Bez jediné chyby, klobouk dolů!"
              : "Dobrá práce! Dáš příště víc?"}
        </p>
        {props.mode === "quick" && props.resultExtra}
        {props.mode === "quick" && props.marks.length === total && (
          <ShareButton
            text={quickShareText(props.marks)}
            url={`${window.location.origin}/rychlovka`}
            withCrest
        />
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onRestart} size="lg" variant={isKing ? "accent" : "default"}>
            <RotateCcw aria-hidden />
            {isKing ? "Zkusit znovu" : "Hrát znovu"}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sbirka">Do sbírky</Link>
          </Button>
        </div>
        <KofiButton className="mt-2" />
      </CardContent>
    </Card>
  );
}

/**
 * One clear next step after a won card (audit 10. 11., point 5): play for the next
 * missing ruler; the collection stays as a quieter second option.
 */
function NextCardActions({ allKingSlugs }: { allKingSlugs: readonly string[] }) {
  // Rendered only after the round, on the client, when the card is already saved.
  const next = nextUncollected(allKingSlugs, readCollection().kings);
  if (!next) {
    return (
      <Button asChild variant="accent" size="lg">
        <Link href="/sbirka">Do sbírky</Link>
      </Button>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <Button asChild variant="accent" size="lg">
        <Link href={`/kral/${next}`}>
          Hrát o další kartu
          <ArrowRight aria-hidden />
        </Link>
      </Button>
      <Button asChild variant="link" size="sm">
        <Link href="/sbirka">Do sbírky</Link>
      </Button>
    </div>
  );
}

/** Card turns over from the dark silhouette to the king's portrait. */
function CardFlipReveal({
  king,
  onRevealed,
}: {
  king: { name: string; initial: string; imageUrl: string | null };
  /** Called once the flip animation has finished. */
  onRevealed?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const flip = window.setTimeout(() => setFlipped(true), 350);
    // Fallback in case `transitionend` never fires (350 ms delay + 1.1 s flip).
    const done = window.setTimeout(() => onRevealed?.(), 1600);
    return () => {
      window.clearTimeout(flip);
      window.clearTimeout(done);
    };
  }, [onRevealed]);

  return (
    <div className="flip-scene w-44 sm:w-52" aria-live="polite">
      <div
        className="flip-card"
        data-flipped={flipped}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && flipped) onRevealed?.();
        }}
      >
        {/* front = before the flip: silhouette */}
        <div className="flip-face rounded-2xl bg-navy p-3 shadow-lg">
          <KingPortrait
            name={king.name}
            initial={king.initial}
            imageUrl={king.imageUrl}
            locked
            sizes="208px"
          />
          <p className="mt-2 text-center font-heading text-xl text-parchment">?</p>
        </div>
        {/* back = after the flip: the king */}
        <div className="flip-face flip-face-back parchment rounded-2xl p-3">
          <KingPortrait
            name={king.name}
            initial={king.initial}
            imageUrl={king.imageUrl}
            sizes="208px"
          />
          <p className="mt-2 text-center font-heading text-xl font-bold">{king.name}</p>
        </div>
      </div>
    </div>
  );
}

/** Shown when someone opens the golden round of a king they do not own. */
export function GoldenLocked({ king }: { king: QuizKing }) {
  return (
    <Card className="animate-card-reveal items-center text-center">
      <CardCorners className="m-1 size-8 text-gold-dark" />
      <CardContent className="flex flex-col items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-full bg-navy text-gold">
          <Lock className="size-6" aria-hidden />
        </span>
        <h2 className="text-3xl font-bold">Mistrovské kolo je zamčené</h2>
        <OrnamentDivider />
        <p className="text-muted-foreground">
          Mistrovské kolo se odemkne, až bude {king.name} ve tvé sbírce. Nejdřív
          vyhraj běžnou hru o kartu.
        </p>
        <Button asChild variant="accent" size="lg">
          <Link href={`/kral/${king.slug}`}>Hrát o kartu</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

const GOLD_SPARKLES = [
  { top: "8%", left: "8%", delay: "0s" },
  { top: "14%", left: "88%", delay: "0.5s" },
  { top: "62%", left: "4%", delay: "1.1s" },
  { top: "74%", left: "92%", delay: "0.2s" },
  { top: "38%", left: "95%", delay: "1.5s" },
  { top: "32%", left: "2%", delay: "0.8s" },
  { top: "90%", left: "50%", delay: "1.8s" },
];

/** Festive win screen: the ordinary card turns into a golden one. */
function GoldenWin({
  king,
  score,
  total,
  headingRef,
}: {
  king: QuizKing;
  score: number;
  total: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setFlipped(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      aria-labelledby="golden-win-heading"
      className="animate-card-reveal relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl bg-navy px-6 py-10 text-center text-parchment shadow-xl ring-2 ring-gold"
    >
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
      <CardCorners className="m-1 size-10 text-gold" />
      {GOLD_SPARKLES.map((sparkle, i) => (
        <span
          key={i}
          aria-hidden
          className="animate-sparkle absolute size-3 rotate-45 bg-gold-light"
          style={{ top: sparkle.top, left: sparkle.left, animationDelay: sparkle.delay }}
        />
      ))}

      <p id="quiz-result-score" className="relative text-xs font-semibold tracking-[0.3em] text-gold uppercase">
        Skóre {score} z {total} · bez chyby
      </p>

      <div className="flip-scene relative w-44 sm:w-52" aria-live="polite">
        <div className="flip-card" data-flipped={flipped}>
          {/* front: the ordinary card */}
          <div className="flip-face parchment rounded-2xl p-3 text-navy">
            <KingPortrait
              name={king.name}
              initial={king.initial}
              imageUrl={king.imageUrl}
              sizes="208px"
            />
            <p className="mt-2 font-heading text-xl font-bold">{king.name}</p>
          </div>
          {/* back: the golden card */}
          <div className="flip-face flip-face-back">
            <div className="golden-frame h-full rounded-2xl">
              <div className="golden-sheet golden-sheen h-full rounded-[12px] p-3 text-navy">
                <KingPortrait
                  name={king.name}
                  initial={king.initial}
                  imageUrl={king.imageUrl}
                  sizes="208px"
                />
                <p className="mt-2 font-heading text-xl font-bold">{king.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GoldenBadge className="relative" />
      <h2
        id="golden-win-heading"
        ref={headingRef}
        tabIndex={-1}
        aria-describedby="quiz-result-score"
        className={cn("relative text-4xl font-bold sm:text-5xl", HEADING_FOCUS)}
      >
        <span className="gilt-text animate-shimmer">Zlatá karta je tvoje!</span>
      </h2>
      <OrnamentDivider />
      <p className="relative max-w-md text-parchment/85">
        Všechny těžké otázky správně. {king.name} teď ve sbírce září zlatem.
      </p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Button asChild variant="accent" size="lg">
          <Link href="/sbirka">Moje sbírka</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Galerie</Link>
        </Button>
      </div>
    </section>
  );
}
