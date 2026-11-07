// Seed content for Český král.
// Content is provided by the project owner – do NOT change facts here
// without the owner's approval.
//
// Idempotent: safe to run on every deploy.
// - Kings are upserted by slug.
// - Questions of each seeded king are replaced (scoped DELETE ... WHERE kingId)
//   inside one transaction, so re-running never creates duplicates.
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });

type SeedQuestion = {
  text: string;
  correct: string;
  wrong: [string, string];
  explanation: string;
  sourceUrl?: string; // falls back to the king's source
};

type SeedKing = {
  name: string;
  slug: string;
  reignFrom: number;
  reignTo: number;
  dynasty: string;
  shortBio: string;
  order: number;
  imageUrl: string; // public-domain portrait, see /zdroje
  sourceUrl: string;
  questions: SeedQuestion[];
};

const kings: SeedKing[] = [
  {
    name: "Přemysl Otakar II.",
    slug: "premysl-otakar-ii",
    reignFrom: 1253,
    reignTo: 1278,
    dynasty: "Přemyslovci",
    shortBio:
      "Král železný a zlatý, jehož říše sahala od Krkonoš až po Jadran.",
    order: 1,
    imageUrl: "/kings/premysl-otakar-ii.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/Ottokar_II_of_Bohemia",
    questions: [
      {
        text: "Jakou přezdívku Přemysl Otakar II. měl?",
        correct: "Král železný a zlatý",
        wrong: ["Otec vlasti", "Král dobrý"],
        explanation:
          "Přezdívku získal díky bohatství své říše a vojenské síle.",
      },
      {
        text: "Kdo byl jeho otec?",
        correct: "Václav I.",
        wrong: ["Václav II.", "Vladislav II."],
        explanation:
          "Na trůn nastoupil v roce 1253 po smrti svého otce Václava I.",
      },
      {
        text: "Ve které bitvě v roce 1278 padl?",
        correct: "Na Moravském poli",
        wrong: ["Na Bílé hoře", "U Kresčaku"],
        explanation:
          "Bitva na Moravském poli 26. srpna 1278 skončila jeho porážkou a smrtí.",
      },
      {
        text: "Kdo byl jeho protivníkem na Moravském poli?",
        correct: "Rudolf Habsburský",
        wrong: ["Fridrich II. Pruský", "Jan Lucemburský"],
        explanation:
          "Rudolf Habsburský, zvolený římský král, mu upíral rakouské země.",
      },
      {
        text: "Které město Přemysl Otakar II. založil roku 1265?",
        correct: "České Budějovice",
        wrong: ["Plzeň", "Kutná Hora"],
        explanation:
          "České Budějovice slavily 750 let od založení v roce 2015.",
        sourceUrl:
          "https://ct24.ceskatelevize.cz/clanek/regiony/v-ceskych-budejovicich-by-chtel-zit-kazdy-uz-750-let-135932",
      },
    ],
  },
  {
    name: "Karel IV.",
    slug: "karel-iv",
    reignFrom: 1346,
    reignTo: 1378,
    dynasty: "Lucemburkové",
    shortBio: "Otec vlasti, který z Prahy udělal jedno z center Evropy.",
    order: 2,
    imageUrl: "/kings/karel-iv.webp",
    sourceUrl: "https://prague.eu/en/2024/03/13/charles-iv-the-greatest-czech",
    questions: [
      {
        text: "Jaké jméno dostal Karel IV. původně?",
        correct: "Václav",
        wrong: ["Jan", "Ludvík"],
        explanation:
          "Pojmenovali ho po předcích z matčiny strany, jméno Karel přijal až ve Francii.",
      },
      {
        text: "Kdo byla jeho matka?",
        correct: "Eliška Přemyslovna",
        wrong: ["Anežka Česká", "Blanka z Valois"],
        explanation:
          "Eliška Přemyslovna byla dcerou Václava II., Blanka z Valois byla Karlova první manželka.",
      },
      {
        text: "Co Karel IV. založil 7. dubna 1348?",
        correct: "Univerzitu v Praze",
        wrong: ["Národní divadlo", "Pražský hrad"],
        explanation: "Pražská univerzita je nejstarší ve střední Evropě.",
      },
      {
        text: "Která část Prahy vznikla roku 1348?",
        correct: "Nové Město",
        wrong: ["Malá Strana", "Staré Město"],
        explanation:
          "Založení Nového Města je považováno za jeho nejvýznamnější stavební čin.",
      },
      {
        text: "Ve kterém roce položil základní kámen Karlova mostu?",
        correct: "1357",
        wrong: ["1415", "1620"],
        explanation:
          "Most nahradil starší Juditin most, který zničila povodeň.",
        sourceUrl:
          "https://www.novinky.cz/clanek/veda-skoly-pred-660-lety-polozil-karel-iv-zakladni-kamen-mostu-ktery-z-prahy-udelal-velemesto-40039120",
      },
    ],
  },
  {
    name: "Marie Terezie",
    slug: "marie-terezie",
    reignFrom: 1740,
    reignTo: 1780,
    dynasty: "Habsburkové",
    shortBio:
      "Jediná žena, která vládla habsburské monarchii, a velká reformátorka.",
    order: 3,
    imageUrl: "/kings/marie-terezie.webp",
    sourceUrl:
      "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
    questions: [
      {
        text: "Díky kterému dokumentu mohla Marie Terezie nastoupit na trůn?",
        correct: "Pragmatické sankci",
        wrong: ["Zlaté bule sicilské", "Majestátu Rudolfa II."],
        explanation:
          "Pragmatická sankce umožnila dědit trůn i ženám, když rod vymřel po meči.",
      },
      {
        text: "Kdo byl jejím otcem?",
        correct: "Karel VI.",
        wrong: ["Josef II.", "Leopold II."],
        explanation:
          "Smrtí Karla VI. vymřeli Habsburkové po meči a trůn zdědila jeho dcera.",
      },
      {
        text: "Kdo byl jejím manželem?",
        correct: "František Štěpán Lotrinský",
        wrong: ["Fridrich II. Pruský", "Josef II."],
        explanation:
          "Josef II. byl její syn a spoluvládce, Fridrich II. její největší nepřítel.",
      },
      {
        text: "Kterou zemi jí hned na začátku vlády zabral pruský král Fridrich II.?",
        correct: "Slezsko",
        wrong: ["Moravu", "Uhry"],
        explanation:
          "Ztráta většiny Slezska byla největší územní ztrátou její vlády.",
      },
      {
        text: "Co Marie Terezie zavedla patentem z roku 1774?",
        correct: "Povinnou školní docházku",
        wrong: ["Zrušení nevolnictví", "Toleranční patent"],
        explanation:
          "Školní povinnost platila pro děti od 6 do 12 let, nevolnictví a toleranci zavedl až Josef II.",
      },
    ],
  },
];

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
    if (!/^\/kings\/[a-z0-9-]+\.webp$/.test(king.imageUrl)) {
      throw new Error(`${king.slug}: invalid imageUrl`);
    }
    if (king.questions.length !== 5) {
      throw new Error(`${king.slug}: expected 5 questions`);
    }
    for (const url of [king.sourceUrl, ...king.questions.map((q) => q.sourceUrl)]) {
      if (url !== undefined && !url.startsWith("https://")) {
        throw new Error(`${king.slug}: source must be https: ${url}`);
      }
    }
  }
}

async function main() {
  validate(kings);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    for (const king of kings) {
      const { questions, sourceUrl, ...kingData } = king;

      await prisma.$transaction(async (tx) => {
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
              answers: {
                create: [
                  { text: q.correct, isCorrect: true },
                  ...q.wrong.map((text) => ({ text, isCorrect: false })),
                ],
              },
            },
          });
        }
      });

      console.log(`Seeded ${king.name} (${questions.length} questions)`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
