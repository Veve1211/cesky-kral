import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { DAILY_QUESTIONS } from "@/lib/daily";
import {
  CORRECT_TO_COLLECT,
  QUESTIONS_PER_KING,
  QUICK_ROUND_QUESTIONS,
  RANKS,
} from "@/lib/game-rules";

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
    text: `${QUICK_ROUND_QUESTIONS} náhodných otázek napříč všemi panovníky, od lehkých po těžké. Do sbírky se nepočítá, jde jen o skóre.`,
  },
  {
    icon: "⏳",
    name: "Kdo vládl dřív?",
    href: "/kdo-driv",
    text: "Dva panovníci, klepni na toho, kdo začal vládnout dřív. Každá trefa prodlouží sérii, jedna chyba hru ukončí. Tvoje nejlepší série se pamatuje.",
  },
  {
    icon: "✨",
    name: "Zlaté kolo",
    href: "/sbirka",
    text: "Mistrovská úroveň pro panovníka, kterého už máš. Čekají tě všechny jeho těžké otázky. Když odpovíš správně na každou, karta se změní ve zlatou.",
  },
];

const FAQ: { question: string; answer: ReactNode }[] = [
  {
    question: "Kde se ukládá můj postup?",
    answer:
      "Přímo v tvém prohlížeči, bez účtu a bez přihlašování. Na jiném zařízení nebo po smazání dat prohlížeče proto začínáš od začátku.",
  },
  {
    question: "Můžu hru o kartu zkusit znovu?",
    answer:
      "Ano, kolikrát chceš. Otázky i odpovědi se pokaždé zamíchají. I u získaného panovníka si můžeš zahrát znovu nebo zkusit zlaté kolo.",
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
    </div>
  );
}
