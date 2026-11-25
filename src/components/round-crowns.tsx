import { CrownMark } from "@/components/ornaments";
import { cn } from "@/lib/utils";

/**
 * Round progress as crowns, one per question: empty until answered, gold when
 * right, crossed out when wrong; the current question has a gold ring.
 */
export function RoundCrowns({
  marks,
  total,
  current,
  className,
}: {
  /** Right/wrong per answered question, in order. */
  marks: readonly boolean[];
  total: number;
  /** Index of the question on screen (-1 when the round is over). */
  current: number;
  className?: string;
}) {
  const right = marks.filter(Boolean).length;
  const wrong = marks.length - right;
  return (
    <div
      role="img"
      aria-label={`Postup ve hře: ${right} správně, ${wrong} špatně, ${total} otázek`}
      data-testid="round-crowns"
      className={cn("flex flex-wrap items-center justify-center gap-1.5 sm:gap-2", className)}
    >
      {Array.from({ length: total }, (_, i) => {
        const mark = marks[i];
        const state = mark === true ? "right" : mark === false ? "wrong" : i === current ? "current" : "pending";
        return (
          <span
            key={i}
            data-state={state}
            className={cn(
              "relative flex size-7 items-center justify-center rounded-full bg-navy ring-1 ring-gold/50 transition-colors sm:size-8",
              state === "current" && "ring-2 ring-gold",
              state === "right" && "animate-answer-pulse",
            )}
          >
            <CrownMark
              className={cn(
                "h-3 w-4 sm:h-3.5 sm:w-5",
                state === "right" ? "text-gold" : state === "wrong" ? "text-parchment/30" : "text-parchment/20",
              )}
            />
            {state === "wrong" && (
              <span aria-hidden className="absolute inset-0 flex items-center justify-center text-lg font-bold text-red-400">
                ✗
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
