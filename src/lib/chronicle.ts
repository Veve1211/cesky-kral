// Chronicle ("Kronika panovníka") – shared by server and client.

export type ChronicleSource = { label: string; url: string };

export type Chronicle = {
  intro: string;
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
 * Sources come from a JSON column, so their shape is checked and only
 * `https://` links are kept (no `javascript:` or other schemes).
 */
export function toChronicle(row: {
  chronicleIntro: string;
  chronicleFacts: string[] | null;
  chronicleSources: unknown;
}): Chronicle | null {
  const intro = row.chronicleIntro.trim();
  if (!intro) return null;

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

  return { intro, facts, sources };
}
