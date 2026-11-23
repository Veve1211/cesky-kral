import type { Metadata } from "next";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";

export const metadata: Metadata = {
  title: "Soukromí",
  description: "Jaké údaje hra Český král ukládá a jaké ne. Bez účtů, bez e-mailu, bez cookies.",
};

const CONTACT_EMAIL = "paukrtovavera@seznam.cz";

const sectionClass = "parchment relative rounded-2xl p-6 sm:p-8";
const listClass = "flex list-disc flex-col gap-2 pl-5";

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-bold">Soukromí</h1>
        <OrnamentDivider />
        <p className="text-muted-foreground">
          Hra nepotřebuje účet, jméno ani e-mail. Tady je přehled, co se ukládá a co ne.
        </p>
      </header>

      <section aria-labelledby="browser-heading" className={sectionClass}>
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="browser-heading" className="mb-4 text-3xl font-bold">
          Ve tvém prohlížeči
        </h2>
        <ul className={listClass}>
          <li>Sbírka karet, koruny učenosti, erb a postup ve hře.</li>
          <li>Náhodný identifikátor hráče, podle kterého server pozná tvoje výsledky v žebříčcích.</li>
          <li>Když v prohlížeči smažeš data webu, postup i identifikátor zmizí.</li>
        </ul>
      </section>

      <section aria-labelledby="server-heading" className={sectionClass}>
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="server-heading" className="mb-4 text-3xl font-bold">
          Na našem serveru
        </h2>
        <ul className={listClass}>
          <li>
            Jen otisk identifikátoru (SHA-256), ne identifikátor samotný. Z otisku se hráč dohledat
            nedá.
          </li>
          <li>
            Přezdívka, jen pokud ji zadáš pro žebříčky. Je vidět ostatním hráčům a hlídá ji filtr
            nevhodných slov.
          </li>
          <li>Erb a heslo, pokud ho uložíš do žebříčku.</li>
          <li>Výsledky her: skóre, počet správných odpovědí a čas, pro žebříčky a denní výzvu.</li>
          <li>
            Kód pro přenos sbírky na jiné zařízení. Kvůli přenosu obsahuje i tvůj identifikátor,
            platí 30 minut a po použití se smaže; nepoužitý se smaže nejpozději do druhého dne.
          </li>
        </ul>
      </section>

      <section aria-labelledby="never-heading" className={sectionClass}>
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="never-heading" className="mb-4 text-3xl font-bold">
          Co neukládáme
        </h2>
        <ul className={listClass}>
          <li>Jméno, e-mail, věk ani polohu.</li>
          <li>
            IP adresu. Server ji krátce drží jen v paměti jako ochranu před zahlcením a do databáze ji
            nezapisuje.
          </li>
          <li>Žádné cookies, žádná analytika ani reklama.</li>
        </ul>
      </section>

      <section aria-labelledby="school-heading" className={sectionClass}>
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="school-heading" className="mb-4 text-3xl font-bold">
          Pro učitele a rodiče
        </h2>
        <p>
          Hru mohou žáci hrát bez jakékoli registrace. Pro žebříčky doporučujeme přezdívku, která
          neprozradí skutečné jméno. Smazání přezdívky a výsledků vyřídíme na e-mailu{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-navy underline decoration-gold underline-offset-4 hover:decoration-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Provozovatelka: Věra Paukrtová · {CONTACT_EMAIL}
      </p>
    </div>
  );
}
