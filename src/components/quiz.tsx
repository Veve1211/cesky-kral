"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Lock, RotateCcw, X } from "lucide-react";

import { checkAnswer } from "@/app/actions/quiz";
import { ChronicleDialog, type ChronicleKing } from "@/components/chronicle-dialog";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { GoldenBadge } from "@/components/golden-badge";
import { KingPortrait } from "@/components/king-portrait";
import { KnightOath } from "@/components/knight-oath";
import { KofiButton } from "@/components/kofi-button";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { RoyalCelebration } from "@/components/royal-celebration";
import { ShareButton } from "@/components/share-button";
import { CardCelebration, type CelebratedCard } from "@/components/card-celebration";
import { TierCelebration, type CelebratedRuler } from "@/components/tier-celebration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  addGoldenCard,
  addToCollection,
  readCollection,
  useCollection,
  useCollectionReady,
} from "@/lib/collection";
import type { Chronicle } from "@/lib/chronicle";
import { AUTO_ADVANCE_MS, useAutoAdvanceAllowed } from "@/lib/auto-advance";
import { CORRECT_TO_COLLECT } from "@/lib/game-rules";
import type { AnswerResult, QuizQuestion } from "@/lib/quiz-types";
import { unlockedBy } from "@/lib/crest-unlocks";
import { recordCorrectAnswer } from "@/lib/mastery-progress";
import { quickShareText } from "@/lib/share-text";
import { cn } from "@/lib/utils";

type Feedback = Extract<AnswerResult, { ok: true }>;

type CelebrationInput =
  | { kind: "crown"; ruler: CelebratedRuler; tier: 1 | 2 | 3; unlocked: string[] }
  | { kind: "card"; card: CelebratedCard; firstTime: boolean; unlocked: string[] };
type Celebration = CelebrationInput & { id: number };

const HEADING_FOCUS = "scroll-mt-20 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

type QuizKing = {
  slug: string;
  name: string;
  initial: string;
  imageUrl: string | null;
};

type QuizProps =
  | {
      mode: "king";
      questions: QuizQuestion[];
      allKingSlugs: string[];
      king: Omit<ChronicleKing, "chronicle"> &
        QuizKing & {
          chronicle: Chronicle | null;
        };
    }
  | { mode: "golden"; questions: QuizQuestion[]; king: QuizKing }
  | {
      mode: "quick";
      questions: QuizQuestion[];
      /** Checks (and records) the answer on the server – scored mode. */
      check?: (questionId: number, answerId: number) => Promise<AnswerResult>;
      /** A new game is started by the caller (new server session). */
      onRestart?: () => void;
      /** Shown on the result card (personal record, leaderboard…). */
      resultExtra?: ReactNode;
    }
  | {
      /** Daily challenge: resumable, every answer is reported, results are shown by the caller. */
      mode: "daily";
      questions: QuizQuestion[];
      startIndex: number;
      startScore: number;
      onAnswered: (index: number, correct: boolean) => void;
      onFinished: () => void;
      /** Checks (and records) the answer on the server – scored mode. */
      check?: (questionId: number, answerId: number) => Promise<AnswerResult>;
    };

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
  const focusQuestions = useRef(false);

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
        if (result.correct) {
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
    if (props.mode === "quick" && props.onRestart) {
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
    <div className="flex flex-col gap-6">
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
            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
              {props.mode === "quick" || props.mode === "daily" ? question.kingName : `Otázka ${index + 1}`}
              {(props.mode === "quick" || props.mode === "daily") && question.isLegend && <LegendBadge />}
            </p>
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

function Results(
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
            {!props.completedAll && (
              <Button asChild variant="accent" size="lg">
                <Link href="/sbirka">Do sbírky</Link>
              </Button>
            )}
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
function GoldenLocked({ king }: { king: QuizKing }) {
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
