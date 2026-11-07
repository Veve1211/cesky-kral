import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { fontCredits, imageCredits } from "@/lib/image-credits";

export const metadata: Metadata = {
  title: "Zdroje",
  description: "Původ a licence obrázků a písem použitých ve hře Český král.",
};

const linkClass =
  "inline-flex items-center gap-1 font-medium text-navy underline decoration-gold underline-offset-4 hover:decoration-2";

export default function SourcesPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-bold">Zdroje</h1>
        <OrnamentDivider />
        <p className="text-muted-foreground">
          Odkud pocházejí obrázky a písma. Používáme jen volná díla (public
          domain) a písma s otevřenou licencí.
        </p>
      </header>

      <section aria-labelledby="images-heading" className="parchment relative rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="images-heading" className="mb-4 text-3xl font-bold">
          Obrázky panovníků
        </h2>
        {imageCredits.length === 0 ? (
          <p className="text-muted-foreground">
            Obrázky zatím doplňujeme. Do té doby králové nosí ozdobný erb se
            svou iniciálou.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {imageCredits.map((credit) => (
              <li key={credit.kingSlug} className="flex flex-col gap-1 border-b border-gold/30 pb-4 last:border-0 last:pb-0">
                <p className="font-heading text-xl font-bold">{credit.kingName}</p>
                <p className="text-sm">{credit.title}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                  <dt className="text-muted-foreground">Autor</dt>
                  <dd>{credit.author}</dd>
                  <dt className="text-muted-foreground">Rok</dt>
                  <dd>{credit.year}</dd>
                  <dt className="text-muted-foreground">Licence</dt>
                  <dd>{credit.license}</dd>
                </dl>
                <a href={credit.commonsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Wikimedia Commons
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="fonts-heading" className="parchment relative rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="fonts-heading" className="mb-4 text-3xl font-bold">
          Písma
        </h2>
        <ul className="flex flex-col gap-3">
          {fontCredits.map((font) => (
            <li key={font.name} className="text-sm">
              <a href={font.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {font.name}
                <ExternalLink className="size-3.5" aria-hidden />
              </a>{" "}
              – {font.usage}, {font.license}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Ozdobné rámy, rohy, oddělovače a erby jsou vlastní kresby (SVG).
        </p>
      </section>
    </div>
  );
}
