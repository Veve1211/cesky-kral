// Seeds the database with the content from prisma/seed-data.ts and
// prisma/chronicles.ts.
//
// Idempotent: safe to run on every deploy.
// - Kings are upserted by slug.
// - Questions of each seeded king are replaced (scoped DELETE ... WHERE kingId)
//   inside one transaction, so re-running never creates duplicates.
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { chronicles, type SeedChronicle } from "./chronicles";
import { kings, type SeedKing } from "./seed-data";

config({ path: ".env.local" });

// Guard against broken content before touching the database.
function validate(data: SeedKing[]) {
  const slugs = new Set<string>();
  const orders = new Set<number>();
  for (const king of data) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(king.slug)) {
      throw new Error(`Invalid slug: ${king.slug}`);
    }
    if (slugs.has(king.slug)) throw new Error(`Duplicate slug: ${king.slug}`);
    if (orders.has(king.order)) throw new Error(`Duplicate order: ${king.order}`);
    slugs.add(king.slug);
    orders.add(king.order);
    if (king.imageUrl !== null && !/^\/kings\/[a-z0-9-]+\.webp$/.test(king.imageUrl)) {
      throw new Error(`${king.slug}: invalid imageUrl`);
    }
    // Real rulers need years; legends may have none.
    if (king.isLegend) {
      if ((king.reignFrom === null) !== (king.reignTo === null)) {
        throw new Error(`${king.slug}: set both reign years or none`);
      }
    } else if (
      king.reignFrom === null ||
      king.reignTo === null ||
      king.reignFrom > king.reignTo
    ) {
      throw new Error(`${king.slug}: invalid reign years`);
    }
    if (!["kníže", "kněžna", "král", "královna"].includes(king.title)) {
      throw new Error(`${king.slug}: invalid title`);
    }
    // Exactly 3 easy + 3 medium + 3 hard questions per king.
    if (king.questions.length !== 9) {
      throw new Error(`${king.slug}: expected 9 questions, got ${king.questions.length}`);
    }
    for (const level of [1, 2, 3] as const) {
      const count = king.questions.filter((q) => q.difficulty === level).length;
      if (count !== 3) {
        throw new Error(`${king.slug}: expected 3 questions of difficulty ${level}, got ${count}`);
      }
    }
    const texts = new Set(king.questions.map((q) => q.text));
    if (texts.size !== king.questions.length) {
      throw new Error(`${king.slug}: duplicate question text`);
    }
    for (const url of [king.sourceUrl, ...king.questions.map((q) => q.sourceUrl)]) {
      if (url !== undefined && !url.startsWith("https://")) {
        throw new Error(`${king.slug}: source must be https: ${url}`);
      }
    }
  }
}

function validateChronicles(data: Record<string, SeedChronicle>) {
  for (const [slug, chronicle] of Object.entries(data)) {
    if (!chronicle.intro.trim()) throw new Error(`${slug}: chronicle intro is empty`);
    for (const section of chronicle.sections) {
      if (!section.heading.trim() || !section.text.trim()) {
        throw new Error(`${slug}: chronicle section without heading or text`);
      }
    }
    if (chronicle.facts.some((fact) => !fact.trim())) {
      throw new Error(`${slug}: empty chronicle fact`);
    }
    for (const source of chronicle.sources) {
      if (!source.label.trim()) throw new Error(`${slug}: chronicle source without label`);
      if (!source.url.startsWith("https://")) {
        throw new Error(`${slug}: chronicle source must be https: ${source.url}`);
      }
    }
  }
}

// Kings without a chronicle get empty fields (nothing breaks in the app).
function chronicleData(slug: string) {
  const chronicle = chronicles[slug];
  return {
    chronicleIntro: chronicle?.intro ?? "",
    chronicleFacts: chronicle?.facts ?? [],
    chronicleSources: chronicle?.sources ?? [],
    chronicleSections: chronicle?.sections ?? [],
  };
}

async function main() {
  validate(kings);
  validateChronicles(chronicles);
  for (const slug of Object.keys(chronicles)) {
    if (!kings.some((king) => king.slug === slug)) {
      console.log(`Chronicle for "${slug}" skipped: king is not in the seed yet`);
    }
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    // One transaction: either everything is seeded or nothing changes.
    await prisma.$transaction(
      async (tx) => {
        // `order` is unique: first move existing seeded kings to temporary
        // negative values, so re-ordering never collides during upserts.
        const existing = await tx.king.findMany({
          where: { slug: { in: kings.map((k) => k.slug) } },
          select: { id: true },
          orderBy: { id: "asc" },
        });
        for (const [i, row] of existing.entries()) {
          await tx.king.update({ where: { id: row.id }, data: { order: -(i + 1) } });
        }

        for (const king of kings) {
          const { questions, sourceUrl, ...rest } = king;
          const kingData = { ...rest, ...chronicleData(king.slug) };

          const saved = await tx.king.upsert({
            where: { slug: king.slug },
            update: kingData,
            create: kingData,
          });

          // Scoped to this king only (never an unscoped DELETE).
          await tx.question.deleteMany({ where: { kingId: saved.id } });

          for (const q of questions) {
            await tx.question.create({
              data: {
                kingId: saved.id,
                text: q.text,
                explanation: q.explanation,
                sourceUrl: q.sourceUrl ?? sourceUrl,
                difficulty: q.difficulty,
                answers: {
                  create: [
                    { text: q.correct, isCorrect: true },
                    ...q.wrong.map((text) => ({ text, isCorrect: false })),
                  ],
                },
              },
            });
          }

          console.log(`Seeded ${king.name} (${questions.length} questions)`);
        }
      },
      { maxWait: 10_000, timeout: 120_000 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
