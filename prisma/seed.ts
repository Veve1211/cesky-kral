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

type Difficulty = 1 | 2 | 3; // 1 easy, 2 medium, 3 hard

type SeedQuestion = {
  difficulty: Difficulty;
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
        difficulty: 1,
        text: "Jakou přezdívku Přemysl Otakar II. měl?",
        correct: "Král železný a zlatý",
        wrong: ["Otec vlasti", "Král dobrý"],
        explanation:
          "Přezdívku získal díky bohatství své říše a vojenské síle.",
      },
      {
        difficulty: 1,
        text: "Kdo byl jeho otec?",
        correct: "Václav I.",
        wrong: ["Václav II.", "Vladislav II."],
        explanation:
          "Na trůn nastoupil v roce 1253 po smrti svého otce Václava I.",
      },
      {
        difficulty: 1,
        text: "Ve které bitvě v roce 1278 padl?",
        correct: "Na Moravském poli",
        wrong: ["Na Bílé hoře", "U Kresčaku"],
        explanation:
          "Bitva na Moravském poli 26. srpna 1278 skončila jeho porážkou a smrtí.",
      },
      {
        difficulty: 2,
        text: "Kdo byl jeho protivníkem na Moravském poli?",
        correct: "Rudolf Habsburský",
        wrong: ["Fridrich II. Pruský", "Jan Lucemburský"],
        explanation:
          "Rudolf Habsburský, zvolený římský král, mu upíral rakouské země.",
      },
      {
        difficulty: 2,
        text: "Které město Přemysl Otakar II. založil roku 1265?",
        correct: "České Budějovice",
        wrong: ["Plzeň", "Kutná Hora"],
        explanation:
          "České Budějovice slavily 750 let od založení v roce 2015.",
        sourceUrl:
          "https://ct24.ceskatelevize.cz/clanek/regiony/v-ceskych-budejovicich-by-chtel-zit-kazdy-uz-750-let-135932",
      },
      {
        difficulty: 2,
        text: "S kým se Přemysl Otakar II. oženil, aby upevnil nárok na Rakousy?",
        correct: "S Markétou Babenberskou",
        wrong: ["S Kunhutou Uherskou", "S Eliškou Přemyslovnou"],
        explanation:
          "Markéta byla sestrou zesnulého rakouského vévody Fridricha II. Babenberského.",
      },
      {
        difficulty: 3,
        text: "Kolik nových měst Přemysl Otakar II. přibližně založil?",
        correct: "Asi 30",
        wrong: ["Asi 5", "Asi 100"],
        explanation:
          "Jedním z nich jsou i České Budějovice.",
      },
      {
        difficulty: 3,
        text: "Po kom Přemysl Otakar II. převzal Korutany a Kraňsko?",
        correct: "Po Oldřichu III. Sponheimském",
        wrong: ["Po Fridrichu II. Babenberském", "Po Rudolfu Habsburském"],
        explanation:
          "Jeho panství tak sahalo od Krkonoš až na území dnešního Slovinska.",
      },
      {
        difficulty: 3,
        text: "Proč se Přemysl Otakar II. v roce 1273 nestal římským králem?",
        correct: "Kurfiřti zvolili Rudolfa Habsburského",
        wrong: ["Sám odmítl kandidovat", "Zemřel ještě před volbou"],
        explanation:
          "Spor s Rudolfem pak skončil Otakarovou smrtí na Moravském poli.",
      },
    ],
  },
  {
    name: "Václav II.",
    slug: "vaclav-ii",
    reignFrom: 1278,
    reignTo: 1305,
    dynasty: "Přemyslovci",
    shortBio:
      "Král stříbra, který dal Čechám pražský groš a získal polskou korunu.",
    order: 2,
    imageUrl: "/kings/vaclav-ii.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/Wenceslaus_II_of_Bohemia",
    questions: [
      {
        difficulty: 1,
        text: "Kdo byl otcem Václava II.?",
        correct: "Přemysl Otakar II.",
        wrong: ["Karel IV.", "Jan Lucemburský"],
        explanation:
          "Byl jediným přeživším synem Přemysla Otakara II.",
      },
      {
        difficulty: 1,
        text: "Kterou minci začal Václav II. razit?",
        correct: "Pražský groš",
        wrong: ["Tolar", "Dukát"],
        explanation:
          "Těžbu stříbra udělal královským monopolem a ze stříbra razil pražské groše.",
      },
      {
        difficulty: 1,
        text: "Kterou další královskou korunu získal Václav II. roku 1300?",
        correct: "Polskou",
        wrong: ["Uherskou", "Francouzskou"],
        explanation:
          "V roce 1300 se nechal korunovat polským králem.",
      },
      {
        difficulty: 2,
        text: "Kdo podle pramenů věznil malého Václava, když za něj vládl?",
        correct: "Ota Braniborský",
        wrong: ["Rudolf Habsburský", "Záviš z Falkenštejna"],
        explanation:
          "Po smrti Přemysla Otakara II. převzal správu země braniborský markrabě Ota V.",
      },
      {
        difficulty: 2,
        text: "Ve kterém roce se Václav II. vrátil do Čech a začal vládnout bez regenta?",
        correct: "1283",
        wrong: ["1278", "1300"],
        explanation:
          "Bylo mu tehdy teprve dvanáct let.",
      },
      {
        difficulty: 2,
        text: "Co vydal Václav II. roku 1300?",
        correct: "Horní zákoník Ius regale montanorum",
        wrong: ["Zlatou bulu", "Pragmatickou sankci"],
        explanation:
          "Nový královský horní zákoník upravoval těžbu stříbra.",
      },
      {
        difficulty: 3,
        text: "Proč dal Václav II. roku 1290 popravit Záviše z Falkenštejna?",
        correct: "Kvůli údajné zradě",
        wrong: ["Kvůli prohrané bitvě", "Kvůli nesplaceným dluhům"],
        explanation:
          "Záviš byl partnerem Václavovy matky. Po jeho popravě začal Václav vládnout samostatně.",
      },
      {
        difficulty: 3,
        text: "Kdo byla první manželka Václava II.?",
        correct: "Jitka Habsburská",
        wrong: ["Eliška Přemyslovna", "Markéta Babenberská"],
        explanation:
          "Jitka byla dcerou Rudolfa Habsburského, tedy muže, který porazil Václavova otce. Eliška Přemyslovna byla Václavova dcera.",
      },
      {
        difficulty: 3,
        text: "Kterou korunu získal Václav II. roku 1301 pro svého syna Václava III.?",
        correct: "Uherskou",
        wrong: ["Polskou", "Rakouskou"],
        explanation:
          "Václav III. byl korunován uherským králem 27. srpna 1301 v Székesfehérváru.",
      },
    ],
  },
  {
    name: "Jan Lucemburský",
    slug: "jan-lucembursky",
    reignFrom: 1310,
    reignTo: 1346,
    dynasty: "Lucemburkové",
    shortBio:
      "Rytíř a cestovatel na českém trůně, který slepý padl v bitvě u Kresčaku.",
    order: 3,
    imageUrl: "/kings/jan-lucembursky.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/John_of_Bohemia",
    questions: [
      {
        difficulty: 1,
        text: "Ve které bitvě padl Jan Lucemburský?",
        correct: "U Kresčaku",
        wrong: ["Na Moravském poli", "Na Bílé hoře"],
        explanation:
          "Padl 26. srpna 1346 v bitvě proti anglickému vojsku.",
      },
      {
        difficulty: 1,
        text: "Jakou přezdívku Jan Lucemburský má?",
        correct: "Slepý",
        wrong: ["Železný a zlatý", "Otec vlasti"],
        explanation:
          "Posledních zhruba deset let života byl slepý.",
      },
      {
        difficulty: 1,
        text: "Kdo byl jeho nejstarší syn a nástupce na českém trůně?",
        correct: "Karel IV.",
        wrong: ["Václav II.", "Jiří z Poděbrad"],
        explanation:
          "Karel se později stal i římským císařem.",
      },
      {
        difficulty: 2,
        text: "S kým se Jan roku 1310 oženil, a získal tak český trůn?",
        correct: "S Eliškou Přemyslovnou",
        wrong: ["S Jitkou Habsburskou", "S Markétou Babenberskou"],
        explanation:
          "Sňatek mu zařídil otec, Janovi bylo teprve 14 let.",
      },
      {
        difficulty: 2,
        text: "Kde se Jan Lucemburský narodil?",
        correct: "V Lucembursku",
        wrong: ["V Praze", "V Paříži"],
        explanation:
          "Narodil se v Lucembursku a vyrůstal v Paříži.",
      },
      {
        difficulty: 2,
        text: "Kdo byl otcem Jana Lucemburského?",
        correct: "Římský císař Jindřich VII.",
        wrong: ["Rudolf Habsburský", "Přemysl Otakar II."],
        explanation:
          "Jan byl nejstarším synem císaře Jindřicha VII.",
      },
      {
        difficulty: 3,
        text: "Proč Jana mnozí čeští šlechtici považovali za „krále cizince“?",
        correct: "Většinu času trávil mimo Čechy",
        wrong: ["Neuměl česky číst", "Pocházel z Polska"],
        explanation:
          "Správu Čech přenechal jiným a cestoval, hlavně do Lucemburska a na francouzský dvůr.",
      },
      {
        difficulty: 3,
        text: "Kde Jan Lucemburský přišel o zrak?",
        correct: "Na křížové výpravě v Litvě",
        wrong: ["V bitvě u Kresčaku", "Ve vězení v Paříži"],
        explanation:
          "Oslepl kolem roku 1336 kvůli zánětu očí.",
      },
      {
        difficulty: 3,
        text: "Kde je Jan Lucemburský dnes pohřben?",
        correct: "V katedrále Notre-Dame v Lucemburku",
        wrong: ["V katedrále sv. Víta v Praze", "Ve Zbraslavském klášteře"],
        explanation:
          "Jeho ostatky byly do lucemburské katedrály přeneseny v roce 1945.",
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
    order: 4,
    imageUrl: "/kings/karel-iv.webp",
    sourceUrl: "https://prague.eu/en/2024/03/13/charles-iv-the-greatest-czech",
    questions: [
      {
        difficulty: 2,
        text: "Jaké jméno dostal Karel IV. původně?",
        correct: "Václav",
        wrong: ["Jan", "Ludvík"],
        explanation:
          "Pojmenovali ho po předcích z matčiny strany, jméno Karel přijal až ve Francii.",
      },
      {
        difficulty: 1,
        text: "Kdo byla jeho matka?",
        correct: "Eliška Přemyslovna",
        wrong: ["Anežka Česká", "Blanka z Valois"],
        explanation:
          "Eliška Přemyslovna byla dcerou Václava II., Blanka z Valois byla Karlova první manželka.",
      },
      {
        difficulty: 1,
        text: "Co Karel IV. založil 7. dubna 1348?",
        correct: "Univerzitu v Praze",
        wrong: ["Národní divadlo", "Pražský hrad"],
        explanation: "Pražská univerzita je nejstarší ve střední Evropě.",
      },
      {
        difficulty: 2,
        text: "Která část Prahy vznikla roku 1348?",
        correct: "Nové Město",
        wrong: ["Malá Strana", "Staré Město"],
        explanation:
          "Založení Nového Města je považováno za jeho nejvýznamnější stavební čin.",
      },
      {
        difficulty: 2,
        text: "Ve kterém roce položil základní kámen Karlova mostu?",
        correct: "1357",
        wrong: ["1415", "1620"],
        explanation:
          "Most nahradil starší Juditin most, který zničila povodeň.",
        sourceUrl:
          "https://www.novinky.cz/clanek/veda-skoly-pred-660-lety-polozil-karel-iv-zakladni-kamen-mostu-ktery-z-prahy-udelal-velemesto-40039120",
      },
      {
        difficulty: 1,
        text: "Jakou nejvyšší hodnost Karel IV. získal?",
        correct: "Římský císař",
        wrong: ["Papež", "Francouzský král"],
        explanation:
          "Na císaře byl korunován v Římě 5. dubna 1355.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
      {
        difficulty: 3,
        text: "U kterého královského dvora strávil Karel sedm let mládí?",
        correct: "U francouzského",
        wrong: ["U uherského", "U anglického"],
        explanation:
          "Jméno Karel přijal na počest francouzského krále Karla IV., u jehož dvora žil.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
      {
        difficulty: 3,
        text: "Co upravovala Zlatá bula, kterou Karel vydal roku 1356?",
        correct: "Volbu římského krále",
        wrong: ["Založení pražské univerzity", "Stavbu Karlova mostu"],
        explanation:
          "Zlatá bula stanovila pravidla, podle kterých se volil král Svaté říše římské.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
      {
        difficulty: 3,
        text: "Kdy byl Karel korunován českým králem?",
        correct: "2. září 1347",
        wrong: ["26. srpna 1346", "7. dubna 1348"],
        explanation:
          "26. srpna 1346 padl jeho otec Jan Lucemburský u Kresčaku, 7. dubna 1348 Karel založil univerzitu.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
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
    order: 5,
    imageUrl: "/kings/marie-terezie.webp",
    sourceUrl:
      "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
    questions: [
      {
        difficulty: 2,
        text: "Díky kterému dokumentu mohla Marie Terezie nastoupit na trůn?",
        correct: "Pragmatické sankci",
        wrong: ["Zlaté bule sicilské", "Majestátu Rudolfa II."],
        explanation:
          "Pragmatická sankce umožnila dědit trůn i ženám, když rod vymřel po meči.",
      },
      {
        difficulty: 1,
        text: "Kdo byl jejím otcem?",
        correct: "Karel VI.",
        wrong: ["Josef II.", "Leopold II."],
        explanation:
          "Smrtí Karla VI. vymřeli Habsburkové po meči a trůn zdědila jeho dcera.",
      },
      {
        difficulty: 1,
        text: "Kdo byl jejím manželem?",
        correct: "František Štěpán Lotrinský",
        wrong: ["Fridrich II. Pruský", "Josef II."],
        explanation:
          "Josef II. byl její syn a spoluvládce, Fridrich II. její největší nepřítel.",
      },
      {
        difficulty: 2,
        text: "Kterou zemi jí hned na začátku vlády zabral pruský král Fridrich II.?",
        correct: "Slezsko",
        wrong: ["Moravu", "Uhry"],
        explanation:
          "Ztráta většiny Slezska byla největší územní ztrátou její vlády.",
      },
      {
        difficulty: 2,
        text: "Co Marie Terezie zavedla patentem z roku 1774?",
        correct: "Povinnou školní docházku",
        wrong: ["Zrušení nevolnictví", "Toleranční patent"],
        explanation:
          "Školní povinnost platila pro děti od 6 do 12 let, nevolnictví a toleranci zavedl až Josef II.",
      },
      {
        difficulty: 1,
        text: "Kolik dětí Marie Terezie porodila?",
        correct: "16",
        wrong: ["4", "8"],
        explanation:
          "Šestnáct dětí porodila během devatenácti let, v letech 1737–1756.",
        sourceUrl: "https://en.wikipedia.org/wiki/Maria_Theresa",
      },
      {
        difficulty: 3,
        text: "Kde byla Marie Terezie v roce 1743 korunována českou královnou?",
        correct: "V katedrále sv. Víta v Praze",
        wrong: ["Ve Svatoštěpánském dómu ve Vídni", "V katedrále sv. Petra a Pavla v Brně"],
        explanation:
          "Korunovace proběhla 12. května 1743.",
        sourceUrl: "https://en.wikipedia.org/wiki/Maria_Theresa",
      },
      {
        difficulty: 3,
        text: "Kdo se stal v roce 1765 spoluvládcem Marie Terezie?",
        correct: "Její syn Josef II.",
        wrong: ["Její manžel František Štěpán", "Fridrich II. Pruský"],
        explanation:
          "Josef vládl s matkou až do její smrti v roce 1780, pak už sám.",
        sourceUrl: "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
      },
      {
        difficulty: 3,
        text: "Jak dlouho podle patentu z roku 1774 trvala povinná školní docházka?",
        correct: "Od 6 do 12 let věku",
        wrong: ["Od 10 do 15 let věku", "Od 3 do 6 let věku"],
        explanation:
          "Povinnost šlo splnit i soukromým vyučováním, které si mohly dovolit hlavně bohatší rodiny.",
        sourceUrl: "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
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

async function main() {
  validate(kings);

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
          const { questions, sourceUrl, ...kingData } = king;

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
