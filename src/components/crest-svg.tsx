import { useId, type ReactElement } from "react";

import {
  CHARGE_NAMES,
  DIVISION_NAMES,
  SHAPE_NAMES,
  TINCTURE_COLORS,
  TINCTURE_NAMES,
  type Charge,
  type CrestDesign,
  type Shape,
  type Tincture,
} from "@/lib/heraldry";
import { cn } from "@/lib/utils";

// The player's coat of arms, drawn as one SVG (own artwork, no images).
// viewBox 200 × 290: shield 0–240, motto ribbon 244–290.

const SHIELDS: Record<Shape, string> = {
  heater: "M10 10 H190 V110 C190 180 140 215 100 234 C60 215 10 180 10 110 Z",
  round: "M10 10 H190 V128 C190 190 150 234 100 234 C50 234 10 190 10 128 Z",
  french: "M10 10 H190 V186 Q190 208 166 208 H124 Q104 208 100 234 Q96 208 76 208 H34 Q10 208 10 186 Z",
  kite: "M100 8 C156 8 190 36 186 84 C180 146 144 196 100 236 C56 196 20 146 14 84 C10 36 44 8 100 8 Z",
  lozenge: "M100 6 L192 120 L100 234 L8 120 Z",
  royal: "M20 62 H180 V140 C180 192 142 220 100 236 C58 220 20 192 20 140 Z",
};

/** Charges in a 100 × 100 box (own shapes). */
function ChargeShape({ charge, color }: { charge: Charge; color: string }): ReactElement | null {
  const common = { fill: color, stroke: "#1b1b1b", strokeOpacity: 0.55, strokeWidth: 1.6, strokeLinejoin: "round" as const };
  switch (charge) {
    case "star":
      return <polygon {...common} points={STAR} />;
    case "cross":
      return <path {...common} d="M42 8 H58 L55 40 L92 36 V64 L55 60 L58 92 H42 L45 60 L8 64 V36 L45 40 Z" />;
    case "key":
      return (
        <path
          {...common}
          fillRule="evenodd"
          d="M24 30 A16 16 0 1 1 24 30.1 Z M24 38 A8 8 0 1 0 24 37.9 Z M38 26 H92 V34 H90 V48 H82 V34 H78 V44 H70 V34 H38 Z"
          transform="translate(4 16)"
        />
      );
    case "tower":
      return (
        <path
          {...common}
          fillRule="evenodd"
          d="M24 92 V42 H18 V20 H30 V28 H40 V20 H50 V28 H60 V20 H70 V28 H82 V20 H82 V42 H76 V92 Z M42 92 V72 A8 8 0 0 1 58 72 V92 Z M46 46 H54 V58 H46 Z"
        />
      );
    case "rose":
      return (
        <g {...common}>
          {[0, 72, 144, 216, 288].map((angle) => (
            <circle key={angle} cx={50 + 22 * Math.sin((angle * Math.PI) / 180)} cy={50 - 22 * Math.cos((angle * Math.PI) / 180)} r="17" />
          ))}
          <circle cx="50" cy="50" r="12" fill="#d4a72c" />
        </g>
      );
    case "fleur":
      return (
        <g {...common}>
          <path d="M50 6 C64 22 64 44 50 62 C36 44 36 22 50 6 Z" />
          <path d="M46 58 C30 64 10 54 10 34 C22 38 34 44 46 50 Z" />
          <path d="M54 58 C70 64 90 54 90 34 C78 38 66 44 54 50 Z" />
          <rect x="28" y="58" width="44" height="9" rx="2" />
          <path d="M44 67 L38 94 L50 86 L62 94 L56 67 Z" />
        </g>
      );
    case "sword":
      return (
        <g {...common}>
          <path d="M50 4 L56 16 V64 H44 V16 Z" />
          <rect x="28" y="64" width="44" height="8" rx="3" />
          <rect x="45" y="72" width="10" height="16" />
          <circle cx="50" cy="92" r="6" />
        </g>
      );
    case "crown":
      return (
        <g {...common}>
          <path d="M14 74 L8 30 L30 50 L50 18 L70 50 L92 30 L86 74 Z" />
          <rect x="12" y="74" width="76" height="14" rx="3" />
          <circle cx="8" cy="28" r="5" />
          <circle cx="50" cy="15" r="6" />
          <circle cx="92" cy="28" r="5" />
        </g>
      );
    case "eagle":
      return (
        <g {...common}>
          <path d="M44 40 L6 16 L13 29 L3 31 L13 41 L3 46 L15 53 L7 60 L42 58 Z" />
          <path d="M56 40 L94 16 L87 29 L97 31 L87 41 L97 46 L85 53 L93 60 L58 58 Z" />
          <path d="M42 70 L34 94 L50 85 L66 94 L58 70 Z" />
          <ellipse cx="50" cy="52" rx="11" ry="21" />
          <circle cx="49" cy="24" r="9" />
          <path d="M56 21 L68 25 L56 30 Z" />
          <path d="M44 72 L32 82 M56 72 L68 82" fill="none" strokeWidth="5" strokeLinecap="round" stroke={color} strokeOpacity={1} />
          <circle cx="47" cy="22" r="1.8" fill="#1b1b1b" stroke="none" />
        </g>
      );
    case "lion":
      return <Lion color={color} />;
    case "moon":
      return <path {...common} fillRule="evenodd" d="M50 18 A32 32 0 1 0 50.1 18 Z M62 14 A28 28 0 1 1 61.9 14 Z" />;
    default:
      return null;
  }
}

