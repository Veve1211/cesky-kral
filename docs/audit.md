# Audit: případová studie (listopad 2026)

Audit hotové hry před odevzdáním do portfolia. Cíl: najít, co hráči nebo provozu reálně vadí,
opravit jen levné a bezpečné věci („quick wins“) a u každé změny ukázat čísla před a po.
Hra je ve fázi dokončení – žádné nové funkce, jen opravy, výkon a dokumentace.

## Postup

1. **Fáze 1 – průzkum.** Hra prošlá jako nový i vracející se hráč (mobil i počítač), Lighthouse,
   řádek po řádku serverový kód (API, server actions, ukládání skóre, rate limit), měření
   databázových dotazů. Herní audit obsahu a UX z 10. 11. je v [`game-audit.md`](game-audit.md).
2. **Fáze 2 – návrh.** Každý nález dostal závažnost, odhad práce a návrh řešení; Veve schválila,
   co se dělá hned.
3. **Fáze 3 – quick wins.** Každá oprava zvlášť ve feature větvi, s testem a měřením, PR do `dev`.
   Na ostrý web jde až přes PR `dev → main`, který merguje Veve.

## Co se udělalo

| Bod | Problém | Řešení | Výsledek | PR |
|---|---|---|---|---|
| Kontrola serveru | Tělo požadavku se načetlo celé a až pak se kontrolovala velikost; prošlé kódy přenosu (obsahují token) zůstávaly v DB | Čtení s limitem (`readLimited`), mazání prošlých kódů i při uplatnění a startu výzvy | Velký požadavek (i chunked) → 400 | #66 |
| Soukromí | Učitelé se ptají, co hra ukládá; stránka chyběla | `/soukromi` podle skutečného schématu DB, odkaz v patičce | Test `e2e/privacy.spec.ts` | #65 |
| K7 | Popis stránky „Karel IV.. Pět otázek…“ u 12 z 18 panovníků | `endSentence()` přidá tečku jen když chybí | Jedna tečka ve výsledcích hledání i náhledu odkazu | #67 |
| K2 | Karty v galerii stahovaly větší obrázky, než se zobrazují | Přesné `sizes` podle změřené šířky karty, mezivelikosti 320 a 480 px | Mobil: obrázky 488 → 378 KB (−23 %), počítač 518 → 403 KB (−22 %), Lighthouse mobil 99 → 100 | #68 |
| K3 | Denní výzva načítala všech 162 otázek při každé odpovědi | Výběr otázek dne jednou za den (v paměti, max 3 dny), jen lehké sloupce | 41 požadavků: 206 → 85 DB dotazů, načtení všech otázek 41× → 1×, 14–16 → 10–11 ms na požadavek | #69 |
| K6 | Žádný endpoint pro kontrolu dostupnosti | `GET /api/health` – 200 když odpoví aplikace i DB (`SELECT 1`, limit 3 s), jinak 503, bez detailů chyby | Ověřeno proti produkčnímu buildu (správná DB → 200, špatné heslo → 503); nastavení Railway beze změny | #70 |

## Co se změřilo a nedělá se

**K9 – `browserslist`.** Předpoklad: nastavení cílových prohlížečů v `package.json` odstraní
zbytečné polyfilly. Měření (úvodní stránka, skripty, které stáhne moderní prohlížeč, produkční build):

| Cílové prohlížeče | JS úvodní stránky | CSS celkem |
|---|---|---|
| bez nastavení (výchozí Next: Chrome/Edge/Firefox 111, Safari 16.4) | 629 185 B (196 154 B gzip) | 82 478 B |
| totéž výslovně v `package.json` | beze změny | beze změny |
| `baseline widely available` | beze změny | – |
| Chrome/Edge/Firefox 130, Safari 18 | beze změny (stejné velikosti, jen jiné hashe) | 81 553 B (−925 B) |

Proč: velký balík polyfillů (core-js, 112 kB) má `noModule`, takže ho moderní prohlížeč vůbec
nestáhne. Zbytek jsou vestavěné polyfilly Next.js v hlavním chunku (~1,4 kB, 0,6 kB gzip), které
`browserslist` neovlivní. Zvýšit cíl by ušetřilo necelý 1 kB CSS, ale vyřadilo by starší iPhony
(Safari 16.4–17) – u hry pro žáky to za to nestojí. **Rozhodnutí: beze změny.**

## Co zůstává

- Desktopové skóre výkonu v Lighthouse kolísá (74–89) kvůli času běhu JavaScriptu (TBT 280–400 ms),
  ne kvůli obrázkům – samostatný větší úkol.
- `/api/health` lze po merge nastavit jako healthcheck v Railway nebo v monitoru dostupnosti.
- Body ⏳ a ⏸ z [`game-audit.md`](game-audit.md) (postupné odhalování režimů, jeden jasný další krok po první kartě).

## Co si z toho beru

- Měřit před opravou: K9 vypadal jako jasná úspora a ukázal se jako nulový.
- Nejvíc pomohly levné, úzké změny s číslem (K2, K3) – každá v jednom PR s testem.
- Bezpečnostní nálezy byly v okrajových případech (velikost požadavku, uchovávání dat), ne v hlavní logice.
