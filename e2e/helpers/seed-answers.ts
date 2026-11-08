// Knows the correct answers straight from the seed data (not from the app's
// API), so a test can win or lose on purpose.
import { chronicles } from "../../prisma/chronicles";
import { kings, type SeedKing, type SeedQuestion } from "../../prisma/seed-data";

export { chronicles, kings };
export type { SeedKing, SeedQuestion };

export type KnownQuestion = SeedQuestion & { kingSlug: string };

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

const byText = new Map<string, KnownQuestion>();
for (const king of kings) {
  for (const question of king.questions) {
    const key = normalize(question.text);
    const existing = byText.get(key);
    // The same text for two kings is fine only if the right answer matches too.
    if (existing && existing.correct !== question.correct) {
      throw new Error(`Ambiguous question text in the seed: ${question.text}`);
    }
    byText.set(key, { ...question, kingSlug: king.slug });
  }
}

/** Seed question by its text, or undefined when the text is unknown. */
export function findQuestion(text: string): KnownQuestion | undefined {
  return byText.get(normalize(text));
}

export function getKing(slug: string): SeedKing {
  const king = kings.find((k) => k.slug === slug);
  if (!king) throw new Error(`Unknown king in the seed: ${slug}`);
  return king;
}

export function kingByName(name: string): SeedKing {
  const king = kings.find((k) => k.name === normalize(name));
  if (!king) throw new Error(`Unknown king name in the seed: ${name}`);
  return king;
}
