"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

import { DailyCountdown } from "@/components/daily-countdown";
import { DailyStanding } from "@/components/daily-standing";
import { KofiButton } from "@/components/kofi-button";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Quiz } from "@/components/quiz";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCollectionReady } from "@/lib/collection";
import { dailyShareText, formatDailyDate, formatStreakDays } from "@/lib/daily";
import {
  currentStreak,
  marksFor,
  readDailyProgress,
  recordDailyAnswer,
  useDailyProgress,
} from "@/lib/daily-progress";
import type { Standing } from "@/lib/leaderboard";
import { announceLeaderboardChange, ensurePlayer, postJson } from "@/lib/player";
import type { AnswerResult, QuizQuestion } from "@/lib/quiz-types";
import { cn } from "@/lib/utils";

/**
 * "Denní výzva" for one day. Progress lives in localStorage (streak, resume)
 * and – for the leaderboard – on the server, which checks and counts every
 * answer itself. Nothing is rendered until the client can read it (no
 * flash of a fresh game).
 */
export function DailyChallenge({ dateKey, questions }: { dateKey: string; questions: QuizQuestion[] }) {
  const ready = useCollectionReady();
  if (!ready) return <DailySkeleton />;
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center text-muted-foreground">Dnes tu výzva chybí. Zkus to později.</CardContent>
      </Card>
    );
  }
  return <DailyRound dateKey={dateKey} questions={questions} />;
}

function DailySkeleton() {
  return <div aria-busy="true" aria-label="Načítám výzvu" className="parchment h-80 animate-pulse rounded-2xl" />;
}

type Connection =
  | { phase: "connecting" }
  /** Scored on the server; `marks` = answers so far (browser + server). */
  | { phase: "online"; token: string; marks: boolean[] }
  /** Server unreachable (or finished earlier without it): plays locally, not ranked. */
  | { phase: "offline"; marks: boolean[] };

function DailyRound({ dateKey, questions }: { dateKey: string; questions: QuizQuestion[] }) {
  const total = questions.length;
  // Read once: the round resumes after the last answered question.
  const [local] = useState(() => [...marksFor(readDailyProgress(), dateKey)].slice(0, total));
  const [connection, setConnection] = useState<Connection>(() =>
    local.length >= total ? { phase: "offline", marks: local } : { phase: "connecting" },
  );

  useEffect(() => {
    if (connection.phase !== "connecting") return;
    let cancelled = false;
    (async () => {
      const token = await ensurePlayer();
      const result = token
        ? await postJson<{ state: { answered: number; marks: boolean[]; finished: boolean } | null }>("/api/daily/start", {
            token,
            date: dateKey,
            offlineAnswered: local.length,
          })
        : null;
      if (cancelled) return;
      if (!token || !result?.ok || !result.state) {
        setConnection({ phase: "offline", marks: local });
        return;
      }
      // The server may know more answers (e.g. after moving to this device).
      const { state } = result;
      const marks = [...local];
      for (let i = local.length; i < Math.min(state.answered, total); i++) {
        marks.push(state.marks[i] ?? false);
        recordDailyAnswer(dateKey, i, state.marks[i] ?? false, total);
      }
      setConnection({ phase: "online", token, marks });
    })();
    return () => {
      cancelled = true;
    };
  }, [connection.phase, dateKey, local, total]);

  if (connection.phase === "connecting") return <DailySkeleton />;
  return <DailyPlay dateKey={dateKey} questions={questions} connection={connection} resumed={connection.marks.length > 0} />;
}

function DailyPlay({
  dateKey,
  questions,
  connection,
  resumed,
}: {
  dateKey: string;
  questions: QuizQuestion[];
  connection: Exclude<Connection, { phase: "connecting" }>;
  resumed: boolean;
}) {
  const total = questions.length;
  const initial = connection.marks;
  const [marks, setMarks] = useState<boolean[]>(initial);
  const [finished, setFinished] = useState(initial.length >= total);
  const [justFinished, setJustFinished] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const progress = useDailyProgress();

  async function check(questionId: number, answerId: number): Promise<AnswerResult> {
    if (connection.phase !== "online") return { ok: false, error: "Neplatná odpověď." };
    const result = await postJson<{ result: AnswerResult }>("/api/daily/answer", {
      token: connection.token,
      date: dateKey,
      questionId,
      answerId,
    });
    return result.ok ? result.result : { ok: false, error: result.error };
  }

  if (!finished) {
    return (
      <div className="flex flex-col gap-4">
        {resumed && (
          <p className="rounded-xl bg-navy px-4 py-2 text-center text-sm text-parchment">
            Pokračuješ v rozehrané výzvě. Odpovědi, které už padly, platí.
          </p>
        )}
        {connection.phase === "offline" && (
          <p className="rounded-xl border border-gold-dark/40 px-4 py-2 text-center text-sm text-muted-foreground">
            Žebříček je teď nedostupný. Hrát můžeš, výsledek se ale do žebříčku nezapíše.
          </p>
        )}
        <Quiz
          mode="daily"
          questions={questions}
          startIndex={initial.length}
          startScore={initial.filter(Boolean).length}
          check={connection.phase === "online" ? check : undefined}
          onAnswered={(index, correct) => {
            setMarks((current) => (current.length === index ? [...current, correct] : current));
            if (!recordDailyAnswer(dateKey, index, correct, total)) setSaveFailed(true);
          }}
          onFinished={() => {
            setJustFinished(true);
            setFinished(true);
            announceLeaderboardChange();
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
  const [standing, setStanding] = useState<Standing | null>(null);

  useEffect(() => {
    if (focusHeading) heading.current?.focus();
  }, [focusHeading]);

  const place = standing?.ranked ? { rank: standing.rank, total: standing.total } : null;

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

        <DailyStanding dateKey={dateKey} onStanding={setStanding} />

        {saveFailed && (
          <p role="alert" className="text-sm text-destructive">
            Výsledek se nepodařilo uložit v prohlížeči. Povol ukládání dat, ať ti série nezmizí.
          </p>
        )}

        <OrnamentDivider />
        <ShareButton
          text={dailyShareText(dateKey, marks, streak, place)}
          url={typeof window === "undefined" ? "" : `${window.location.origin}/vyzva`}
          withCrest
        />
        <DailyCountdown className="text-muted-foreground" />
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
        <KofiButton className="mt-2" />
      </CardContent>
    </Card>
  );
}
