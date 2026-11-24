import type { ReactNode } from "react";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { cn } from "@/lib/utils";

/**
 * Navy header of a game mode (Denní výzva, Rychlovka, Kdo vládl dřív?, Řeka času).
 * On a phone it is compact – icon beside the title, smaller text, no divider – so the
 * first question or pair of rulers is visible without scrolling (audit 10. 11., point 2).
 * From `sm` up the text is larger and the ornament divider returns.
 */
export function ModeHeader({
  icon,
  title,
  children,
  className,
}: {
  /** Decorative icon (emoji or SVG); hidden from screen readers. */
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl bg-navy px-5 py-4 text-center text-parchment shadow-xl ring-2 ring-gold sm:gap-3 sm:px-6 sm:py-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
      <CardCorners className="m-1 size-7 text-gold sm:size-9" />
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          aria-hidden
          className="gilt flex size-9 shrink-0 items-center justify-center rounded-full text-lg text-navy shadow-md sm:size-12 sm:text-2xl"
        >
          {icon}
        </span>
        <h1 className="text-3xl leading-tight font-bold sm:text-5xl">{title}</h1>
      </div>
      <OrnamentDivider className="hidden sm:block" />
      {children}
    </header>
  );
}
