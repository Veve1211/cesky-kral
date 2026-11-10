import type { Metadata } from "next";
import Link from "next/link";

import { KofiButton } from "@/components/kofi-button";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { KOFI_URL } from "@/lib/kofi";

export const metadata: Metadata = {
  title: "Hoď groš",
  description: "Český král je zdarma, bez reklam a bez registrace. Groš pomůže s provozem a dalšími panovníky.",
};

/** Why the game exists and what a groš pays for – with the one Ko-fi button of the page. */
export default function GroshPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-bold">
          <span aria-hidden>🪙 </span>Hoď groš
        </h1>
        <OrnamentDivider />
      </header>

      <section aria-labelledby="why-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="why-heading" className="text-3xl font-bold">
          Proč Český král vznikl
        </h2>
        <p>
          Aby se dějiny daly hrát. Pár otázek cestou do práce a najednou víš, kdo založil univerzitu v Praze
          a proč Libuše patří do pověstí. Hra je <strong>zdarma</strong>, bez reklam a bez registrace – a tak
          to i zůstane.
        </p>
      </section>

      <section aria-labelledby="what-heading" className="parchment relative flex flex-col gap-3 rounded-2xl p-6 sm:p-8">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <h2 id="what-heading" className="text-3xl font-bold">
          Na co groš půjde
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>na provoz serveru a databáze, aby hra běžela každý den,</li>
          <li>na další panovníky a otázky, každou s ověřeným zdrojem,</li>
          <li>na kronikářův inkoust a pergamen. 🙂</li>
        </ul>
      </section>

      {KOFI_URL ? (
        <KofiButton className="mx-auto max-w-sm" />
      ) : (
        <p className="text-center text-muted-foreground">Možnost poslat groš se teprve připravuje. Díky, že hraješ!</p>
      )}

      <Link
        href="/"
        className="self-center text-sm font-semibold text-navy underline decoration-gold underline-offset-4 hover:decoration-2"
      >
        Zpět do hry
      </Link>
    </div>
  );
}
