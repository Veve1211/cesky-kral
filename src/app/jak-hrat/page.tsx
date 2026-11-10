import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";

import { KofiButton } from "@/components/kofi-button";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { DAILY_QUESTIONS } from "@/lib/daily";
import {
  CORRECT_TO_COLLECT,
  QUESTIONS_PER_KING,
  QUICK_ROUND_QUESTIONS,
  RANKS,
} from "@/lib/game-rules";
import { unlockTable } from "@/lib/heraldry";
import { TIER_SHORT, tierThresholds } from "@/lib/mastery";

export const metadata: Metadata = {
  title: "Jak hrát",
  description:
    "Pravidla hry Český král: jak získáš panovníka do sbírky, jaké jsou herní režimy a odkud pocházejí fakta.",
};

// Every number below comes from the game rules in code, so the page can't drift.
const MODES: { icon: string; name: string; href: string; text: string }[] = [
  {
    icon: "👑",
    name: "Denní výzva",
    href: "/vyzva",
    text: `${DAILY_QUESTIONS} otázek, každý den stejných pro všechny hráče. Hraje se jednou denně a nová výzva přijde o půlnoci. Hraj den co den a tvoje série 🔥 poroste.`,
  },
  {
    icon: "⚡",
    name: "Rychlovka",
    href: "/rychlovka",
    text: `${QUICK_ROUND_QUESTIONS} náhodných otázek napříč všemi panovníky, od lehkých po těžké. Do sbírky se nepočítá; hraješ o osobní rekord a místo v žebříčku.`,
  },
  {
    icon: "⏳",
    name: "Kdo vládl dřív?",
    href: "/kdo-driv",
    text: "Dva panovníci, klepni na toho, kdo začal vládnout dřív. Každá trefa prodlouží sérii, jedna chyba hru ukončí. Tvoje nejlepší série se pamatuje.",
  },
  {
    icon: "🌊",
    name: "Řeka času",
    href: "/reka-casu",
    text: "Seřaď čtyři panovníky od toho, kdo začal vládnout nejdřív. Každé správné kolo se počítá, jedna chyba hru ukončí.",
  },
  {
    icon: "🏆",
    name: "Žebříčky",
    href: "/zebricky",
    text: "Kdo vládl dřív?, Řeka času a Rychlovka mají týdenní i celkový žebříček, Denní výzva svého Dnešního vládce. Stačí přezdívka.",
  },
  {
    icon: "✨",
    name: "Mistrovské kolo",
    href: "/sbirka",
    text: "Pro panovníka, kterého už máš ve sbírce. Čekají tě všechny jeho těžké otázky. Když odpovíš správně na každou, získáš zlatou kartu.",
  },
];

// Example thresholds for a ruler with nine questions (every ruler has nine).
const [BRONZE, SILVER, GOLD] = tierThresholds(9);

