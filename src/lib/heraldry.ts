// "Můj erb" – the player's own coat of arms. Pure logic shared by server,
// client and tests: parts, their Czech names, the rule of tincture,
// unlocking by knowledge crowns, validation and the share link.
import { containsProfanity } from "@/lib/profanity";

export const SHAPES = ["heater", "round", "french", "kite", "lozenge", "royal"] as const;
export const DIVISIONS = ["plain", "per-pale", "per-fess", "chief", "per-bend", "quarterly", "bordure", "per-saltire"] as const;
export const TINCTURES = ["or", "argent", "gules", "azure", "sable", "vert", "purpure", "ermine"] as const;
export const CHARGES = ["none", "star", "cross", "key", "tower", "rose", "fleur", "sword", "crown", "eagle", "lion", "moon"] as const;

export type Shape = (typeof SHAPES)[number];
export type Division = (typeof DIVISIONS)[number];
export type Tincture = (typeof TINCTURES)[number];
export type Charge = (typeof CHARGES)[number];

export type CrestDesign = {
  shape: Shape;
  division: Division;
  /** Field (first part) and second part (other half, chief, bordure…). */
  field: Tincture;
  second: Tincture;
  charge: Charge;
  chargeTincture: Tincture;
  motto: string;
};

export const DEFAULT_CREST: CrestDesign = {
  shape: "heater",
  division: "plain",
  field: "azure",
  second: "argent",
  charge: "star",
  chargeTincture: "or",
  motto: "",
};

export const SHAPE_NAMES: Record<Shape, string> = {
  heater: "Gotický štít",
  round: "Zaoblený štít",
  french: "Francouzský štít",
  kite: "Normanský štít",
  lozenge: "Kosočtverec",
  royal: "Královský štít s korunou",
};

export const DIVISION_NAMES: Record<Division, string> = {
  plain: "Celý štít",
  "per-pale": "Polcený (svisle)",
  "per-fess": "Dělený (vodorovně)",
  chief: "Hlava štítu",
  "per-bend": "Šikmo dělený",
  quarterly: "Čtvrcený",
  bordure: "Lem",
  "per-saltire": "Kosmo čtvrcený",
};

export const TINCTURE_NAMES: Record<Tincture, string> = {
  or: "Zlato",
  argent: "Stříbro",
  gules: "Červená",
  azure: "Modrá",
  sable: "Černá",
  vert: "Zelená",
  purpure: "Purpur",
  ermine: "Hermelín",
};

/** Colours used to draw the tinctures (silver is drawn white, as heralds do). */
export const TINCTURE_COLORS: Record<Tincture, string> = {
  or: "#d4a72c",
  argent: "#f4f1ea",
  gules: "#b3261e",
  azure: "#1f4e9c",
  sable: "#1b1b1b",
  vert: "#2f7d3b",
  purpure: "#6b2d7b",
  ermine: "#f4f1ea",
};

export const CHARGE_NAMES: Record<Charge, string> = {
  none: "Bez figury",
  star: "Hvězda",
  cross: "Kříž",
  key: "Klíč",
  tower: "Věž",
  rose: "Růže",
  fleur: "Lilie",
  sword: "Meč",
  crown: "Koruna",
  eagle: "Orlice",
  lion: "Lev",
  moon: "Půlměsíc",
};

// --- the rule of tincture ------------------------------------------------------

export type TinctureKind = "metal" | "colour" | "fur";

export function tinctureKind(tincture: Tincture): TinctureKind {
  if (tincture === "or" || tincture === "argent") return "metal";
  if (tincture === "ermine") return "fur";
  return "colour";
}

/** Metal on colour or colour on metal (a fur goes with anything). */
export function contrasts(a: Tincture, b: Tincture): boolean {
  const [ka, kb] = [tinctureKind(a), tinctureKind(b)];
  if (ka === "fur" || kb === "fur") return a !== b;
  return ka !== kb;
}

const PARTITIONS = new Set<Division>(["per-pale", "per-fess", "per-bend", "quarterly", "per-saltire"]);
export function isPartition(division: Division): boolean {
  return PARTITIONS.has(division);
}

export const RULE_TEXT =
  "Pravidlo tinktur: kov (zlato, stříbro) se klade na barvu a barva na kov, nikdy barva na barvu ani kov na kov. Erb tak byl čitelný i z dálky v boji. Hermelín se hodí ke všemu.";

/** Why `second` can't be used, or null when it is fine. */
export function secondProblem(design: Pick<CrestDesign, "division" | "field" | "second">): string | null {
  const { division, field, second } = design;
  if (division === "plain") return null;
  if (field === second) return "Obě části mají stejnou tinkturu – dělení by nebylo vidět.";
  // Partitions are drawn side by side: heralds allow any two tinctures there.
  if (isPartition(division)) return null;
  // Chief and bordure lie ON the field: the rule of tincture applies.
  if (!contrasts(field, second)) {
    return tinctureKind(field) === "metal"
      ? "Kov na kovu: hlava i lem musí být na kovovém poli barevné."
      : "Barva na barvě: hlava i lem musí být na barevném poli kovové (nebo hermelín).";
  }
  return null;
}

