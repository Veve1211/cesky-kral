// Display helpers shared by server and client components.

export const KING_TITLES = ["kníže", "kněžna", "král", "královna"] as const;
export type KingTitle = (typeof KING_TITLES)[number];

export function toKingTitle(value: string): KingTitle {
  return (KING_TITLES as readonly string[]).includes(value)
    ? (value as KingTitle)
    : "král";
}

/** "1346–1378", or null for legends / missing years. */
export function formatReign(king: {
  isLegend: boolean;
  reignFrom: number | null;
  reignTo: number | null;
}): string | null {
  if (king.isLegend || king.reignFrom === null || king.reignTo === null) return null;
  return `${king.reignFrom}–${king.reignTo}`;
}

export const LEGEND_NOTE = "Otázky jsou o pověsti, ne o doložené historii.";
