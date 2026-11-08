import { cn } from "@/lib/utils";

/**
 * Gilded "Nový" ribbon for a freshly collected king. Decorative for screen
 * readers: the control it sits in says "nově získaný" in its label instead.
 */
export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      data-testid="new-badge"
      className={cn(
        "gilt inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] leading-tight font-bold tracking-wider text-navy uppercase shadow-md ring-1 ring-navy/40",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-2 fill-navy">
        <path d="M8 0l1.6 6.4L16 8l-6.4 1.6L8 16l-1.6-6.4L0 8l6.4-1.6z" />
      </svg>
      Nový
    </span>
  );
}
