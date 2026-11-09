import { TIER_KEYS, TIER_SHORT } from "@/lib/mastery";
import { cn } from "@/lib/utils";

/**
 * Crown of a "koruna učenosti" tier – bronze, silver or gold metal with
 * jewels. Higher tiers get more ornament (gold has the most).
 * The colours come from the `.tier-*` classes in globals.css.
 */
export function TierCrown({
  tier,
  className,
  decorative = false,
}: {
  tier: 1 | 2 | 3;
  className?: string;
  /** Hide from screen readers when the surrounding text already says it. */
  decorative?: boolean;
}) {
  const key = TIER_KEYS[tier];
  const fill = `crown-fill-${key}`;
  const shine = `crown-shine-${key}`;
  return (
    <svg
      viewBox="0 0 120 80"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : TIER_SHORT[tier]}
      data-testid={`tier-crown-${key}`}
      className={cn(`tier-${key} drop-shadow-[0_3px_4px_rgb(0_0_0/0.45)]`, className)}
    >
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--tier-light)" }} />
          <stop offset="0.45" style={{ stopColor: "var(--tier)" }} />
          <stop offset="1" style={{ stopColor: "var(--tier-dark)" }} />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* points */}
      <path
        d="M10 64 L6 22 L32 42 L44 10 L60 36 L76 10 L88 42 L114 22 L110 64 Z"
        fill={`url(#${fill})`}
        stroke="var(--tier-dark)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* band */}
      <rect x="8" y="58" width="104" height="16" rx="3" fill={`url(#${fill})`} stroke="var(--tier-dark)" strokeWidth="2.5" />
      <rect x="14" y="61" width="92" height="3" rx="1.5" fill={`url(#${shine})`} />

      {/* finials on the points */}
      {[
        [6, 22],
        [44, 10],
        [76, 10],
        [114, 22],
      ].map(([cx, cy]) => (
        <circle key={`${cx}`} cx={cx} cy={cy} r="5" fill="var(--tier-light)" stroke="var(--tier-dark)" strokeWidth="2" />
      ))}

      {/* jewels: one for bronze, three for silver, five + a cross for gold */}
      <circle cx="60" cy="66" r="5" fill="#b3263a" stroke="var(--tier-dark)" strokeWidth="1.5" />
      {tier >= 2 && (
        <>
          <circle cx="34" cy="66" r="4" fill="#2b5fae" stroke="var(--tier-dark)" strokeWidth="1.5" />
          <circle cx="86" cy="66" r="4" fill="#2b5fae" stroke="var(--tier-dark)" strokeWidth="1.5" />
        </>
      )}
      {tier === 3 && (
        <>
          <circle cx="18" cy="66" r="3" fill="#1f8a5b" stroke="var(--tier-dark)" strokeWidth="1.2" />
          <circle cx="102" cy="66" r="3" fill="#1f8a5b" stroke="var(--tier-dark)" strokeWidth="1.2" />
          <path d="M60 36 v-16 M53 26 h14" stroke="var(--tier-dark)" strokeWidth="6" strokeLinecap="round" />
          <path d="M60 36 v-16 M53 26 h14" stroke="var(--tier-light)" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
