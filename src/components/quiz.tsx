"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, RotateCcw, X } from "lucide-react";

import { checkAnswer } from "@/app/actions/quiz";
import { Crest } from "@/components/crest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { addToCollection } from "@/lib/collection";
import { CORRECT_TO_COLLECT } from "@/lib/game-rules";
import type { AnswerResult, QuizQuestion } from "@/lib/quiz-types";
import { cn } from "@/lib/utils";

type Feedback = Extract<AnswerResult, { ok: true }>;

type QuizProps =
  | {
      mode: "king";
      questions: QuizQuestion[];
      king: { slug: string; name: string; initial: string };
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
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {props.mode === "quick" ? question.kingName : "Otázka"}
          </p>
          <h2 className="text-xl font-bold leading-snug sm:text-2xl">
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
                    "animate-answer-pop border-success bg-success text-white",
                  isWrongPick &&
                    "animate-answer-shake border-destructive bg-destructive text-white",
                  isDimmed && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-sm text-gold",
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
              className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-3 rounded-xl bg-background/70 p-4 duration-300"
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
    onRestart: () => void;
  },
) {
  const { score, total, onRestart } = props;

  if (props.mode === "king" && props.collected) {
    return (
      <Card className="items-center text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Skóre {score} z {total}
          </p>
          <div className="animate-card-reveal w-48 rounded-2xl border-2 border-gold bg-parchment p-6 shadow-lg [animation-duration:900ms]">
            <Crest initial={props.king.initial} />
            <p className="mt-3 font-heading text-xl font-bold">
              {props.king.name}
            </p>
          </div>
          <h2 className="text-2xl font-bold">Král je ve tvé sbírce!</h2>
          <p className="text-muted-foreground">
            Skvělá práce. Karta už na tebe čeká v galerii.
          </p>
          <Button asChild variant="accent" size="lg">
            <Link href="/">Do sbírky</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isKing = props.mode === "king";

  return (
    <Card className="animate-card-reveal items-center text-center">
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {isKing ? "Konec hry" : "Konec rychlovky"}
        </p>
        <p className="font-heading text-5xl font-bold">
          {score}
          <span className="text-2xl text-muted-foreground"> z {total}</span>
        </p>
        <p className="text-muted-foreground">
          {isKing
            ? `Na kartu potřebuješ aspoň ${CORRECT_TO_COLLECT} správné odpovědi. Zkus to znovu!`
            : score === total
              ? "Bez jediné chyby, klobouk dolů!"
              : "Dobrá práce! Dáš příště víc?"}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onRestart} size="lg">
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
