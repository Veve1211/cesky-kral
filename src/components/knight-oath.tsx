import { cn } from "@/lib/utils";

/** Decorative "knight's oath" ribbon shown at the start of a round. */
export function KnightOath({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "animate-card-reveal relative mx-auto w-full rounded-xl bg-navy px-5 py-3 text-center text-sm text-parchment shadow-md ring-2 ring-gold",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-1 rounded-lg border border-dashed border-gold/50" />
      {/* ribbon tails */}
      <span
        aria-hidden
        className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rotate-45 bg-gold-dark"
      />
      <span
        aria-hidden
        className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rotate-45 bg-gold-dark"
      />
      <p className="relative">
        <span aria-hidden>⚔️ </span>
        <strong className="font-heading text-base text-gold">Rytířský slib:</strong>{" "}
        Odlož AI i internet. Králové vše vidí.
        <span aria-hidden> 👁️</span>
      </p>
    </div>
  );
}
