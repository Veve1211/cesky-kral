import { cn } from "@/lib/utils";

/** "Pověst" ribbon for legendary figures. */
export function LegendBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-gold uppercase shadow-md ring-1 ring-gold",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" aria-hidden className="size-3 fill-gold-light">
        <path d="M8 1l1.8 4.2L14 6l-3.3 2.9L11.7 14 8 11.6 4.3 14l1-5.1L2 6l4.2-.8z" />
      </svg>
      Pověst
    </span>
  );
}
