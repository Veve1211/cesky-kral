import { cn } from "@/lib/utils";

/** "Zlatá karta" ribbon for kings won in the golden round. */
export function GoldenBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "gilt inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-navy shadow-md ring-1 ring-gold-dark",
        className,
      )}
    >
      <span aria-hidden>✨</span>
      Zlatá karta
    </span>
  );
}
