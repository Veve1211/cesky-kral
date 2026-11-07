import { CardCorners, CrownMark, OrnamentDivider } from "@/components/ornaments";
import { RANKS } from "@/lib/game-rules";
import { cn } from "@/lib/utils";

const SPARKLES = [
  { top: "12%", left: "10%", delay: "0s" },
  { top: "20%", left: "85%", delay: "0.6s" },
  { top: "70%", left: "6%", delay: "1.2s" },
  { top: "78%", left: "90%", delay: "0.3s" },
  { top: "45%", left: "94%", delay: "1.6s" },
  { top: "40%", left: "3%", delay: "0.9s" },
];

/** Festive banner shown when the player owns every king. */
export function RoyalCelebration({
  total,
  className,
  children,
}: {
  total: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="celebration-heading"
      className={cn(
        "animate-card-reveal relative overflow-hidden rounded-2xl bg-navy px-6 py-10 text-center text-parchment shadow-xl ring-2 ring-gold",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
      <CardCorners className="m-1 size-10 text-gold" />
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="animate-sparkle absolute size-3 rotate-45 bg-gold-light"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}

      <div className="relative flex flex-col items-center gap-3">
        <CrownMark className="animate-float h-14 w-20 text-gold" />
        <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
          Všech {total} panovníků ve sbírce
        </p>
        <h2 id="celebration-heading" className="text-4xl font-bold sm:text-5xl">
          Jsi <span className="gilt-text animate-shimmer">{RANKS[3]}</span>
        </h2>
        <OrnamentDivider />
        <p className="max-w-md text-parchment/85">
          Sbírka je kompletní a král tě povolává ke svému dvoru. Zkus ještě
          rychlovku a ukaž, že rada krále má vždycky pravdu.
        </p>
        {children}
      </div>
    </section>
  );
}
