"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, RotateCcw, X } from "lucide-react";

import { checkAnswer } from "@/app/actions/quiz";
import { KingPortrait } from "@/components/king-portrait";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { RoyalCelebration } from "@/components/royal-celebration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { addToCollection, readCollection } from "@/lib/collection";
import { CORRECT_TO_COLLECT } from "@/lib/game-rules";
import type { AnswerResult, QuizQuestion } from "@/lib/quiz-types";
import { cn } from "@/lib/utils";

type Feedback = Extract<AnswerResult, { ok: true }>;

type QuizProps =
  | {
      mode: "king";
      questions: QuizQuestion[];
      allKingSlugs: string[];
      king: {
        slug: string;
        name: string;
        initial: string;
        imageUrl: string | null;
      };
    }
  | { mode: "quick"; questions: QuizQuestion[] };

export function Quiz(props: QuizProps) {
  const { questions } = props;
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [collected, setCollected] = useState(false);
  const [completedAll, setCompletedAll] = useState(false);
  const [isPending, startTransition] = useTransition();

  const total = questions.length;
  const question = questions[index];
  const locked = isPending || feedback !== null;

  function choose(answerId: number) {
    if (locked || !question) return;
    setSelectedId(answerId);
    setError(null);
    startTransition(async () => {
      try {
        const result = await checkAnswer(question.id, answerId);
        if (!result.ok) {
          setError(result.error);
          setSelectedId(null);
          return;
        }
        setFeedback(result);
        if (result.correct) setScore((s) => s + 1);
      } catch {
        setError("Nepodařilo se ověřit odpověď. Zkus to znovu.");
        setSelectedId(null);
      }
    });
  }

  function next() {
    if (!feedback) return;
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelectedId(null);
      setFeedback(null);
      return;
    }
    // `score` already includes the last answer here.
    if (props.mode === "king" && score >= CORRECT_TO_COLLECT) {
      addToCollection(props.king.slug);
      setCollected(true);
      const owned = new Set(readCollection());
      setCompletedAll(
        props.allKingSlugs.length > 0 &&
          props.allKingSlugs.every((slug) => owned.has(slug)),
      );
    }
    setFinished(true);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSelectedId(null);
    setFeedback(null);
    setError(null);
    setFinished(false);
    setCollected(false);
    setCompletedAll(false);
    router.refresh(); // new shuffle / new random questions from the server
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

  if (finished) {
    return (
      <Results
        {...props}
        score={score}
        total={total}
        collected={collected}
        completedAll={completedAll}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>
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
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {props.mode === "quick" ? question.kingName : `Otázka ${index + 1}`}
          </p>
          <h2 className="text-2xl leading-snug font-bold sm:text-3xl">
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
              <Button onClick={next} autoFocus className="self-end">
                {index + 1 < total ? "Další otázka" : "Zobrazit výsledek"}
                <ArrowRight aria-hidden />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Results(
  props: QuizProps & {
    score: number;
    total: number;
    collected: boolean;
    completedAll: boolean;
    onRestart: () => void;
  },
) {
  const { score, total, onRestart } = props;

  if (props.mode === "king" && props.collected) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="items-center text-center">
          <CardCorners className="m-1 size-8 text-gold-dark" />
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
              Skóre {score} z {total}
            </p>
            <CardFlipReveal king={props.king} />
            <h2 className="text-4xl font-bold">Král je ve tvé sbírce!</h2>
            <OrnamentDivider />
            <p className="text-muted-foreground">
              Skvělá práce. Karta už na tebe čeká v galerii.
            </p>
            {!props.completedAll && (
              <Button asChild variant="accent" size="lg">
                <Link href="/">Do sbírky</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        {props.completedAll && (
          <RoyalCelebration total={props.allKingSlugs.length}>
            <Button asChild variant="accent" size="lg" className="mt-2">
              <Link href="/">Prohlédnout sbírku</Link>
            </Button>
          </RoyalCelebration>
        )}
      </div>
    );
  }

  const isKing = props.mode === "king";

  return (
    <Card className="animate-card-reveal items-center text-center">
      <CardCorners className="m-1 size-8 text-gold-dark" />
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
          {isKing ? "Konec hry" : "Konec rychlovky"}
        </p>
        <p className="font-heading text-7xl font-bold">
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
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onRestart} size="lg" variant={isKing ? "accent" : "default"}>
            <RotateCcw aria-hidden />
            {isKing ? "Zkusit znovu" : "Hrát znovu"}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Do sbírky</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Card turns over from the dark silhouette to the king's portrait. */
function CardFlipReveal({
  king,
}: {
  king: { name: string; initial: string; imageUrl: string | null };
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setFlipped(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flip-scene w-44 sm:w-52" aria-live="polite">
      <div className="flip-card" data-flipped={flipped}>
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
