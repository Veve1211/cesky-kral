import { DIFFICULTY_LABELS, type Difficulty } from "@/lib/game-rules";
import { cn } from "@/lib/utils";

const SHORT: Record<Difficulty, string> = { 1: "lehká", 2: "střední", 3: "těžká" };

/**
 * Small badge with the question difficulty in words ("lehká / střední / těžká").
 * Words, not crowns: crowns show the round progress (RoundCrowns).
 */
export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const label = DIFFICULTY_LABELS[difficulty];
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-gold shadow-sm ring-1 ring-gold/60",
        className,
      )}
    >
      {SHORT[difficulty]}
    </span>
  );
}
