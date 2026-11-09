"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

import { checkWhoFirst } from "@/app/actions/who-first";
import { KingPortrait } from "@/components/king-portrait";
import { KofiButton } from "@/components/kofi-button";
import { CardCorners } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { kingInitial } from "@/lib/king-initial";
import { cn } from "@/lib/utils";
import {
  formatReignYears,
  pickPair,
  type WhoFirstKing,
  type WhoFirstPair,
  type WhoFirstResult,
} from "@/lib/who-first";
import { saveBestStreak, useBestStreak } from "@/lib/who-first-best";

type Feedback = Extract<WhoFirstResult, { ok: true }>;

/**
 * "Kdo vládl dřív?" – pick the king who started to reign first.
 * `full`: endless game with a streak (/kdo-driv).
 * `teaser`: one pair on the home page, then "Hrát dál".
 */
export function WhoFirstGame({
  kings,
  initialPair,
  variant,
}: {
  kings: WhoFirstKing[];
  initialPair: WhoFirstPair | null;
  variant: "full" | "teaser";
}) {
  const [pair, setPair] = useState(initialPair);
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [isPending, startTransition] = useTransition();
  const best = useBestStreak();
  const full = variant === "full";

  if (!pair) {
    return (
      <p className="text-center text-muted-foreground">
        Na tuhle hru jsou potřeba aspoň dva panovníci.
      </p>
    );
  }

  const options = [kings[pair[0]], kings[pair[1]]];
  const locked = isPending || feedback !== null;
  const gameOver = feedback !== null && !feedback.correct;

  function choose(slug: string) {
    if (locked) return;
    const [first, second] = options;
    setChosen(slug);
    setError(null);
    startTransition(async () => {
      try {
        const result = await checkWhoFirst(first.slug, second.slug, slug);
        if (!result.ok) {
          setError(result.error);
          setChosen(null);
          return;
        }
        setFeedback(result);
        if (result.correct) {
          const next = streak + 1;
          setStreak(next);
          // Save right away, so leaving mid-run keeps the record.
          if (full) saveBestStreak(next);
        }
      } catch {
        setError("Nepodařilo se ověřit odpověď. Zkus to znovu.");
        setChosen(null);
      }
    });
  }

  function nextPair() {
    setPair((current) => pickPair(kings.length, current));
    setChosen(null);
    setFeedback(null);
    setError(null);
  }

  function restart() {
    setStreak(0);
    nextPair();
  }

  const reignOf = (slug: string) => feedback?.reigns.find((reign) => reign.slug === slug) ?? null;

  return (
    <div className={cn("flex flex-col", full ? "gap-5" : "gap-3")}>
      {full && (
        <p className="flex items-center justify-center gap-4 text-sm" aria-live="polite">
          <span>
            <span aria-hidden>🔥 </span>Série: <strong>{streak}</strong>
          </span>
          <span className="text-muted-foreground">
            Nejlepší: <strong className="text-navy">{Math.max(best, streak)}</strong>
          </span>
        </p>
      )}

      <div
        className={cn("grid gap-3", full ? "sm:grid-cols-2 sm:gap-5" : "grid-cols-2")}
        role="group"
        aria-label="Kdo začal vládnout dřív?"
      >
        {options.map((king) => {
          const reign = reignOf(king.slug);
          const isEarlier = feedback?.earlierSlug === king.slug;
          const state =
            feedback === null
              ? chosen === king.slug
                ? "pending"
                : "idle"
              : chosen === king.slug
                ? feedback.correct
                  ? "right"
                  : "wrong"
                : isEarlier
                  ? "answer"
                  : "idle";
          return (
            <button
              key={`${pair.join("-")}-${king.slug}`}
              type="button"
              onClick={() => choose(king.slug)}
              disabled={locked}
              aria-pressed={chosen === king.slug}
              className={cn(
                "parchment relative flex items-center gap-3 rounded-2xl p-3 text-left text-navy outline-none transition-[translate,box-shadow] focus-visible:ring-4 focus-visible:ring-ring/60 enabled:cursor-pointer enabled:hover:-translate-y-0.5 disabled:cursor-default",
                full
                  ? "sm:flex-col sm:p-5 sm:text-center"
                  : "flex-col p-2.5 text-center min-[400px]:p-3",
                state === "pending" && "animate-pulse",
                state === "right" && "animate-answer-pulse ring-4 ring-success",
                state === "wrong" && "animate-answer-shake ring-4 ring-destructive",
                state === "answer" && "ring-4 ring-success",
              )}
            >
              <CardCorners className="m-1 size-6 text-gold-dark" />
              <KingPortrait
                name={king.name}
                initial={kingInitial(king.name)}
                imageUrl={king.imageUrl}
                sizes={full ? "(max-width: 640px) 80px, 200px" : "96px"}
                className={cn(
                  "shrink-0",
                  full ? "w-20 sm:w-full sm:max-w-[200px]" : "w-16 min-[400px]:w-20",
                )}
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-gold-dark uppercase">
                  {king.title}
                </span>
                <span
                  className={cn(
                    "font-heading leading-tight font-bold",
                    full ? "text-2xl" : "text-lg min-[400px]:text-xl",
                  )}
                >
                  {king.name}
                </span>
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    reign ? "font-semibold text-ink" : "text-muted-foreground",
                  )}
                >
                  {reign ? (
                    formatReignYears(reign)
                  ) : (
                    <>
                      <span aria-hidden>???? – ????</span>
                      <span className="sr-only">roky jsou skryté</span>
                    </>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div aria-live="polite" className="flex flex-col items-center gap-3 text-center">
        {feedback && (
          <>
            <p
              className={cn(
                "font-heading text-2xl font-bold",
                feedback.correct ? "text-success" : "text-destructive",
              )}
            >
              {feedback.correct
                ? full
                  ? `Správně! 🔥 ${streak}`
                  : "Správně!"
                : full
                  ? "Vedle! Konec hry."
                  : "Vedle!"}
            </p>
            <p className="max-w-md text-sm text-ink/85">{explain(options, feedback)}</p>
          </>
        )}

        {feedback && full && feedback.correct && (
          <Button variant="accent" size="lg" onClick={nextPair} autoFocus>
            Další
            <ArrowRight aria-hidden />
          </Button>
        )}

        {gameOver && full && (
          <div className="parchment relative flex w-full max-w-sm flex-col items-center gap-2 rounded-2xl px-6 py-5">
            <CardCorners className="m-1 size-6 text-gold-dark" />
            <p className="text-sm">
              Skóre: <strong className="text-lg">{streak}</strong>
            </p>
            <p className="text-sm">
              <span aria-hidden>🏆 </span>Nejlepší série:{" "}
              <strong className="text-lg">{Math.max(best, streak)}</strong>
            </p>
            <Button variant="accent" size="lg" onClick={restart} className="mt-1" autoFocus>
              <RotateCcw aria-hidden />
              Hrát znovu
            </Button>
          </div>
        )}
        {gameOver && full && <KofiButton className="max-w-sm" />}

        {feedback && !full && (
          <Button asChild variant="accent">
            <Link href="/kdo-driv">
              Hrát dál
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

const FEMALE_TITLES = new Set(["kněžna", "královna"]);

/** One sentence built only from the revealed years, e.g. "Karel IV. začal vládnout roku 1346, …". */
function explain(options: WhoFirstKing[], feedback: Feedback): string {
  const parts = [...options]
    .map((king) => ({ king, reign: feedback.reigns.find((reign) => reign.slug === king.slug) }))
    .filter((item) => item.reign !== undefined)
    .sort((a, b) => a.reign!.from - b.reign!.from)
    .map(({ king, reign }) => {
      const verb = FEMALE_TITLES.has(king.title) ? "začala" : "začal";
      return `${king.name} ${verb} vládnout roku ${reign!.from}`;
    });
  return `${parts.join(", ")}.`;
}
