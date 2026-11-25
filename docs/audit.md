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

## Výkon na počítači (24. 11. 2026)

Nové měření (Lighthouse 12, preset desktop, produkční build, 3× na stránku): čas běhu JS už problém není
(TBT 0–75 ms místo dřívějších 280–400 ms). Skóre kazil **posun rozložení (CLS)**: obsah vykreslovaný až
v prohlížeči (sbírka, Denní výzva) odstrčil patičku, která byla při prvním vykreslení vidět dole na obrazovce.
Oprava: `main` má `min-h-dvh`, patička tak vždy začíná pod okrajem obrazovky.

| Stránka | Skóre před | CLS před | Skóre po | CLS po |
|---|---|---|---|---|
| /sbirka | 76 | 0,794 | 99 | 0,000 |
| /vyzva | 80–99 | až 0,420 | 99 | 0,016–0,027 |
| / | 94–99 | 0,000 | 99 | 0,000 |
| /kral/karel-iv | 99–100 | 0,026 | 99 | 0,000 |

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

- `/api/health` lze po merge nastavit jako healthcheck v Railway nebo v monitoru dostupnosti.
- Body ⏳ a ⏸ z [`game-audit.md`](game-audit.md) (postupné odhalování režimů pro nové hráče).

## Co si z toho beru

- Měřit před opravou: K9 vypadal jako jasná úspora a ukázal se jako nulový.
- Nejvíc pomohly levné, úzké změny s číslem (K2, K3) – každá v jednom PR s testem.
- Bezpečnostní nálezy byly v okrajových případech (velikost požadavku, uchovávání dat), ne v hlavní logice.

## Závěrečný technický audit (25. 11. 2026)

Kontrola produkční připravenosti: ostrý web, staging a repozitář (větev z `dev`). Jen opravy, žádné nové funkce.

| Oblast | Nález | Oprava |
|---|---|---|
| HTML (W3C Nu validátor, serverem vykreslené HTML 17 stránek) | `/kral/*` a mistrovská kola: `<title>` a meta značky ve `<body>`, `<head>` bez titulku; 10 načítacích bloků s `aria-label` na `div` bez role; `mailto` s mezerami | metadata panovníků ze seedu + `generateStaticParams` (v `<head>`); `role="status"`; `encodeURIComponent`. Výsledek: 0 chyb |
| SEO | staging indexovatelný (stejný obsah jako ostrý web, chybí noindex); žádné canonical URL; `/erb` (404) v sitemap | `X-Robots-Tag: noindex` jen na stagingu, sitemap v robots.txt jen na ostrém; canonical na všech veřejných stránkách; `/erb` ze sitemap pryč |
| Schema.org | žádná strukturovaná data | `WebSite` (název, adresa, jazyk, popis) na úvodu |
| Hlavičky | chybí HSTS, `X-Powered-By: Next.js` | HSTS 1 rok (bez subdomén a preload), `poweredByHeader: false` |
| Závislosti | `npm audit` 0 zranitelností; záplaty Next 16.4.6, React 19.3.1 | aktualizováno (přesné verze) |
| Přístupnost (axe-core, WCAG 2.2 AA, mobil + počítač, nový i vracející se hráč, i po odpovědi) | bez nálezů v ustáleném stavu; při běžící animaci karty dočasně nízký kontrast (mezistav), experimentální pravidlo „label-content-name-mismatch“ (přístupné jméno začíná viditelným textem – v pořádku) | beze změny |
| Klávesnice | všechny zastávky Tab na `/`, `/kral/karel-iv`, `/muj-erb`, `/zebricky` mají viditelný fokus | beze změny |
| Odkazy | interní: 52 adres, všechny 200; externí (89) nešly z prostředí ověřit (síťová politika) | ruční kontrola |
| Mobilní výkon (Lighthouse 13, mobil, lokální produkční build) | `/` 96–97, `/vyzva` 99, `/sbirka` 94–96; `/kral/karel-iv` 83–84 (LCP ~4,4 s simulovaně) – stejné i před změnami (80–85) | beze změny – portrét je v streamované části stránky, oprava by byla větší přestavba |
| Analytika | v projektu žádná není | nepřidáno (Soukromí: „Žádné cookies“) |

Testy po opravách (lokálně, testovací Postgres 16): lint ✓, typecheck ✓, Vitest 76/76 ✓, produkční build ✓, Playwright 404 prošlo / 0 selhalo / 40 záměrně přeskočeno (testy jen pro jeden projekt – mobil nebo počítač).