/** Why the charge tincture can't be used, or null when it is fine. */
export function chargeProblem(design: Pick<CrestDesign, "division" | "field" | "second" | "charge" | "chargeTincture">): string | null {
  const { division, field, second, charge, chargeTincture } = design;
  if (charge === "none") return null;
  // A charge over a partition of metal and colour lies on both – any tincture is fine.
  if (isPartition(division) && contrasts(field, second)) return null;
  if (!contrasts(chargeTincture, field)) {
    return tinctureKind(chargeTincture) === "metal"
      ? "Kov na kovu: na kovovém poli musí být figura barevná."
      : "Barva na barvě: na barevném poli musí být figura kovová (zlatá nebo stříbrná).";
  }
  return null;
}

export function designProblems(design: CrestDesign): string[] {
  return [secondProblem(design), chargeProblem(design), mottoProblem(design.motto)].filter((p): p is string => p !== null);
}

// --- motto -------------------------------------------------------------------------

export const MOTTO_MAX = 32;
const MOTTO_ALLOWED = /^[\p{L}\p{N} .,!?'’"„“-]*$/u;

export function cleanMotto(raw: string): string {
  return raw.normalize("NFC").replace(/\s+/g, " ").trim();
}

export function mottoProblem(raw: string): string | null {
  const motto = cleanMotto(raw);
  if ([...motto].length > MOTTO_MAX) return `Heslo může mít nejvýš ${MOTTO_MAX} znaků.`;
  if (!MOTTO_ALLOWED.test(motto)) return "V hesle použij jen písmena, číslice a obyčejnou interpunkci.";
  if (motto && containsProfanity(motto)) return "Takové heslo by se na erb nehodilo. Zkus jiné.";
  return null;
}

// --- unlocking -----------------------------------------------------------------------

/**
 * What the player has: cards in the collection and how many rulers have at
 * least a bronze/silver/gold knowledge crown (`total` = rulers in the game).
 */
export type CrownCounts = { cards: number; bronze: number; silver: number; gold: number; total: number };

export type Unlock =
  | { kind: "free" }
  | { kind: "cards"; count: number }
  | { kind: "crowns"; tier: "bronze" | "silver" | "gold"; count: number }
  | { kind: "all-gold" };

const BRONZE = (count: number): Unlock => ({ kind: "crowns", tier: "bronze", count });
const SILVER = (count: number): Unlock => ({ kind: "crowns", tier: "silver", count });
const GOLD = (count: number): Unlock => ({ kind: "crowns", tier: "gold", count });
const FREE: Unlock = { kind: "free" };
const CARDS = (count: number): Unlock => ({ kind: "cards", count });

export const UNLOCKS = {
  shape: { heater: FREE, round: CARDS(3), french: BRONZE(3), kite: SILVER(3), lozenge: GOLD(3), royal: { kind: "all-gold" } },
  division: {
    plain: FREE,
    "per-pale": FREE,
    "per-fess": CARDS(6),
    chief: BRONZE(1),
    "per-bend": BRONZE(3),
    quarterly: SILVER(1),
    bordure: SILVER(3),
    "per-saltire": GOLD(3),
  },
  tincture: {
    or: FREE,
    argent: FREE,
    gules: FREE,
    azure: FREE,
    sable: BRONZE(1),
    vert: BRONZE(3),
    purpure: GOLD(1),
    ermine: { kind: "all-gold" },
  },
  charge: {
    none: FREE,
    star: FREE,
    cross: FREE,
    key: CARDS(1),
    tower: BRONZE(1),
    rose: BRONZE(3),
    moon: BRONZE(5),
    fleur: SILVER(1),
    sword: SILVER(3),
    crown: SILVER(5),
    eagle: GOLD(1),
    lion: GOLD(3),
  },
} as const satisfies {
  shape: Record<Shape, Unlock>;
  division: Record<Division, Unlock>;
  tincture: Record<Tincture, Unlock>;
  charge: Record<Charge, Unlock>;
};

export function isUnlocked(unlock: Unlock, counts: CrownCounts): boolean {
  if (unlock.kind === "free") return true;
  if (unlock.kind === "cards") return counts.cards >= unlock.count;
  if (unlock.kind === "all-gold") return counts.total > 0 && counts.gold >= counts.total;
  return counts[unlock.tier] >= unlock.count;
}

const TIER_WORDS = { bronze: "bronzové", silver: "stříbrné", gold: "zlaté" } as const;
const TIER_WORD_ONE = { bronze: "bronzovou", silver: "stříbrnou", gold: "zlatou" } as const;

/** "Odemkne se za 3 bronzové koruny učenosti (máš 1)." */
export function unlockText(unlock: Unlock, counts: CrownCounts): string {
  if (unlock.kind === "free") return "";
  if (unlock.kind === "cards") {
    const what = unlock.count === 1 ? "první kartu panovníka" : unlock.count <= 4 ? `${unlock.count} karty panovníků` : `${unlock.count} karet panovníků`;
    return `Odemkne se za ${what} ve sbírce (máš ${counts.cards}).`;
  }
  if (unlock.kind === "all-gold") {
    return `Nejvzácnější díl: odemkne se za zlatou korunu učenosti u všech panovníků (máš ${counts.gold} z ${counts.total}).`;
  }
  const have = counts[unlock.tier];
  const what =
    unlock.count === 1
      ? `${TIER_WORD_ONE[unlock.tier]} korunu učenosti`
      : unlock.count <= 4
        ? `${unlock.count} ${TIER_WORDS[unlock.tier]} koruny učenosti`
        : `${unlock.count} ${unlock.tier === "bronze" ? "bronzových" : unlock.tier === "silver" ? "stříbrných" : "zlatých"} korun učenosti`;
  return `Odemkne se za ${what} (máš ${have}).`;
}

/** Counts rulers by their crown tier (a gold crown counts as silver and bronze too). */
export function crownCounts(tiers: readonly number[], total: number, cards = 0): CrownCounts {
  return {
    cards,
    bronze: tiers.filter((t) => t >= 1).length,
    silver: tiers.filter((t) => t >= 2).length,
    gold: tiers.filter((t) => t >= 3).length,
    total,
  };
}

/** True when every part of the design is unlocked for `counts`. */
export function designUnlocked(design: CrestDesign, counts: CrownCounts): boolean {
  return (
    isUnlocked(UNLOCKS.shape[design.shape], counts) &&
    isUnlocked(UNLOCKS.division[design.division], counts) &&
    isUnlocked(UNLOCKS.tincture[design.field], counts) &&
    (design.division === "plain" || isUnlocked(UNLOCKS.tincture[design.second], counts)) &&
    isUnlocked(UNLOCKS.charge[design.charge], counts) &&
    (design.charge === "none" || isUnlocked(UNLOCKS.tincture[design.chargeTincture], counts))
  );
}

// --- validation and the share link ----------------------------------------------

const has = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

/** A valid design from untrusted data (browser storage, server, link), or null. */
export function parseCrest(raw: unknown): CrestDesign | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  if (
    !has(SHAPES, d.shape) ||
    !has(DIVISIONS, d.division) ||
    !has(TINCTURES, d.field) ||
    !has(TINCTURES, d.second) ||
    !has(CHARGES, d.charge) ||
    !has(TINCTURES, d.chargeTincture) ||
    typeof d.motto !== "string" ||
    d.motto.length > MOTTO_MAX * 4
  ) {
    return null;
  }
  const design: CrestDesign = {
    shape: d.shape,
    division: d.division,
    field: d.field,
    second: d.second,
    charge: d.charge,
    chargeTincture: d.chargeTincture,
    motto: cleanMotto(d.motto),
  };
  return designProblems(design).length === 0 ? design : null;
}

