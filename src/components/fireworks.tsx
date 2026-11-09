import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

// Fireworks for the "koruna učenosti" celebration – pure CSS, no canvas.
// Each burst: a rocket rises, flashes and throws a ring of sparks that fall
// and fade; then it repeats while the celebration is open. Positions are
// fixed (no randomness), so server and client render the same markup.
// Hidden completely under prefers-reduced-motion.

type Burst = { left: number; top: number; delay: number };

// Spread over the screen, away from the centre card where possible.
const BURSTS: Burst[] = [
  { left: 18, top: 22, delay: 0 },
  { left: 80, top: 18, delay: 0.7 },
  { left: 50, top: 10, delay: 1.4 },
  { left: 12, top: 52, delay: 2.0 },
  { left: 88, top: 48, delay: 2.5 },
  { left: 30, top: 34, delay: 0.35 },
  { left: 70, top: 32, delay: 1.05 },
  { left: 62, top: 62, delay: 1.75 },
];

/**
 * Size of the show. The game's ranking of celebrations:
 * gold crown (biggest) > new card > silver crown > bronze crown.
 */
export type FireworksLevel = 1 | 2 | 3 | "card";

const SETTINGS: Record<FireworksLevel, { bursts: number; sparks: number; radius: number; cycle: number }> = {
  1: { bursts: 4, sparks: 14, radius: 80, cycle: 3.4 },
  2: { bursts: 6, sparks: 18, radius: 100, cycle: 3.0 },
  card: { bursts: 7, sparks: 22, radius: 115, cycle: 2.8 },
  3: { bursts: 8, sparks: 24, radius: 125, cycle: 2.7 },
};

// Bronze and silver shine in their own metal; gold adds the crown's jewels.
const GOLD_EXTRA = ["#e0475b", "#4f8fe8", "#3dbb83", "#fff3c4"];

function sparkColor(level: FireworksLevel, burst: number, spark: number): string {
  if (level === 3 && burst % 2 === 1) return GOLD_EXTRA[(burst + spark) % GOLD_EXTRA.length];
  if (level === "card" && burst % 3 === 2) return spark % 2 === 0 ? "#fff3c4" : "#f5efe0";
  return spark % 3 === 0 ? "var(--tier-light)" : "var(--tier)";
}

/** `level`: crown tier 1–3 or "card"; the colours come from the parent's `.tier-*` class. */
export function Fireworks({ level, className }: { level: FireworksLevel; className?: string }) {
  const tier = level;
  const { bursts, sparks, radius, cycle } = SETTINGS[level];

  return (
    <div
      aria-hidden
      data-testid="fireworks"
      data-bursts={bursts}
      className={cn("pointer-events-none fixed inset-0 overflow-hidden motion-reduce:hidden", className)}
    >
      {BURSTS.slice(0, bursts).map((burst, b) => {
        const timing = {
          animationDuration: `${cycle}s`,
          animationDelay: `${burst.delay}s`,
          animationIterationCount: "infinite",
          animationFillMode: "both",
        } satisfies CSSProperties;
        return (
          <div key={b} className="absolute" style={{ left: `${burst.left}%`, top: `${burst.top}%` }}>
            {/* rocket trail rising to the burst point */}
            <span
              className="absolute -left-px h-6 w-0.5 rounded-full bg-gradient-to-b from-[var(--tier-light)] to-transparent"
              style={{
                ...timing,
                animationName: "firework-rocket",
                animationTimingFunction: "cubic-bezier(0.2, 0.6, 0.4, 1)",
                ["--rise" as string]: `${100 - burst.top + 10}vh`,
              }}
            />
            {/* flash at the moment of the burst */}
            <span
              className="absolute -top-6 -left-6 size-12 rounded-full bg-[radial-gradient(circle,#fff_0%,var(--tier-light)_35%,transparent_70%)]"
              style={{ ...timing, animationName: "firework-flash", animationTimingFunction: "ease-out" }}
            />
            {/* ring of sparks */}
            {Array.from({ length: sparks }, (_, s) => {
              const angle = (2 * Math.PI * s) / sparks + b * 0.4;
              const r = radius * (s % 2 === 0 ? 1 : 0.72);
              return (
                <span
                  key={s}
                  className={cn(
                    "absolute rounded-full shadow-[0_0_8px_2px_currentColor]",
                    tier === 3 || tier === "card" ? "-top-1.5 -left-1.5 size-3" : "-top-[5px] -left-[5px] size-2.5",
                  )}
                  style={{
                    ...timing,
                    animationName: "firework-spark",
                    animationTimingFunction: "cubic-bezier(0.1, 0.7, 0.3, 1)",
                    backgroundColor: sparkColor(tier, b, s),
                    color: sparkColor(tier, b, s),
                    ["--dx" as string]: `${Math.round(Math.cos(angle) * r)}px`,
                    ["--dy" as string]: `${Math.round(Math.sin(angle) * r)}px`,
                    ["--fall" as string]: `${Math.round(radius * 0.45)}px`,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
