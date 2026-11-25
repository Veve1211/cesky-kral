"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, X } from "lucide-react";

import { checkAnswer } from "@/app/actions/quiz";
import { CardCelebration, type CelebratedCard } from "@/components/card-celebration";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { KnightOath } from "@/components/knight-oath";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners } from "@/components/ornaments";
import { GoldenLocked, Results } from "@/components/quiz-results";
import { HEADING_FOCUS, type QuizProps } from "@/components/quiz-shared";
import { TierCelebration, type CelebratedRuler } from "@/components/tier-celebration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AUTO_ADVANCE_MS, useAutoAdvanceAllowed } from "@/lib/auto-advance";
import { addGoldenCard, addToCollection, readCollection, useCollection, useCollectionReady } from "@/lib/collection";
import { unlockedBy } from "@/lib/crest-unlocks";
import { CORRECT_TO_COLLECT } from "@/lib/game-rules";
import { recordCorrectAnswer } from "@/lib/mastery-progress";
import type { AnswerResult } from "@/lib/quiz-types";
import { cn } from "@/lib/utils";

// The quiz itself (question, answers, feedback, celebrations). Result screens live in
// quiz-results.tsx, the shared props type in quiz-shared.ts.
type Feedback = Extract<AnswerResult, { ok: true }>;

type CelebrationInput =
  | { kind: "crown"; ruler: CelebratedRuler; tier: 1 | 2 | 3; unlocked: string[] }
  | { kind: "card"; card: CelebratedCard; firstTime: boolean; unlocked: string[] };
type Celebration = CelebrationInput & { id: number };

