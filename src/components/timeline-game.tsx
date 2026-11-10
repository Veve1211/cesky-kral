"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Check, RotateCcw, Undo2 } from "lucide-react";

import { GameFinish } from "@/components/game-finish";
import { KingPortrait } from "@/components/king-portrait";
import { KofiButton } from "@/components/kofi-button";
import { CardCorners } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { AUTO_ADVANCE_MS, useAutoAdvanceAllowed } from "@/lib/auto-advance";
import { useCollectionReady } from "@/lib/collection";
import { sendAnswer, startScoredGame, type Finish } from "@/lib/game-client";
import type { GameRuler, Reign } from "@/lib/games";
import { kingInitial } from "@/lib/king-initial";
import { cn } from "@/lib/utils";
import { formatReignYears } from "@/lib/who-first";

type Game = { token: string; sessionId: string; rulers: GameRuler[] };
type Feedback = { correct: boolean; reigns: Reign[]; next: string[] | null; finish: Finish | null };

/**
 * "Řeka času": put four rulers in order – who started to reign first? The
 * server picks the rulers, keeps them, and checks the order; the years come
 * only with its answer. Every right round adds one, one mistake ends it.
 */
export function TimelineGame() {
  const ready = useCollectionReady();
  const [round, setRound] = useState(0);
  const [game, setGame] = useState<Game | null | "offline">(null);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const autoAdvanceAllowed = useAutoAdvanceAllowed();

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void startScoredGame("timeline").then((started) => {
      if (cancelled) return;
      if (!started) {
        setGame("offline");
        return;
      }
      setGame({ token: started.token, sessionId: started.game.sessionId, rulers: started.game.rulers });
      setSlugs(started.game.slugs);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, round]);

  const nextRef = useRef<() => void>(() => {});
  const autoNext = autoAdvanceAllowed && feedback?.correct === true;
  useEffect(() => {
    if (!autoNext) return;
    const timer = window.setTimeout(() => nextRef.current(), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [autoNext]);

  function nextRound() {
    if (!feedback?.next) return;
    setSlugs(feedback.next);
    setOrder([]);
    setFeedback(null);
    setError(null);
  }
  useEffect(() => {
    nextRef.current = nextRound;
  });

  if (game === "offline") {
    return <p className="parchment rounded-2xl p-6 text-center">Řeka času teď nejde hrát. Zkus to prosím za chvíli.</p>;
  }
  if (!game) return <div aria-busy="true" aria-label="Připravuji panovníky" className="parchment h-96 animate-pulse rounded-2xl" />;

  const rulers = slugs.map((slug) => game.rulers.find((r) => r.slug === slug)).filter((r): r is GameRuler => r !== undefined);
  const locked = isPending || feedback !== null;
  const gameOver = feedback !== null && !feedback.correct;

  function toggle(slug: string) {
    if (locked) return;
    setOrder((current) => (current.includes(slug) ? current.slice(0, current.indexOf(slug)) : [...current, slug]));
  }

  function submit() {
    if (locked || order.length !== rulers.length || !game || game === "offline") return;
    setError(null);
    const session = { token: game.token, sessionId: game.sessionId };
    startTransition(async () => {
      const result = await sendAnswer("timeline", session, { order });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFeedback({ correct: result.correct, reigns: result.reigns, next: result.next, finish: result.finish });
      if (result.correct) setScore((s) => s + 1);
    });
  }

  function restart() {
    setGame(null);
    setSlugs([]);
    setOrder([]);
    setFeedback(null);
    setScore(0);
    setError(null);
    setRound((r) => r + 1);
  }

  // After the answer: the rulers in the right order, with years.
  const shown = feedback
    ? feedback.reigns.map((reign) => ({ ruler: rulers.find((r) => r.slug === reign.slug)!, reign })).filter((x) => x.ruler)
    : rulers.map((ruler) => ({ ruler, reign: null as Reign | null }));

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-center justify-center gap-2 text-sm" aria-live="polite">
        <span aria-hidden>🌊</span>Správná kola: <strong data-testid="timeline-score">{score}</strong>
      </p>

      <p className="text-center text-sm text-muted-foreground" id="timeline-help">
        {feedback ? "Takhle šli po sobě:" : "Klepej postupně od toho, kdo začal vládnout nejdřív. Klepnutím na očíslovaného ho vrátíš."}
      </p>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="list" aria-describedby="timeline-help">
        {shown.map(({ ruler, reign }, i) => {
          const position = order.indexOf(ruler.slug);
          const placedRight = feedback && order[i] === ruler.slug;
          return (
            <li key={`${slugs.join("-")}-${ruler.slug}`}>
              <button
                type="button"
                onClick={() => toggle(ruler.slug)}
                disabled={locked}
                aria-pressed={position >= 0}
                aria-label={`${ruler.name}${position >= 0 ? `, pořadí ${position + 1}` : ""}${reign ? `, ${formatReignYears(reign)}` : ""}`}
                className={cn(
                  "parchment relative flex w-full flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center text-navy outline-none transition-[translate,box-shadow] focus-visible:ring-4 focus-visible:ring-ring/60 enabled:cursor-pointer enabled:hover:-translate-y-0.5 disabled:cursor-default",
                  position >= 0 && !feedback && "ring-4 ring-gold",
                  feedback && (placedRight ? "ring-4 ring-success" : "ring-4 ring-destructive/70"),
                  feedback?.correct && "animate-answer-pulse",
                  gameOver && "animate-answer-shake",
                )}
              >
                <CardCorners className="m-1 size-5 text-gold-dark" />
                {position >= 0 && (
                  <span aria-hidden data-testid="timeline-number" className="absolute top-1.5 left-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-gold shadow">
                    {position + 1}
                  </span>
                )}
                <KingPortrait name={ruler.name} initial={kingInitial(ruler.name)} imageUrl={ruler.imageUrl} sizes="140px" className="w-20 sm:w-24" />
                <span className="text-[10px] font-semibold tracking-[0.2em] text-gold-dark uppercase">{ruler.title}</span>
                <span className="font-heading text-lg leading-tight font-bold">{ruler.name}</span>
                <span className={cn("text-sm tabular-nums", reign ? "font-semibold text-ink" : "text-muted-foreground")}>
                  {reign ? formatReignYears(reign) : <span aria-hidden>???? – ????</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div aria-live="polite" className="flex flex-col items-center gap-3 text-center">
        {!feedback && (
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="lg" onClick={() => setOrder([])} disabled={order.length === 0 || locked}>
              <Undo2 aria-hidden />
              Znovu
            </Button>
            <Button variant="accent" size="lg" onClick={submit} disabled={order.length !== rulers.length || locked}>
              <Check aria-hidden />
              Ověřit pořadí
            </Button>
          </div>
        )}
        {feedback?.correct && (
          <>
            <p className="font-heading text-2xl font-bold text-success">Správně! 🌊 {score}</p>
            <Button variant="accent" size="lg" onClick={nextRound} autoFocus className="relative overflow-hidden">
              Další kolo
              <ArrowRight aria-hidden />
              {autoNext && (
                <span aria-hidden data-testid="auto-advance" className="animate-auto-advance absolute inset-x-0 bottom-0 h-1 origin-left bg-navy/60" />
              )}
            </Button>
          </>
        )}
        {gameOver && (
          <>
            <p className="font-heading text-2xl font-bold text-destructive">Vedle! Konec hry.</p>
            <p className="text-sm">
              Správná kola: <strong className="text-lg">{score}</strong>
            </p>
            <Button variant="accent" size="lg" onClick={restart} autoFocus>
              <RotateCcw aria-hidden />
              Hrát znovu
            </Button>
            <GameFinish mode="timeline" finish={feedback.finish} />
            <KofiButton className="max-w-sm" />
          </>
        )}
      </div>
    </div>
  );
}
