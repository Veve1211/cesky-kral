import { cn } from "@/lib/utils";

// Decorative heraldic shield with the king's initial.
// Used as an image placeholder until we have public-domain artwork.
export function Crest({
  initial,
  locked = false,
  className,
}: {
  initial: string;
  locked?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 140"
      role="img"
      aria-label={locked ? "Nezískaný král" : `Erb s iniciálou ${initial}`}
      className={cn("h-auto w-full", className)}
    >
      <path
        d="M10 10 H110 V70 C110 105 85 125 60 134 C35 125 10 105 10 70 Z"
        fill={locked ? "#1d2a47" : "var(--brand-navy)"}
        stroke="var(--brand-gold)"
        strokeWidth="4"
      />
      <path
        d="M20 20 H100 V70 C100 98 80 114 60 122 C40 114 20 98 20 70 Z"
        fill="none"
        stroke="var(--brand-gold)"
        strokeOpacity={locked ? 0.25 : 0.6}
        strokeWidth="1.5"
      />
      <text
        x="60"
        y="85"
        textAnchor="middle"
        fontFamily="var(--font-uncial), serif"
        fontSize="56"
        fontWeight="400"
        fill={locked ? "#3a4767" : "var(--brand-gold)"}
      >
        {locked ? "?" : initial}
      </text>
    </svg>
  );
}
