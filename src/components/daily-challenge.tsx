"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, Zap } from "lucide-react";

import { KofiButton } from "@/components/kofi-button";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Quiz } from "@/components/quiz";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCollectionReady } from "@/lib/collection";
import {
  dailyShareText,
  formatCountdown,
  formatDailyDate,
  formatStreakDays,
  msUntilNextDaily,
} from "@/lib/daily";
import {
  currentStreak,
  marksFor,
  readDailyProgress,
  recordDailyAnswer,
  useDailyProgress,
} from "@/lib/daily-progress";
import type { QuizQuestion } from "@/lib/quiz-types";
import { cn } from "@/lib/utils";

/**
 * "Denní výzva" for one day. Progress lives in localStorage, so nothing is
 * rendered until the client can read it (no flash of a fresh game).
 */
export function DailyChallenge({ dateKey, questions }: { dateKey: string; questions: QuizQuestion[] }) {
  const ready = useCollectionReady();
  if (!ready) return <div aria-busy="true" aria-label="Načítám výzvu" className="parchment h-80 animate-pulse rounded-2xl" />;
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center text-muted-foreground">Dnes tu výzva chybí. Zkus to později.</CardContent>
      </Card>
    );
  }
  return <DailyRound dateKey={dateKey} questions={questions} />;
}

function DailyRound({ dateKey, questions }: { dateKey: string; questions: QuizQuestion[] }) {
  const total = questions.length;
  // Read once: the round resumes after the last answered question.
  const [initial] = useState(() => [...marksFor(readDailyProgress(), dateKey)].slice(0, total));
  const [marks, setMarks] = useState<boolean[]>(initial);
  const [finished, setFinished] = useState(initial.length >= total);
  const [justFinished, setJustFinished] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const progress = useDailyProgress();

  if (!finished) {
    return (
      <div className="flex flex-col gap-4">
        {initial.length > 0 && (
          <p className="rounded-xl bg-navy px-4 py-2 text-center text-sm text-parchment">
            Pokračuješ v rozehrané výzvě. Odpovědi, které už padly, platí.
          </p>
        )}
        <Quiz
          mode="daily"
          questions={questions}
          startIndex={initial.length}
          startScore={initial.filter(Boolean).length}
          onAnswered={(index, correct) => {
            setMarks((current) => (current.length === index ? [...current, correct] : current));
            if (!recordDailyAnswer(dateKey, index, correct, total)) setSaveFailed(true);
          }}
          onFinished={() => {
            setJustFinished(true);
            setFinished(true);
          }}
        />
      </div>
    );
  }

  return (
    <DailyResult
      dateKey={dateKey}
      marks={marks}
      streak={currentStreak(progress, dateKey)}
      focusHeading={justFinished}
      saveFailed={saveFailed}
    />
  );
}

function DailyResult({
  dateKey,
  marks,
  streak,
  focusHeading,
  saveFailed,
}: {
  dateKey: string;
  marks: readonly boolean[];
  streak: number;
  focusHeading: boolean;
  saveFailed: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const score = marks.filter(Boolean).length;

  useEffect(() => {
    if (focusHeading) heading.current?.focus();
  }, [focusHeading]);

  return (
    <Card className="animate-card-reveal items-center text-center">
      <CardCorners className="m-1 size-8 text-gold-dark" />
      <CardContent className="flex flex-col items-center gap-4">
        <h2
          ref={heading}
          tabIndex={-1}
          aria-describedby="daily-result-score"
          className="scroll-mt-20 rounded-sm font-sans text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
        >
          Výzva {formatDailyDate(dateKey)} splněna
        </h2>
        <p id="daily-result-score" className="font-heading text-7xl font-bold">
          {score}
          <span className="text-3xl text-muted-foreground"> z {marks.length}</span>
        </p>

        <ol aria-label="Tvoje odpovědi" className="flex gap-1.5 text-2xl">
          {marks.map((correct, i) => (
            <li
              key={i}
              className={cn(
                "flex size-11 items-center justify-center rounded-full shadow ring-2",
                correct ? "bg-navy ring-gold" : "bg-parchment ring-gold-dark/40",
              )}
            >
              <span aria-hidden>{correct ? "👑" : "⚔️"}</span>
              <span className="sr-only">
                {i + 1}. otázka {correct ? "správně" : "špatně"}
              </span>
            </li>
          ))}
        </ol>

        {streak > 0 && (
          <p className="font-heading text-2xl font-bold">
            <span aria-hidden>🔥 </span>
            Série: {formatStreakDays(streak)} v řadě
          </p>
        )}

        {saveFailed && (
          <p role="alert" className="text-sm text-destructive">
            Výsledek se nepodařilo uložit v prohlížeči. Povol ukládání dat, ať ti série nezmizí.
          </p>
        )}

        <OrnamentDivider />
        <ShareButton
          text={dailyShareText(dateKey, marks, streak)}
          url={typeof window === "undefined" ? "" : `${window.location.origin}/vyzva`}
        />
        <NextChallenge />
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" size="lg">
            <Link href="/rychlovka">
              <Zap aria-hidden />
              Rychlovka
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Galerie</Link>
          </Button>
        </div>
        <KofiButton variant="card" className="mt-2" />
      </CardContent>
    </Card>
  );
}

// Ticks once a second; the server renders no time at all (avoids hydration mismatch).
function subscribeClock(onTick: () => void) {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
}
const nowInSeconds = () => Math.floor(Date.now() / 1000);

/** "Další výzva za 05:12:33", then a button to load the new one. */
function NextChallenge() {
  const router = useRouter();
  const seconds = useSyncExternalStore(subscribeClock, nowInSeconds, () => null);
  if (seconds === null) return <p className="min-h-6" />;

  const left = msUntilNextDaily(new Date(seconds * 1000));
  if (left <= 1000) {
    return (
      <Button onClick={() => router.refresh()} variant="default" size="lg">
        <RotateCcw aria-hidden />
        Nová výzva je tu
      </Button>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      Další výzva za{" "}
      {/* Not a live region: a screen reader would read it every second. */}
      <time dateTime={`PT${Math.ceil(left / 1000)}S`} className="font-semibold text-ink tabular-nums">
        {formatCountdown(left)}
      </time>
    </p>
  );
}
