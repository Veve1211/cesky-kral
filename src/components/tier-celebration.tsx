"use client";

import { KofiButton } from "@/components/kofi-button";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Fireworks } from "@/components/fireworks";
import { KingPortrait } from "@/components/king-portrait";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { CrestUnlockText, DecorateCrestButton } from "@/components/crest-unlock-notice";
import { Button } from "@/components/ui/button";
import { kingInitial } from "@/lib/king-initial";
import { TIER_KEYS, TIER_LINES, TIER_NAMES } from "@/lib/mastery";
import { cn } from "@/lib/utils";

export type CelebratedRuler = {
  slug: string;
  name: string;
  title: string;
  imageUrl: string | null;
};

// More tiers = more ceremony: sparkles, rays and glow grow with the tier.
const SPARKLES: { top: string; left: string; delay: string }[] = [
  { top: "12%", left: "14%", delay: "0s" },
  { top: "18%", left: "84%", delay: "0.6s" },
  { top: "64%", left: "8%", delay: "1.2s" },
  { top: "72%", left: "90%", delay: "0.3s" },
  { top: "40%", left: "94%", delay: "1.6s" },
  { top: "34%", left: "4%", delay: "0.9s" },
  { top: "88%", left: "30%", delay: "1.9s" },
  { top: "86%", left: "72%", delay: "0.4s" },
  { top: "6%", left: "48%", delay: "1.4s" },
  { top: "52%", left: "18%", delay: "2.1s" },
  { top: "24%", left: "66%", delay: "0.8s" },
  { top: "58%", left: "80%", delay: "1.1s" },
  { top: "8%", left: "28%", delay: "1.7s" },
  { top: "78%", left: "52%", delay: "0.2s" },
  { top: "46%", left: "36%", delay: "2.4s" },
  { top: "30%", left: "92%", delay: "1.3s" },
];
const SPARKLE_COUNT = { 1: 6, 2: 10, 3: 16 } as const;

/**
 * Full-screen ceremony for a new "koruna učenosti": fireworks in the tier's
 * colours, a crown in the tier's metal descends onto the ruler's head and the
 * background glows in the same colour. Closes only with "Pokračovat" (or Esc); focus then returns to the
 * game. Under prefers-reduced-motion everything simply appears in place.
 */