/** Rampant lion facing left: thick limbs drawn twice (dark outline, then colour). */
function Lion({ color }: { color: string }) {
  const limbs = [
    "M44 40 L26 30 L16 34",
    "M46 47 L28 50 L20 57",
    "M57 70 L52 84 L42 93",
    "M62 72 L70 84 L78 93",
    "M64 64 C82 60 78 40 84 24",
  ];
  const mane = Array.from({ length: 14 }, (_, i) => {
    const r = i % 2 === 0 ? 17 : 12;
    const a = (Math.PI / 7) * i;
    return `${(37 + r * Math.cos(a)).toFixed(1)},${(25 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {[
        { stroke: "#1b1b1b", opacity: 0.55, extra: 3 },
        { stroke: color, opacity: 1, extra: 0 },
      ].map(({ stroke, opacity, extra }) => (
        <g key={stroke} stroke={stroke} strokeOpacity={opacity} fill="none">
          {limbs.map((d, i) => (
            <path key={d} d={d} strokeWidth={(i === 4 ? 5 : 8) + extra} />
          ))}
        </g>
      ))}
      <g fill={color} stroke="#1b1b1b" strokeOpacity={0.55} strokeWidth={1.6}>
        <circle cx="85" cy="21" r="6" />
        <ellipse cx="54" cy="56" rx="13" ry="22" transform="rotate(-28 54 56)" />
        <polygon points={mane} />
        <circle cx="34" cy="26" r="9" />
        <path d="M28 28 L18 30 L26 35 Z" />
      </g>
      <circle cx="32" cy="23" r="1.8" fill="#1b1b1b" />
    </g>
  );
}

const STAR = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 44 : 18;
  const angle = (Math.PI / 5) * i - Math.PI / 2;
  return `${(50 + r * Math.cos(angle)).toFixed(1)},${(52 + r * Math.sin(angle)).toFixed(1)}`;
}).join(" ");

/** Fill for a tincture (ermine is a pattern of black spots on white). */
function fill(tincture: Tincture, ermineId: string) {
  return tincture === "ermine" ? `url(#${ermineId})` : TINCTURE_COLORS[tincture];
}

/** One sentence describing the arms – for screen readers and the image title. */
export function crestDescription(design: CrestDesign): string {
  const parts = [`${SHAPE_NAMES[design.shape]}`, DIVISION_NAMES[design.division].toLowerCase(), TINCTURE_NAMES[design.field].toLowerCase()];
  if (design.division !== "plain") parts.push(`a ${TINCTURE_NAMES[design.second].toLowerCase()}`);
  const charge = design.charge === "none" ? "" : `, ${CHARGE_NAMES[design.charge].toLowerCase()} (${TINCTURE_NAMES[design.chargeTincture].toLowerCase()})`;
  const motto = design.motto ? `, heslo „${design.motto}“` : "";
  return `Erb: ${parts.join(", ")}${charge}${motto}`;
}

export function CrestSvg({
  design,
  className,
  withMotto = true,
  label,
  id,
}: {
  design: CrestDesign;
  className?: string;
  withMotto?: boolean;
  /** Accessible name; default = full description. Pass "" for a decorative crest. */
  label?: string;
  id?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `crest-clip-${uid}`;
  const ermineId = `crest-ermine-${uid}`;
  const shield = SHIELDS[design.shape];
  const showMotto = withMotto && design.motto.length > 0;
  const height = showMotto ? 290 : 240;
  const name = label ?? crestDescription(design);
  const field = fill(design.field, ermineId);
  const second = fill(design.second, ermineId);
  // The charge sits lower when the chief takes the top of the shield.
  const chargeBox =
    design.division === "chief"
      ? "translate(52 84) scale(0.96)"
      : design.shape === "royal"
        ? "translate(46 78) scale(1.08)"
        : design.division === "bordure"
          ? "translate(46 54) scale(1.08)"
          : "translate(36 45) scale(1.28)";

  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 200 ${height}`}
      role={name ? "img" : undefined}
      aria-label={name || undefined}
      aria-hidden={name ? undefined : true}
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shield} />
        </clipPath>
        <pattern id={ermineId} width="24" height="28" patternUnits="userSpaceOnUse">
          <rect width="24" height="28" fill="#f4f1ea" />
          <path d="M12 6 L14 14 L12 20 L10 14 Z M8 8 a1.6 1.6 0 1 0 0.1 0 M16 8 a1.6 1.6 0 1 0 0.1 0 M12 3 a1.6 1.6 0 1 0 0.1 0" fill="#1b1b1b" />
        </pattern>
      </defs>

      {design.shape === "royal" && (
        <g fill="#d4a72c" stroke="#7a5a12" strokeWidth="2" strokeLinejoin="round" data-part="royal-crown">
          <path d="M52 52 L44 16 L68 34 L100 6 L132 34 L156 16 L148 52 Z" />
          <rect x="50" y="48" width="100" height="10" rx="3" />
          <circle cx="100" cy="8" r="6" fill="#b3261e" />
          <circle cx="44" cy="14" r="5" fill="#1f4e9c" />
          <circle cx="156" cy="14" r="5" fill="#1f4e9c" />
        </g>
      )}

      <g clipPath={`url(#${clipId})`}>
        <rect width="200" height="240" fill={field} />
        {design.division === "per-pale" && <rect x="100" width="100" height="240" fill={second} />}
        {design.division === "per-fess" && <rect y="120" width="200" height="120" fill={second} />}
        {design.division === "chief" && <rect width="200" height="74" fill={second} />}
        {design.division === "per-bend" && <polygon points="0,0 200,240 0,240" fill={second} />}
        {design.division === "quarterly" && (
          <>
            <rect x="100" width="100" height="120" fill={second} />
            <rect y="120" width="100" height="120" fill={second} />
          </>
        )}
        {design.division === "per-saltire" && (
          <>
            <polygon points="0,0 100,120 0,240" fill={second} />
            <polygon points="200,0 100,120 200,240" fill={second} />
          </>
        )}
        {design.division === "bordure" && <path d={shield} fill="none" stroke={second} strokeWidth="36" />}
        {design.charge !== "none" && (
          <g transform={chargeBox} data-part="charge">
            <ChargeShape charge={design.charge} color={fill(design.chargeTincture, ermineId)} />
          </g>
        )}
      </g>
      {/* gilded edge */}
      <path d={shield} fill="none" stroke="#7a5a12" strokeWidth="5" />
      <path d={shield} fill="none" stroke="#e8c766" strokeWidth="2" />

      {showMotto && (
        <g data-part="motto">
          <path d="M6 252 L22 246 H178 L194 252 L186 268 L194 284 H170 L178 270 H22 L30 284 H6 L14 268 Z" fill="#f5efe0" stroke="#7a5a12" strokeWidth="2" strokeLinejoin="round" />
          <text
            x="100"
            y="263"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={design.motto.length > 22 ? 10 : 13}
            fontWeight="700"
            fill="#14213d"
          >
            {design.motto}
          </text>
        </g>
      )}
    </svg>
  );
}
