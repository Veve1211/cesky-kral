// Chronicle ("Kronika panovníka") – shared by server and client.

export type ChronicleSource = { label: string; url: string };

export type ChronicleSection = { heading: string; text: string };

export type Chronicle = {
  /** Short intro – shown only when there are no sections. */
  intro: string;
  sections: ChronicleSection[];
  facts: string[];
  sources: ChronicleSource[];
};

const MAX_ITEMS = 20;

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Builds a safe chronicle from raw DB columns.
 * Returns null when the king has no chronicle yet.
 * Sections and sources come from JSON columns, so their shape is checked;
 * for sources only `https://` links are kept (no `javascript:` or other schemes).
 */
export function toChronicle(row: {
  chronicleIntro: string;
  chronicleFacts: string[] | null;
  chronicleSources: unknown;
  chronicleSections: unknown;
}): Chronicle | null {
  const intro = row.chronicleIntro.trim();

  // Sections come from a JSON column: keep only well-formed non-empty items.
  const rawSections = Array.isArray(row.chronicleSections) ? row.chronicleSections : [];
  const sections: ChronicleSection[] = [];
  for (const item of rawSections.slice(0, MAX_ITEMS)) {
    if (typeof item !== "object" || item === null) continue;
    const { heading, text } = item as Record<string, unknown>;
    if (typeof heading !== "string" || !heading.trim()) continue;
    if (typeof text !== "string" || !text.trim()) continue;
    sections.push({ heading: heading.trim(), text: text.trim() });
  }

  if (!intro && sections.length === 0) return null;

  const facts = (row.chronicleFacts ?? [])
    .map((fact) => fact.trim())
    .filter(Boolean)
    .slice(0, MAX_ITEMS);

  const rawSources = Array.isArray(row.chronicleSources) ? row.chronicleSources : [];
  const sources: ChronicleSource[] = [];
  for (const item of rawSources.slice(0, MAX_ITEMS)) {
    if (typeof item !== "object" || item === null) continue;
    const { label, url } = item as Record<string, unknown>;
    if (typeof label !== "string" || !label.trim()) continue;
    if (typeof url !== "string" || !isHttpsUrl(url)) continue;
    sources.push({ label: label.trim(), url });
  }

  return { intro, sections, facts, sources };
}