/** Every reward has one meaning and one way to get it. */
const REWARDS: { icon: string; name: string; what: string; how: string }[] = [
  {
    icon: "🃏",
    name: "Karta panovníka",
    what: "Panovník je ve tvé sbírce. Odemkne se jeho kronika a roky vlády.",
    how: `Ve hře o kartu odpověz správně aspoň na ${CORRECT_TO_COLLECT} z ${QUESTIONS_PER_KING} otázek.`,
  },
  {
    icon: "👑",
    name: "Koruna učenosti",
    what: `Ukazuje, kolik toho o panovníkovi víš: ${TIER_SHORT[1]} → ${TIER_SHORT[2]} → ${TIER_SHORT[3]}. Nasadí se na jeho portrét.`,
    how: `Každá jeho otázka zodpovězená správně v jakémkoli režimu se počítá jednou. Bronz za ${BRONZE}, stříbro za ${SILVER}, zlato za všech ${GOLD}.`,
  },
  {
    icon: "✨",
    name: "Zlatá karta",
    what: "Mistrovství nad panovníkem: karta dostane zlatý třpytivý rám. (Mistrovskému kolu se dřív říkalo zlaté kolo.)",
    how: "V mistrovském kole odpověz správně na všechny jeho těžké otázky. Hraje se jen o panovníka ve sbírce.",
  },
  {
    icon: "🎖️",
    name: "Hodnost",
    what: "Jak daleko jsi s celou sbírkou.",
    how: `Podle počtu karet: ${RANKS[0]} (žádná) → ${RANKS[1]} (méně než polovina) → ${RANKS[2]} (aspoň polovina) → ${RANKS[3]} (všichni panovníci).`,
  },
  {
    icon: "🛡️",
    name: "Díly erbu",
    what: "Vzácnější tvary štítu, barvy a figury pro tvůj vlastní erb.",
    how: "Základ hned, další za karty ve sbírce a za bronzové, stříbrné a zlaté koruny učenosti, nejvzácnější za zlatou korunu u všech panovníků. Přehled je níž v části Tvůj erb.",
  },
  {
    icon: "👑",
    name: "Dnešní vládce",
    what: "První místo v dnešním žebříčku Denní výzvy – ukazuje se velké na Denní výzvě i na úvodní stránce.",
    how: "Dohraj Denní výzvu s co nejvíc správnými odpověďmi, při shodě rozhoduje rychlejší čas. Do žebříčku stačí přezdívka.",
  },
  {
    icon: "🔥",
    name: "Série",
    what: "Tvoje vytrvalost.",
    how: "V Denní výzvě dny v řadě s dohranou výzvou, v Kdo vládl dřív? trefy za sebou.",
  },
];

/** What is stored where – short and honest. */
const STORED: { where: string; items: string[] }[] = [
  {
    where: "V tvém prohlížeči",
    items: [
      "sbírka karet, zlaté karty, koruny učenosti a tvůj erb",
      "postup Denní výzvy, série 🔥 a nejlepší série v Kdo vládl dřív?",
      "náhodný anonymní klíč, podle kterého server pozná tvoje výsledky",
    ],
  },
  {
    where: "Na serveru",
    items: [
      "jen přezdívka, skóre (a čas) a parametry erbu – nic dalšího o tobě",
      "otisk anonymního klíče, ne klíč samotný",
      "kód pro přenos postupu – smaže se po použití, nejpozději za 30 minut",
    ],
  },
];

const FAQ: { question: string; answer: ReactNode }[] = [
  {
    question: "Kde se ukládá můj postup?",
    answer:
      "Sbírka, koruny, Denní výzva, série i erb jsou přímo v tvém prohlížeči, bez účtu a bez přihlašování. Na serveru je jen přezdívka, skóre do žebříčků a parametry erbu. Na jiné zařízení postup přeneseš krátkým kódem (Moje sbírka → Hraješ i jinde?): platí 30 minut a jen jednou a nic se při tom neztratí. Po smazání dat prohlížeče bez kódu začínáš od začátku.",
  },
  {
    question: "Můžu hru o kartu zkusit znovu?",
    answer:
      "Ano, kolikrát chceš. Otázky i odpovědi se pokaždé zamíchají. I u získaného panovníka si můžeš zahrát znovu nebo zkusit mistrovské kolo.",
  },
  {
    question: "Proč u některých panovníků nevidím roky vlády?",
    answer:
      "Roky se ukážou, až panovníka získáš. Jinak by šlo ve hře Kdo vládl dřív? jen opisovat.",
  },
  {
    question: "Kolikrát denně můžu hrát Denní výzvu?",
    answer:
      "Jednou. Když stránku zavřeš uprostřed, po návratu pokračuješ další otázkou. Nová výzva začíná o půlnoci podle českého času.",
  },
  {
    question: "Co znamená štítek Pověst?",
    answer:
      "Patří postavám, které známe z pověstí, třeba kněžně Libuši. Otázky o nich jsou o pověsti, ne o doložené historii, a roky vlády u nich nejsou.",
  },
];

