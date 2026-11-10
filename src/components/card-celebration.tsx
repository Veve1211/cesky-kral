"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { BookOpen } from "lucide-react";

import { Fireworks } from "@/components/fireworks";
import { KingPortrait } from "@/components/king-portrait";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { CrestUnlockText, DecorateCrestButton } from "@/components/crest-unlock-notice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CelebratedCard = {
  slug: string;
  name: string;
  title: string;
  initial: string;
  imageUrl: string | null;
};

/**
 * The main celebration of the game: a ruler's card is won.
 * - first time (`firstTime`): full screen, the card flies in and turns face
 *   up, big name, a line of the chronicler and big fireworks (bigger than
 *   the bronze and silver crowns, only the gold crown is bigger);
 * - won again: a smaller celebration – no flight, no fireworks.
 * Buttons: "Pokračovat" (closes; the next queued celebration follows) and
 * "Zobrazit ve sbírce". Under prefers-reduced-motion only a gentle glow stays.
 */
export function CardCelebration({
  card,
  firstTime,
  celebrationId,
  onClose,
  returnFocusTo,
  unlockedParts = [],
}: {
  /** Crest parts this card unlocked ("Ozdobit erb"). */
  unlockedParts?: readonly string[];
  card: CelebratedCard | null;
  firstTime: boolean;
  /** Changes for every celebration in a queue (used by tests and as a React key). */
  celebrationId?: number;
  onClose: () => void;
  returnFocusTo?: string;
}) {
  const open = card !== null;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Back first, then face up once the card has landed.
    const timer = window.setTimeout(() => setFlipped(true), firstTime ? 1100 : 300);
    return () => {
      window.clearTimeout(timer);
      setFlipped(false);
    };
  }, [open, firstTime, celebrationId]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-navy/[0.97] backdrop-blur-md" />
        <DialogPrimitive.Content
          data-testid="card-celebration"
          data-first-time={firstTime}
          data-celebration-id={celebrationId}
          onPointerDownOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            const target = returnFocusTo ? document.getElementById(returnFocusTo) : null;
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }}
          className="tier-gold data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain p-4 outline-none"
        >
          {open && firstTime && <Fireworks level="card" />}
          {open && card && (
            <div className="relative flex w-full max-w-md flex-col items-center gap-4 py-6 text-center text-parchment">
              {/* gentle glow – the only thing left with reduced motion */}
              <div
                aria-hidden
                className={cn(
                  "animate-tier-glow pointer-events-none absolute top-[6%] left-1/2 -z-10 aspect-square -translate-x-1/2 rounded-full blur-2xl",
                  firstTime
                    ? "w-[110%] bg-[radial-gradient(circle,var(--tier-light)_0%,var(--tier)_32%,transparent_68%)]"
                    : "w-[75%] bg-[radial-gradient(circle,var(--tier)_0%,transparent_65%)] opacity-70",
                )}
              />

              <p className="animate-tier-rise text-xs font-semibold tracking-[0.35em] text-[var(--tier-light)] uppercase">
                {firstTime ? "Nová karta ve sbírce" : "Karta znovu obhájena"}
              </p>

              {/* the card: flies in (first time) and turns face up */}
              <div
                className={cn("flip-scene relative", firstTime ? "w-44 min-[400px]:w-52" : "w-40 min-[400px]:w-48")}
                style={firstTime ? { animation: "card-fly-in 1s cubic-bezier(0.2, 0.8, 0.25, 1) both" } : undefined}
              >
                <div className="flip-card" data-flipped={flipped}>
                  <div className="flip-face rounded-2xl bg-navy p-3 shadow-2xl ring-2 ring-gold">
                    <KingPortrait name={card.name} initial={card.initial} imageUrl={card.imageUrl} locked sizes="208px" />
                    <p className="mt-2 font-heading text-xl text-parchment">?</p>
                  </div>
                  <div className="flip-face flip-face-back">
                    <div className="gilt h-full rounded-2xl p-1.5 shadow-2xl">
                      <div className="parchment relative h-full rounded-xl p-2.5 text-navy">
                        <CardCorners className="m-0.5 size-6 text-gold-dark" />
                        <KingPortrait name={card.name} initial={card.initial} imageUrl={card.imageUrl} sizes="208px" />
                        <p className="mt-2 font-heading text-xl font-bold">{card.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogPrimitive.Title className="animate-tier-rise flex flex-col items-center gap-1 [animation-delay:0.6s]">
                <span className="text-[11px] font-semibold tracking-[0.3em] text-parchment/75 uppercase">
                  {card.title}
                </span>
                <span
                  className={cn(
                    "font-heading leading-none font-bold text-balance drop-shadow-[0_3px_6px_rgb(0_0_0/0.5)]",
                    firstTime ? "gilt-text text-5xl min-[400px]:text-6xl" : "text-4xl min-[400px]:text-5xl",
                  )}
                >
                  {card.name}
                </span>
              </DialogPrimitive.Title>

              <OrnamentDivider className="animate-tier-rise [animation-delay:0.8s]" />

              <DialogPrimitive.Description className="animate-tier-rise max-w-sm font-heading text-xl leading-snug text-parchment/90 italic [animation-delay:1s]">
                {firstTime
                  ? "Kronikář vepsal do erbovní knihy nový list: tato karta je od dnešního dne tvoje."
                  : "Kronikář znovu potvrzuje: tato karta ti právem patří."}
              </DialogPrimitive.Description>

              <CrestUnlockText parts={unlockedParts} />

              <div className="animate-tier-rise mt-2 flex flex-wrap justify-center gap-3 [animation-delay:1.2s]">
                <DialogPrimitive.Close asChild>
                  <Button variant="accent" size="lg" className="min-w-40">
                    Pokračovat
                  </Button>
                </DialogPrimitive.Close>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sbirka">
                    <BookOpen aria-hidden />
                    Zobrazit ve sbírce
                  </Link>
                </Button>
                <DecorateCrestButton parts={unlockedParts} />
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