export function TierCelebration({
  ruler,
  tier,
  onClose,
  returnFocusTo,
  celebrationId,
  unlockedParts = [],
}: {
  ruler: CelebratedRuler | null;
  /** Crest parts this crown unlocked ("Ozdobit erb"). */
  unlockedParts?: readonly string[];
  tier: 1 | 2 | 3 | null;
  onClose: () => void;
  /** Changes for every celebration in a queue (used by tests). */
  celebrationId?: number;
  /** Element id that gets focus back after "Pokračovat" (e.g. the next-question button). */
  returnFocusTo?: string;
}) {
  const open = ruler !== null && tier !== null;
  const key = tier ? TIER_KEYS[tier] : "bronze";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-navy/[0.97] backdrop-blur-md" />
        <DialogPrimitive.Content
          data-testid="tier-celebration"
          data-tier={key}
          data-celebration-id={celebrationId}
          onPointerDownOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            const target = returnFocusTo ? document.getElementById(returnFocusTo) : null;
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }}
          className={cn(
            `tier-${key}`,
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain p-4 outline-none",
          )}
        >
          {/* fireworks fill the whole screen behind the card */}
          {open && tier && <Fireworks level={tier} />}
          {open && tier && ruler && (
            <div className="relative flex w-full max-w-md flex-col items-center gap-4 py-6 text-center text-parchment">
              {/* glow in the tier's colour */}
              <div
                aria-hidden
                className={cn(
                  "animate-tier-glow pointer-events-none absolute top-[8%] left-1/2 -z-10 aspect-square -translate-x-1/2 rounded-full blur-2xl",
                  tier === 1 && "w-[80%] bg-[radial-gradient(circle,var(--tier-light)_0%,var(--tier)_28%,transparent_66%)] opacity-80",
                  tier === 2 && "w-[90%] bg-[radial-gradient(circle,var(--tier-light)_0%,var(--tier)_30%,transparent_68%)]",
                  tier === 3 && "w-[115%] bg-[radial-gradient(circle,var(--tier-light)_0%,var(--tier)_35%,transparent_70%)]",
                )}
              />
              {/* rays for silver and gold */}
              {tier >= 2 && (
                <div
                  aria-hidden
                  className={cn(
                    "animate-tier-rays pointer-events-none absolute top-[2%] left-1/2 -z-10 aspect-square -ml-[60%] w-[120%] rounded-full",
                    tier === 2 ? "opacity-25" : "opacity-50",
                  )}
                  style={{
                    background:
                      "repeating-conic-gradient(from 0deg, var(--tier-light) 0deg 6deg, transparent 6deg 22deg)",
                    maskImage: "radial-gradient(circle, black 18%, transparent 68%)",
                    WebkitMaskImage: "radial-gradient(circle, black 18%, transparent 68%)",
                  }}
                />
              )}
              {SPARKLES.slice(0, SPARKLE_COUNT[tier]).map((sparkle, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={cn("animate-sparkle absolute rotate-45 bg-[var(--tier-light)]", tier === 3 ? "size-3" : "size-2")}
                  style={{ top: sparkle.top, left: sparkle.left, animationDelay: sparkle.delay }}
                />
              ))}

              <p className="animate-tier-rise text-xs font-semibold tracking-[0.35em] text-[var(--tier-light)] uppercase">
                Nový stupeň v kronice
              </p>

              {/* the card – the crown descends onto the ruler's head */}
              <div
                className={cn(
                  "relative mt-10 w-40 rounded-2xl p-1.5 shadow-2xl min-[400px]:w-48",
                  "bg-[linear-gradient(135deg,var(--tier-dark),var(--tier-light)_45%,var(--tier)_60%,var(--tier-dark))]",
                )}
              >
                {/* moving light on gold – its own layer, so it never clips the crown */}
                {tier === 3 && <span aria-hidden className="golden-sheen pointer-events-none absolute inset-0 z-20 rounded-2xl" />}
                <div className="parchment relative rounded-xl p-2.5">
                  <CardCorners className="m-0.5 size-6 text-[var(--tier-dark)]" />
                  <KingPortrait
                    name={ruler.name}
                    initial={kingInitial(ruler.name)}
                    imageUrl={ruler.imageUrl}
                    sizes="192px"
                    crown={tier}
                    crownClassName="animate-crown-descend w-[58%] max-w-none"
                  />
                </div>
              </div>

              <DialogPrimitive.Title className="animate-tier-rise mt-1 flex flex-col items-center gap-1 [animation-delay:0.5s]">
                <span className="text-[11px] font-semibold tracking-[0.3em] text-parchment/75 uppercase">
                  {ruler.title}
                </span>
                <span className="font-heading text-5xl leading-none font-bold text-balance drop-shadow-[0_3px_6px_rgb(0_0_0/0.5)] min-[400px]:text-6xl">
                  {ruler.name}
                </span>
                <span
                  className={cn(
                    "tier-text font-heading leading-tight font-bold",
                    tier === 3 ? "text-4xl min-[400px]:text-5xl" : "text-3xl min-[400px]:text-4xl",
                  )}
                >
                  {TIER_NAMES[tier]}
                </span>
              </DialogPrimitive.Title>

              <OrnamentDivider className="animate-tier-rise text-[var(--tier)] [animation-delay:0.7s]" />

              <DialogPrimitive.Description className="animate-tier-rise max-w-sm font-heading text-xl leading-snug text-parchment/90 italic [animation-delay:0.9s]">
                {TIER_LINES[tier]}
              </DialogPrimitive.Description>

              <CrestUnlockText parts={unlockedParts} />

              <div className="animate-tier-rise mt-2 flex flex-wrap justify-center gap-3 [animation-delay:1.1s]">
                <DialogPrimitive.Close asChild>
                  <Button variant="accent" size="lg" className="min-w-48">
                    Pokračovat
                  </Button>
                </DialogPrimitive.Close>
                <DecorateCrestButton parts={unlockedParts} />
              </div>
              <KofiButton variant="subtle" className="text-parchment/85" />
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