/** Query string for the share link: /erb?s=heater&d=plain&t=azure.argent&c=star.or&m=… */
export function crestToQuery(design: CrestDesign): string {
  const params = new URLSearchParams({
    s: design.shape,
    d: design.division,
    t: `${design.field}.${design.second}`,
    c: `${design.charge}.${design.chargeTincture}`,
  });
  if (design.motto) params.set("m", design.motto);
  return params.toString();
}

export function crestFromQuery(params: Record<string, string | string[] | undefined>): CrestDesign | null {
  const one = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };
  const [field, second] = (one("t") ?? "").split(".");
  const [charge, chargeTincture] = (one("c") ?? "").split(".");
  return parseCrest({ shape: one("s"), division: one("d"), field, second, charge, chargeTincture, motto: one("m") ?? "" });
}

// --- what a reward unlocked -----------------------------------------------------------

const PART_LABELS = {
  shape: (v: string) => `tvar ${SHAPE_NAMES[v as Shape]}`,
  division: (v: string) => `dělení ${DIVISION_NAMES[v as Division]}`,
  tincture: (v: string) => `barva ${TINCTURE_NAMES[v as Tincture]}`,
  charge: (v: string) => `figura ${CHARGE_NAMES[v as Charge]}`,
} as const;

/** Every part of the crest, for "X z Y dílů odemčeno". */
export function unlockedPartCount(counts: CrownCounts): { unlocked: number; total: number } {
  let unlocked = 0;
  let total = 0;
  for (const group of Object.values(UNLOCKS) as Record<string, Unlock>[]) {
    for (const unlock of Object.values(group)) {
      total += 1;
      if (isUnlocked(unlock, counts)) unlocked += 1;
    }
  }
  return { unlocked, total };
}

/** Parts that `after` unlocks and `before` did not, e.g. ["figura Klíč"]. */
export function newlyUnlocked(before: CrownCounts, after: CrownCounts): string[] {
  const parts: string[] = [];
  for (const [group, items] of Object.entries(UNLOCKS) as [keyof typeof PART_LABELS, Record<string, Unlock>][]) {
    for (const [value, unlock] of Object.entries(items)) {
      if (!isUnlocked(unlock, before) && isUnlocked(unlock, after)) parts.push(PART_LABELS[group](value));
    }
  }
  return parts;
}
