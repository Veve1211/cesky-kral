import type { Metadata } from "next";
import Link from "next/link";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";

export const metadata: Metadata = {
  title: "Pro učitele",
  description:
    "Jak použít Český král v hodině dějepisu: rozcvička, chronologie, opakování. Zdarma, bez registrace a bez osobních údajů žáků.",
};

const FEEDBACK_EMAIL = "paukrtovavera@seznam.cz";

const linkClass = "font-semibold text-navy underline decoration-gold underline-offset-4 hover:decoration-2";

/** Short guide for history teachers: what the game is, how to use it in class, privacy, feedback. */
export default function TeachersPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-bold">Pro učitele</h1>
        <OrnamentDivider />
        <p className="text-muted-foreground">
          Český král je kvízová hra o českých panovnících. Je zdarma, bez reklam a bez registrace.
        </p>
      </header>

      <section aria-labelledby="what-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="what-heading" className="text-3xl font-bold">
          Co ve hře je
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>18 panovníků od Libuše po Karla I. a 241 otázek ve třech obtížnostech (z toho 79 jen pro Denní výzvu),</li>
          <li>u každé otázky věta vysvětlení a odkaz na zdroj, ze kterého fakt pochází,</li>
          <li>pověstné postavy mají štítek „Pověst“, aby žáci poznali pověst od doložené historie.</li>
        </ul>
      </section>

      <section aria-labelledby="class-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="class-heading" className="text-3xl font-bold">
          Jak ji použít v hodině
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href="/vyzva" className={linkClass}>
              Denní výzva
            </Link>{" "}
            jako rozcvička: 5 otázek, celá třída má ty samé, každý jeden pokus.
          </li>
          <li>
            <Link href="/kdo-driv" className={linkClass}>
              Kdo vládl dřív?
            </Link>{" "}
            a{" "}
            <Link href="/reka-casu" className={linkClass}>
              Řeka času
            </Link>{" "}
            na procvičení chronologie.
          </li>
          <li>
            hra o kartu panovníka jako domácí opakování k tomu, co jste právě probírali.
          </li>
        </ul>
      </section>

      <section aria-labelledby="privacy-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="privacy-heading" className="text-3xl font-bold">
          Bez osobních údajů
        </h2>
        <p>
          Žáci nezakládají účty a nezadávají e-mail ani jméno. Postup se ukládá jen v jejich prohlížeči. Do
          žebříčků stačí přezdívka, hlídá ji filtr sprostých slov. Doporučte žákům, ať jako přezdívku nepoužívají
          své skutečné jméno.
        </p>
      </section>

      <section aria-labelledby="feedback-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="feedback-heading" className="text-3xl font-bold">
          Napište mi, jak to šlo
        </h2>
        <p>
          Hru jste vyzkoušeli se třídou, našli jste chybu nebo vám chybí panovník? Ozvěte se na{" "}
          <a href={`mailto:${FEEDBACK_EMAIL}?subject=Český král ve třídě`} className={linkClass}>
            {FEEDBACK_EMAIL}
          </a>
          .
        </p>
      </section>

      <Link href="/" className={`self-center text-sm ${linkClass}`}>
        Zpět do hry
      </Link>
    </div>
  );
}