const linkClass =
  "font-medium text-navy underline decoration-gold underline-offset-4 hover:decoration-2";

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="parchment relative flex gap-4 rounded-2xl p-5 sm:p-6">
      <CardCorners className="m-1 size-7 text-gold-dark" />
      <span
        aria-hidden
        className="gilt flex size-11 shrink-0 items-center justify-center rounded-full font-initial text-2xl text-navy shadow-md"
      >
        {number}
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="text-2xl leading-tight font-bold sm:text-3xl">
          <span className="sr-only">Krok {number}: </span>
          {title}
        </h2>
        {children}
      </div>
    </li>
  );
}

export default function HowToPlayPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">Pravidla hry</p>
        <h1 className="text-5xl font-bold sm:text-6xl">Jak hrát</h1>
        <OrnamentDivider />
        <p className="text-muted-foreground">
          Pět kroků od panoše až ke koruně. Za pár minut víš všechno.
        </p>
      </header>

      <ol className="flex flex-col gap-4">
        <Step number={1} title="Cíl hry">
          <p>
            Sbírej české panovníky jako karty z erbovní knihy. S každou kartou stoupáš v hodnosti:{" "}
            {RANKS.map((rank, i) => (
              <span key={rank}>
                {i > 0 && " → "}
                <strong>{rank}</strong>
              </span>
            ))}
            . Nejvyšší hodnost dostaneš, až máš všechny.
          </p>
        </Step>

        <Step number={2} title="Jak získáš panovníka">
          <p>
            V galerii vyber panovníka a klepni na <strong>Hrát o kartu</strong>. Čeká tě{" "}
            {QUESTIONS_PER_KING} otázek: dvě lehké, dvě střední a jedna těžká (obtížnost ukazují
            korunky). Každá otázka má tři odpovědi a jen jedna je správná.
          </p>
          <p>
            Hned po odpovědi uvidíš, jestli byla správně, a krátké vysvětlení. Když máš aspoň{" "}
            <strong>
              {CORRECT_TO_COLLECT} z {QUESTIONS_PER_KING}
            </strong>{" "}
            správně, karta se otočí a panovník je tvůj.
          </p>
        </Step>

        <Step number={3} title="Herní režimy">
          <ul className="flex flex-col gap-3">
            {MODES.map((mode) => (
              <li key={mode.name} className="flex gap-3">
                <span aria-hidden className="text-xl leading-7">
                  {mode.icon}
                </span>
                <p>
                  <Link href={mode.href} className={linkClass}>
                    {mode.name}
                  </Link>
                  : {mode.text}
                </p>
              </li>
            ))}
          </ul>
        </Step>

        <Step number={4} title="Moje sbírka a kronika">
          <p>
            V <Link href="/sbirka" className={linkClass}>Moje sbírce</Link> vidíš svou hodnost,
            získané karty i ty, které ještě chybí. Řeka času tam řadí tvoje panovníky podle toho, jak
            šli po sobě.
          </p>
          <p>
            Klepni na získanou kartu a otevře se <strong>kronika</strong>: vyprávění o životě panovníka,
            zajímavosti „Věděli jste, že…“ a zdroje. Kronika i roky vlády se odemknou, až panovníka
            získáš.
          </p>
        </Step>

        <Step number={5} title="Odkud jsou fakta">
          <p>
            Otázky i kroniky stojí na dohledatelných zdrojích, třeba z Českého rozhlasu, Národního
            archivu nebo Akademie věd. Po odpovědi najdeš u vysvětlení odkaz <strong>Zdroj</strong>,
            kronika má zdroje na konci.
          </p>
          <p>
            Obrázky jsou volná díla a písma mají otevřenou licenci, přehled je na stránce{" "}
            <Link href="/zdroje" className={linkClass}>Zdroje</Link>.
          </p>
        </Step>
      </ol>

      <section aria-labelledby="rewards-heading" className="flex flex-col gap-3">
        <h2 id="rewards-heading" className="text-center text-4xl font-bold sm:text-left">
          Přehled odměn
        </h2>
        <ul className="flex flex-col gap-3">
          {REWARDS.map((reward) => (
            <li key={reward.name} className="parchment relative flex gap-4 rounded-2xl p-5" data-testid="reward">
              <span aria-hidden className="text-3xl leading-none">
                {reward.icon}
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h3 className="font-heading text-2xl leading-tight font-bold">{reward.name}</h3>
                <p>
                  <strong>Co to je:</strong> {reward.what}
                </p>
                <p>
                  <strong>Jak ji získám:</strong> {reward.how}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="crest-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-5 sm:p-6">
        <CardCorners className="m-1 size-7 text-gold-dark" />
        <h2 id="crest-heading" className="text-3xl font-bold">
          <span aria-hidden>🛡️ </span>Tvůj erb
        </h2>
        <p>
          V <Link href="/muj-erb" className={linkClass}>heraldické dílně</Link> (v hlavičce ikona štítu, na úvodu i v
          Moje sbírce karta Tvůj erb) si složíš vlastní erb: tvar štítu, dělení, barvy, figuru a heslo pod štítem.
        </p>
        <p>
          Barvy se řídí <strong>pravidlem tinktur</strong>: kov (zlato, stříbro) patří na barvu a barva na kov. Co pravidlo
          poruší, editor nedovolí a vysvětlí proč. Erb se ukáže vedle tvé přezdívky v žebříčcích a můžeš ho stáhnout
          jako obrázek nebo poslat odkazem.
        </p>
        <h3 className="font-semibold">Jak se odemykají díly</h3>
        <p className="text-sm text-ink/85">
          Když nová karta nebo koruna učenosti odemkne díl, oslava ti to řekne a nabídne <strong>Ozdobit erb</strong>.
        </p>
        <dl className="flex flex-col gap-1.5 text-sm" data-testid="crest-unlock-table">
          {unlockTable().map((row) => (
            <div key={row.requirement} className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="shrink-0 font-semibold sm:w-64">{row.requirement}</dt>
              <dd>{row.parts.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="stored-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-5 sm:p-6">
        <CardCorners className="m-1 size-7 text-gold-dark" />
        <h2 id="stored-heading" className="text-3xl font-bold">
          <span aria-hidden>🏆 </span>Žebříčky a přezdívka
        </h2>
        <p>
          <Link href="/zebricky" className={linkClass}>Žebříčky</Link> má Denní výzva (Dnešní vládce), Kdo vládl dřív?,
          Řeka času a Rychlovka (tento týden a celkově). Žádná registrace, žádný e-mail ani jméno: stačí vymyšlená
          přezdívka (3–16 znaků, bez sprostých slov), kterou zadáš po hře nebo v Moje sbírce.
        </p>
        <p>
          <strong>Skóre počítá vždy server, ne prohlížeč</strong> – sám vybírá otázky, kontroluje odpovědi a měří čas.
          Žebříček je tak férový pro všechny.
        </p>
        <h3 className="font-semibold">Co se ukládá</h3>
        {STORED.map((group) => (
          <div key={group.where}>
            <h4 className="text-sm font-semibold">{group.where}</h4>
            <ul className="ml-5 list-disc">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-3">
        <h2 id="faq-heading" className="text-center text-4xl font-bold sm:text-left">
          Časté otázky
        </h2>
        {FAQ.map(({ question, answer }) => (
          <details
            key={question}
            className="group parchment rounded-xl px-5 py-3 open:pb-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md py-1 font-semibold outline-none focus-visible:ring-4 focus-visible:ring-ring/60">
              {question}
              <span
                aria-hidden
                className="text-gold-dark transition-transform duration-200 group-open:rotate-45"
              >
                ✚
              </span>
            </summary>
            <p className="mt-2 text-ink/90">{answer}</p>
          </details>
        ))}
      </section>

      <div className="flex justify-center">
        <Button asChild variant="accent" size="lg">
          <Link href="/">
            <Swords aria-hidden />
            Hrát
          </Link>
        </Button>
      </div>

      <KofiButton />
    </div>
  );
}