export function Quiz(props: QuizProps) {
  const { questions } = props;
  const router = useRouter();

  const [index, setIndex] = useState(props.mode === "daily" ? props.startIndex : 0);
  const [score, setScore] = useState(props.mode === "daily" ? props.startScore : 0);
  /** Right/wrong per answered question, in order (for sharing the result). */
  const [marks, setMarks] = useState<boolean[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  /**
   * Celebrations, one at a time (never two over each other). A new "koruna
   * učenosti" is shown right after the answer – except in a king round, where
   * it waits for the end of the round: the card comes first, then the crown.
   */
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const celebrationCounter = useRef(0);
  /** Highest crown reached during the current king round (shown at its end). */
  const pendingCrown = useRef<{ ruler: CelebratedRuler; tier: 1 | 2 | 3; unlocked: string[] } | null>(null);

  function queueCelebrations(items: CelebrationInput[]) {
    if (items.length === 0) return;
    setCelebrations((current) => [
      ...current,
      ...items.map((item) => ({ ...item, id: ++celebrationCounter.current }) as Celebration),
    ]);
  }
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [collected, setCollected] = useState(false);
  const [completedAll, setCompletedAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isClient = useCollectionReady();
  const { kings: ownedKings } = useCollection();

  const total = questions.length;
  const question = questions[index];
  const locked = isPending || feedback !== null;
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const focusQuestions = useRef(props.mode === "king" && props.focusFirstQuestion === true);

  useEffect(() => {
    if (finished) {
      resultHeading.current?.focus();
    } else if (focusQuestions.current) {
      questionHeading.current?.focus();
    }
  }, [index, finished, collected, question?.id]);

  function choose(answerId: number) {
    if (locked || !question) return;
    setSelectedId(answerId);
    setError(null);
    startTransition(async () => {
      try {
        const result =
          (props.mode === "daily" || props.mode === "quick") && props.check
            ? await props.check(question.id, answerId)
            : await checkAnswer(question.id, answerId);
        if (!result.ok) {
          setError(result.error);
          setSelectedId(null);
          return;
        }
        setFeedback(result);
        if (result.correct) setScore((s) => s + 1);
        setMarks((current) => [...current, result.correct]);
        if (result.correct && result.ruler.countsForCrowns) {
          const { ruler } = result;
          let reached: 1 | 2 | 3 | null = null;
          // Crest parts this crown unlocks are shown on its celebration.
          const unlocked = unlockedBy(rulerTotal(ruler.rulerCount), () => {
            reached = recordCorrectAnswer(ruler.slug, ruler.questionKey, ruler.totalQuestions);
          });
          const tier = reached as 1 | 2 | 3 | null;
          if (tier && props.mode === "king") {
            const before = pendingCrown.current;
            const parts = [...new Set([...(before?.unlocked ?? []), ...unlocked])];
            pendingCrown.current = !before || tier > before.tier ? { ruler, tier, unlocked: parts } : { ...before, unlocked: parts };
          } else if (tier) {
            queueCelebrations([{ kind: "crown", ruler, tier, unlocked }]);
          }
        }
        if (props.mode === "daily") props.onAnswered(index, result.correct);
      } catch {
        setError("Nepodařilo se ověřit odpověď. Zkus to znovu.");
        setSelectedId(null);
      }
    });
  }

  /** Rulers in the game: the king round knows them all, other modes ask the server. */
  function rulerTotal(fromServer: number): number {
    return props.mode === "king" && props.allKingSlugs.length > 0 ? props.allKingSlugs.length : fromServer;
  }

  function saveKing(): boolean {
    if (props.mode !== "king" || score < CORRECT_TO_COLLECT) return false;
    const saved = addToCollection(props.king.slug);
    setCollected(saved);
    const owned = new Set(readCollection().kings);
    setCompletedAll(
      saved &&
        props.allKingSlugs.length > 0 &&
        props.allKingSlugs.every((slug) => owned.has(slug)),
    );
    return saved;
  }

  // A right answer moves on by itself after a short moment (not while a
  // celebration is open – it starts again after "Pokračovat"). A wrong one
  // waits for "Další", so the right answer and the explanation can be read.
  const nextRef = useRef<() => void>(() => {});
  const autoAdvanceAllowed = useAutoAdvanceAllowed();
  const autoAdvance = autoAdvanceAllowed && feedback?.correct === true && celebrations.length === 0 && !finished;
  useEffect(() => {
    if (!autoAdvance) return;
    const timer = window.setTimeout(() => nextRef.current(), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [autoAdvance, index]);

  function next() {
    if (!feedback) return;
    if (index + 1 < total) {
      focusQuestions.current = true;
      setIndex(index + 1);
      setSelectedId(null);
      setFeedback(null);
      return;
    }
    if (props.mode === "daily") {
      props.onFinished();
      return;
    }
    // `score` already includes the last answer here.
    if (props.mode === "golden" && score === total) {
      setCollected(addGoldenCard(props.king.slug));
    }
    if (props.mode === "king") {
      const queue: CelebrationInput[] = [];
      if (score >= CORRECT_TO_COLLECT) {
        const ownedBefore = readCollection().kings.includes(props.king.slug);
        let saved = false;
        const unlocked = unlockedBy(rulerTotal(0), () => {
          saved = saveKing();
        });
        if (saved) queue.push({ kind: "card", card: props.king, firstTime: !ownedBefore, unlocked });
      }
      // The card first, then the crown reached during the round.
      if (pendingCrown.current) queue.push({ kind: "crown", ...pendingCrown.current });
      pendingCrown.current = null;
      queueCelebrations(queue);
    }
    setFinished(true);
  }

  useEffect(() => {
    nextRef.current = next;
  });

  function restart() {
    if ((props.mode === "quick" || props.mode === "king") && props.onRestart) {
      props.onRestart();
      return;
    }
    focusQuestions.current = true;
    setIndex(0);
    setScore(0);
    setMarks([]);
    setSelectedId(null);
    setFeedback(null);
    setError(null);
    setFinished(false);
    setCollected(false);
    setCompletedAll(false);
    setCelebrations([]);
    pendingCrown.current = null;
    router.refresh(); // new shuffle / new random questions from the server
  }

  /** The first queued celebration; "Pokračovat" shows the next one. */
  function celebrationOverlay(returnFocusTo: string) {
    const current = celebrations[0] ?? null;
    const close = () => setCelebrations((queue) => queue.slice(1));
    return (
      <>
        <TierCelebration
          ruler={current?.kind === "crown" ? current.ruler : null}
          tier={current?.kind === "crown" ? current.tier : null}
          unlockedParts={current?.kind === "crown" ? current.unlocked : []}
          celebrationId={current?.id}
          onClose={close}
          returnFocusTo={returnFocusTo}
        />
        <CardCelebration
          card={current?.kind === "card" ? current.card : null}
          firstTime={current?.kind === "card" ? current.firstTime : false}
          unlockedParts={current?.kind === "card" ? current.unlocked : []}
          celebrationId={current?.id}
          onClose={close}
          returnFocusTo={returnFocusTo}
          timeline={props.mode === "king" ? props.timeline : []}
        />
      </>
    );
  }

  if (total === 0) {
    return (
      <Card>
        <CardContent className="text-center text-muted-foreground">
          Zatím tu nejsou žádné otázky.
        </CardContent>
      </Card>
    );
  }

  // The golden round is only for kings already in the collection.
  if (props.mode === "golden" && !finished) {
    if (!isClient) {
      return <div aria-busy="true" className="parchment h-80 animate-pulse rounded-2xl" />;
    }
    if (!ownedKings.includes(props.king.slug)) {
      return <GoldenLocked king={props.king} />;
    }
  }

  if (finished) {
    return (
      <>
      {celebrationOverlay("quiz-result-heading")}
      <Results
        {...props}
        score={score}
        total={total}
        marks={marks}
        collected={collected}
        completedAll={completedAll}
        onRestart={restart}
        onRetrySave={() => {
          if (props.mode !== "king") return;
          // The card may have been saved meanwhile in another tab.
          const ownedBefore = readCollection().kings.includes(props.king.slug);
          let saved = false;
          const unlocked = unlockedBy(rulerTotal(0), () => {
            saved = saveKing();
          });
          if (saved) queueCelebrations([{ kind: "card", card: props.king, firstTime: !ownedBefore, unlocked }]);
        }}
        headingRef={resultHeading}
      />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {index === 0 && <KnightOath />}

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span id="quiz-question-progress">
            Otázka <strong>{index + 1}</strong> z {total}
          </span>
          <span className="text-muted-foreground">
            Správně: <strong className="text-foreground">{score}</strong>
          </span>
        </div>
        <Progress
          value={index + (feedback ? 1 : 0)}
          max={total}
          label="Postup ve hře"
        />
      </div>

      <Card key={question.id} className="animate-card-reveal">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            {props.mode === "quick" || props.mode === "daily" ? (
              // Questions across rulers: the ruler's name must be easy to see.
              <p data-testid="question-ruler" className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="sr-only">Panovník: </span>
                <span aria-hidden className="text-base leading-none">👑</span>
                <span className="font-heading text-lg leading-none font-bold sm:text-xl">{question.kingName}</span>
                {question.isLegend && <LegendBadge />}
              </p>
            ) : (
              <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">{`Otázka ${index + 1}`}</p>
            )}
            <DifficultyBadge difficulty={question.difficulty} className="mr-4" />
          </div>
          <h2
            ref={questionHeading}
            tabIndex={-1}
            aria-describedby="quiz-question-progress"
            className={cn("text-2xl leading-snug font-bold sm:text-3xl", HEADING_FOCUS)}
          >
            {question.text}
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {question.answers.map((answer, i) => {
            const isCorrect = feedback?.correctAnswerId === answer.id;
            const isWrongPick =
              feedback !== null && selectedId === answer.id && !isCorrect;
            const isDimmed = feedback !== null && !isCorrect && !isWrongPick;

            return (
              <Button
                key={answer.id}
                variant="outline"
                size="lg"
                onClick={() => choose(answer.id)}
                disabled={locked && !isCorrect && !isWrongPick}
                aria-disabled={locked}
                aria-pressed={selectedId === answer.id}
                className={cn(
                  "h-auto justify-start py-4 text-left whitespace-normal",
                  locked && "pointer-events-none",
                  isPending && selectedId === answer.id && "animate-pulse border-accent",
                  isCorrect &&
                    "animate-answer-pulse border-success bg-success text-white hover:bg-success",
                  isWrongPick &&
                    "animate-answer-shake border-destructive bg-destructive text-white hover:bg-destructive",
                  isDimmed && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold",
                    (isCorrect || isWrongPick) && "bg-white/20 text-white",
                  )}
                  aria-hidden
                >
                  {isCorrect ? (
                    <Check className="size-4" />
                  ) : isWrongPick ? (
                    <X className="size-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {answer.text}
              </Button>
            );
          })}

          {error && (
            <p role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          )}

          {feedback && (
            <div
              role="status"
              className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-3 rounded-xl border border-gold/40 bg-white/40 p-4 duration-300"
            >
              <p
                className={cn(
                  "font-heading text-lg font-bold",
                  feedback.correct ? "text-success" : "text-destructive",
                )}
              >
                {feedback.correct ? "Správně!" : "Tentokrát vedle."}
              </p>
              <p className="text-sm">{feedback.explanation}</p>
              {feedback.sourceUrl && (
                <a
                  href={feedback.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Zdroj
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              )}
              <Button id="quiz-next" onClick={next} autoFocus className="relative self-end overflow-hidden">
                {index + 1 < total ? "Další otázka" : "Zobrazit výsledek"}
                <ArrowRight aria-hidden />
                {autoAdvance && (
                  <span
                    aria-hidden
                    data-testid="auto-advance"
                    className="animate-auto-advance absolute inset-x-0 bottom-0 h-1 origin-left bg-gold"
                  />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {celebrationOverlay("quiz-next")}
    </div>
  );
}
