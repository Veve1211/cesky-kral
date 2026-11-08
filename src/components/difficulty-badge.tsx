import { CrownMark } from "@/components/ornaments";
import { DIFFICULTY_LABELS, type Difficulty } from "@/lib/game-rules";
import { cn } from "@/lib/utils";

/** Small badge: 1–3 gold crowns by question difficulty. */
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
        "inline-flex shrink-0 items-center gap-0.5 rounded-full bg-navy px-2 py-1 shadow-sm ring-1 ring-gold/60",
        className,
      )}
    >
      {[1, 2, 3].map((level) => (
        <CrownMark
          key={level}
          className={cn(
            "h-3 w-4",
            level <= difficulty ? "text-gold" : "text-parchment/20",
          )}
        />
      ))}
    </span>
  );
}
