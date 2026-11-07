import { cn } from "@/lib/utils";

// Hand-made SVG ornaments in the style of an illuminated manuscript.
// All are decorative (aria-hidden).

/** Corner flourish. Rotate with `position` to place it in any corner. */
export function CornerOrnament({
  position = "tl",
  className,
}: {
  position?: "tl" | "tr" | "bl" | "br";
  className?: string;
}) {
  const rotate = { tl: "", tr: "-scale-x-100", bl: "-scale-y-100", br: "scale-[-1]" }[
    position
  ];
  const place = {
    tl: "top-0 left-0",
    tr: "top-0 right-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0",
  }[position];

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn("pointer-events-none absolute size-10", place, rotate, className)}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M6 58 V14 a8 8 0 0 1 8 -8 H58" strokeWidth="2" />
        <path d="M11 52 V18 a7 7 0 0 1 7 -7 H52" strokeWidth="0.9" opacity="0.7" />
        <path
          d="M14 30 c0 -9 7 -16 16 -16 c-5 3 -7 7 -6 12 c-4 -2 -8 0 -10 4z"
          strokeWidth="1.1"
        />
        <path d="M18 38 c3 0 5 -2 5 -5" strokeWidth="1" />
        <path d="M38 18 c0 3 -2 5 -5 5" strokeWidth="1" />
      </g>
      <g fill="currentColor">
        <circle cx="14" cy="14" r="2.6" />
        <path d="M24 24 l3 -6 l3 6 l-3 6z" opacity="0.85" />
        <circle cx="6" cy="58" r="1.6" />
        <circle cx="58" cy="6" r="1.6" />
      </g>
    </svg>
  );
}

/** All four corners at once – put inside a `relative` container. */
export function CardCorners({ className }: { className?: string }) {
  return (
    <>
      <CornerOrnament position="tl" className={className} />
      <CornerOrnament position="tr" className={className} />
      <CornerOrnament position="bl" className={className} />
      <CornerOrnament position="br" className={className} />
    </>
  );
}

/** Horizontal divider with a central fleuron. */
export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 24"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-6 w-full max-w-xs text-gold", className)}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M8 12 H122" strokeWidth="1.2" />
        <path d="M198 12 H312" strokeWidth="1.2" />
        <path d="M122 12 c8 0 10 -8 18 -8 c-4 3 -4 7 0 8" strokeWidth="1.2" />
        <path d="M198 12 c-8 0 -10 -8 -18 -8 c4 3 4 7 0 8" strokeWidth="1.2" />
        <path d="M122 12 c8 0 10 8 18 8 c-4 -3 -4 -7 0 -8" strokeWidth="1.2" />
        <path d="M198 12 c-8 0 -10 8 -18 8 c4 -3 4 -7 0 -8" strokeWidth="1.2" />
      </g>
      <g fill="currentColor">
        <path d="M160 2 l7 10 l-7 10 l-7 -10z" />
        <circle cx="146" cy="12" r="2" />
        <circle cx="174" cy="12" r="2" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="312" cy="12" r="2" />
      </g>
      <path d="M160 7 l3.5 5 l-3.5 5 l-3.5 -5z" fill="var(--brand-navy)" />
    </svg>
  );
}

/** Small fleur-de-lis style crown mark. */
export function CrownMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 36" aria-hidden className={cn("h-6 w-8", className)}>
      <path
        d="M4 30 L8 10 L17 20 L24 4 L31 20 L40 10 L44 30 Z"
        fill="currentColor"
      />
      <rect x="4" y="30" width="40" height="4" rx="1" fill="currentColor" />
      <circle cx="8" cy="9" r="2.5" fill="currentColor" />
      <circle cx="24" cy="4" r="2.5" fill="currentColor" />
      <circle cx="40" cy="9" r="2.5" fill="currentColor" />
      <circle cx="24" cy="23" r="2.2" fill="var(--brand-navy)" />
    </svg>
  );
}
