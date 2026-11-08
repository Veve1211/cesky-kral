# CLAUDE.md

Živý dokument. Průběžně aktualizuj, udržuj krátký a přehledný.

## Projekt
- Název: Český král
- Popis: webová kvízová hra o českých dějinách. Hráč odpovídá na otázky o panovnících a sbírá je jako sběratelské karty. Podtitul: „Sbírej české panovníky“.
- Cíl: ukázkový projekt do portfolia, celý stack od databáze po nasazení
- Inspirace principu: trefujse.cz (krátká kola, 3 odpovědi, okamžitá zpětná vazba). Nekopíruj vzhled ani texty.
- Cílová skupina: veřejnost, hlavně na mobilu
- Brand tón: přátelský, lehce hravý, česky
- Jazyk UI: čeština

## Uživatel
- Skill level: začátečník
- Neptej se na technické detaily. Rozhoduj sám a vysvětluj jednoduše, co jsi udělal a proč.
- Na konci každého úkolu napiš jednou větou, co si mám zkontrolovat.

## Stack
- Framework: Next.js (App Router) + TypeScript + React, nejnovější stabilní verze
- UI: Tailwind CSS + shadcn/ui
- Databáze: PostgreSQL na Railway + Prisma ORM
- Auth: zatím žádná
- Hosting: Railway, dvě prostředí s vlastní databází: `staging` = větev dev (testovací web), `production` = větev main (ostrý web)
- Prostředí: Claude Code na webu (claude.ai/code), bez Dockeru

## Herní logika
- Každý král má 9 otázek: 3 lehké, 3 střední, 3 těžké (seed to validuje). Každá otázka má přesně 3 odpovědi, z toho 1 správnou.
- Kolo o krále = 5 otázek: 2 lehké, 2 střední, 1 těžká, v tomto pořadí, v rámci úrovně náhodně (`ROUND_PLAN`).
- U otázky štítek obtížnosti: 1–3 korunky.
- Na začátku hry o krále i rychlovky zdobný štítek „⚔️ Rytířský slib: Odlož AI i internet. Králové vše vidí. 👁️“.
- Po odpovědi hned ukaž správně/špatně + jednu větu vysvětlení.
- 4 a více správně z 5 = král se přidá do sbírky.
- Zlaté kolo (mistrovská úroveň, `/kral/[slug]/zlate-kolo`): jen pro panovníka ve sbírce; všechny jeho těžké otázky v náhodném pořadí; všechny správně = zlatá karta (zlatý třpytivý rám všude). Tlačítko „✨ Zlaté kolo“ na kartě, v Moje sbírka i na stránce panovníka.
- Rychlovka: 10 náhodných otázek napříč králi, seřazených od lehkých po těžké.
- Hodnosti podle podílu získaných panovníků: panoš → rytíř → šlechtic → Český král / Česká královna (všichni).
- Pověstné postavy (`isLegend`): štítek „Pověst“ na kartě i ve hře, ve hře věta „Otázky jsou o pověsti, ne o doložené historii.“, roky se nezobrazují.
- Na kartě se zobrazuje titul (kníže / kněžna / král / královna).
- Postup hráče se ukládá v prohlížeči (localStorage), bez účtů.
- /sbirka „Moje sbírka“: hodnost + „Ve sbírce: X z N“ + „✨ Zlatých: Y z N“, získaní (klik = kronika), „Ještě chybí“ (siluety, Hrát o kartu); prázdný stav s tlačítkem na prvního panovníka. Hlavička: „Moje sbírka“ → /sbirka, Rychlovka → /rychlovka (pod `sm` jen ikona ⚡ s aria-label), aktivní odkaz `aria-current="page"`; logo → /.
- Kdo vládl dřív? (`/kdo-driv`): dvě náhodné karty (bez pověstí), roky skryté; klik na toho, kdo začal vládnout dřív (`reignFrom`), ověří server action `checkWhoFirst`. Správně = pulznutí, roky, série +1 🔥, Další; špatně = zatřesení, roky, konec, skóre + nejlepší série (localStorage `cesky-kral:who-first`, `{ version: 1, best }`). Stejná dvojice nikdy dvakrát po sobě. V hlavičce jen ikona ⏳ (aria-label).
- Řeka času (`ReignTimeline`, jedna komponenta): podle `reignFrom`, pověsti první se štítkem Pověst. Získaný = malý portrét + jméno + roky (zlatá karta = zlatý rám), klik = kronika; nezískaný = tečka s ?, klik = hra o kartu. `full` na /sbirka (mobil svisle, od `lg` vodorovně), `compact` na / (vodorovný pruh, posouvá se jen pruh).
- Úvodní stránka: nadpis → Řeka času → okénko „⏳ Kdo vládl dřív?“ (jedna dvojice, pak „Hrát dál“ → /kdo-driv) → úvodní text → hodnost a sbírka → galerie. Data jedním dotazem v jednom Suspense, náhodná dvojice se losuje na serveru (bez nesouladu při hydrataci).
- Kronika panovníka: po otočení vyhrané karty tlačítko „📜 Přečíst kroniku“; v galerii klik na získanou kartu otevře kroniku (dialog, na mobilu přes celou obrazovku), nezískaná karta: „Kronika se odemkne, až panovníka získáš.“ Bez kroniky = nic se nezobrazí. Kronika = oddíly (nadpis + text, iniciála jen u prvního, mezi nimi oddělovač), bez oddílů úvod (`chronicleIntro`); pak „Věděli jste, že…“ a zdroje. Nadpis „Kronika: …“ a zavřít zůstávají nahoře, posouvá se jen obsah.

## Datový model
- King: name, slug, reignFrom?, reignTo? (prázdné u pověstí), title (kníže/kněžna/král/královna, CHECK v DB), isLegend, dynasty, shortBio, imageUrl?, order, chronicleIntro (""), chronicleFacts (text[]), chronicleSources (JSON `[{label, url}]`, CHECK pole), chronicleSections (JSON `[{heading, text}]`, výchozí [], CHECK pole)
- Question: kingId, text, explanation, sourceUrl, difficulty (1 lehká, 2 střední, 3 těžká; CHECK 1–3 v DB)
- Answer: questionId, text, isCorrect
- Obsah se nahrává přes Prisma seed (prisma/seed.ts); kroniky v `prisma/chronicles.ts` (podle slug, chybějící král se přeskočí).

## Pravidla

### Obsah
- NIKDY si nevymýšlej historická fakta, otázky ani odpovědi. Používej jen obsah ze seed souboru, který dodá uživatel.
- Obrázky jen vlastní, generované nebo s volnou licencí (public domain). Dokud nejsou, použij dekorativní placeholder (iniciála krále v erbu).

### Prostředí
- NIKDY needituj .env, používej pouze .env.local
- NIKDY nevypisuj hesla ani DATABASE_URL do chatu, kódu ani commitů
- Komunikace v chatu: česky
- Kód (proměnné, komentáře, commity): anglicky

### Git a commity
- Pracuj ve feature větvi z dev, nikdy přímo na dev ani main
- Postup: práce → PR do dev (testy) → merge = nasazení na testovací web → kontrola tam → PR dev → main (testy) → merge = vydání na ostrý web
- PR dev → main jen na výslovný pokyn uživatele; nikdy nemerguj sám
- Před každým commitem a pushem se zeptej uživatele
- Commit zprávy: anglicky, stručně (feat: add king gallery, fix: answer feedback)

### Produkční mód
Pokud NODE_ENV=production:
- žádné destruktivní DB operace (DROP, TRUNCATE, DELETE bez WHERE, reset)
- migrace jen s výslovným potvrzením uživatele

### Knihovny
- Vždy nejnovější stabilní verze, ověř na internetu
- Žádné deprecated balíčky

### Bezpečnost
- U každé funkce kontroluj validaci vstupů a XSS
- Rizika zapisuj do security_warnings.md

## Grafika a UI
- Primární: #14213d (tmavě modrá)
- Akcent: #c9a227 (zlatá)
- Pozadí karet: #f5efe0 (pergamen)
- Nadpisy: Grenze Gotisch, iniciály/erby: Uncial Antiqua, text: Inter (všechna ověřená na ř, ě, ů, ť, ď)
- Styl: iluminovaný rukopis – pergamen z CSS gradientů, zlacené rámy (`.gilt`), vlastní SVG ornamenty, zlatá iniciála; animace: otočení karty po výhře, zelené pulznutí / zatřesení, zlatá karta (`.golden-frame` + `.golden-sheet` + `.golden-sheen`), slavnostní obrazovka „Český král / Česká královna“; respektuje prefers-reduced-motion
- Mobile first
- Nezískaný král: tmavá silueta obrázku (nebo erbu) se zlatým otazníkem; roky vlády skryté jako „???? – ????“ (galerie i /kral); Řeka času ukazuje jen získané
- Obrázky králů: jen public domain z Wikimedia Commons, `public/kings/<slug>.webp` (max 800 px), kredity v `src/lib/image-credits.ts` → stránka /zdroje

## Struktura projektu
- Next.js 16 (App Router, `src/`, Cache Components zapnuté), Tailwind 4, Prisma 7
- `src/app/` – stránky: `page.tsx` (galerie /), `kral/[slug]/` (hra), `kral/[slug]/zlate-kolo/` (zlaté kolo), `rychlovka/`, `kdo-driv/` (Kdo vládl dřív?), `sbirka/` (Moje sbírka), `zdroje/` (licence obrázků a písem), `not-found.tsx`, `layout.tsx` (fonty, hlavička, metadata), `opengraph-image.tsx` (náhled pro sdílení), `globals.css` (barvy, pergamen, animace)
- `src/app/actions/quiz.ts` – server action `checkAnswer` (ověření odpovědi na serveru); `actions/who-first.ts` – `checkWhoFirst`
- `src/components/` – `site-header`, `site-nav` (navigace, aktivní odkaz; klient v Suspense), `king-card`, `king-portrait` (zlatý rám, silueta), `crest` (erb s iniciálou = placeholder), `ornaments` (rohy, oddělovač, koruna), `illuminated-initial`, `royal-celebration`, `legend-badge` (Pověst), `difficulty-badge` (korunky), `knight-oath` (rytířský slib), `quiz` (hra + výsledky + otočení karty, klient), `collection-gallery` (galerie /, klient), `collection-summary` (`useCollectionSummary`, `CollectionStatus`, `GoldenCount`, `KingGrid` – sdílí galerie i /sbirka), `my-collection` (/sbirka, klient), `chronicle-dialog` (kronika, klient), `golden-badge` (Zlatá karta), `golden-round-button` (tlačítko zlatého kola + zlatý rám hlavičky panovníka, klient), `reign-timeline` (Řeka času jen se získanými + „a ještě X neznámých panovníků“, klient), `king-reign-line` (roky na /kral podle sbírky, klient), `who-first-game` (Kdo vládl dřív?, `full` / `teaser`, klient)
- `src/components/ui/` – shadcn komponenty (button, card, progress, dialog)
- `src/lib/` – `utils.ts` (cn), `game-rules.ts` (konstanty, `getRank`), `prisma.ts` (klient s adapterem pg), `kings.ts` (dotazy na krále), `questions.ts` (otázky bez správnosti, míchání, `getGoldenQuestions`), `quiz-types.ts`, `collection.ts` (sbírka + zlaté karty v localStorage, verze 2, `useCollectionReady`), `slug.ts`, `king-initial.ts`, `king-image.ts` (povolené cesty obrázků), `king-display.ts` (titul, roky, text o pověsti), `chronicle.ts` (typ + bezpečné čtení kroniky a oddílů), `who-first.ts` (typy, `pickPair`), `who-first-best.ts` (nejlepší série v localStorage), `image-credits.ts`
- `assets/fonts/` – TTF písma pro generování OG obrázku (+ OFL licence)
- `prisma/schema.prisma` – King, Question, Answer; `prisma/migrations/` – migrace; `prisma/seed-data.ts` – obsah (bez vedlejších efektů, importují ho i testy); `prisma/seed.ts` – zápis do DB (idempotentní); `prisma.config.ts` čte `.env.local`
- `src/generated/prisma` – vygenerovaný klient (gitignored, `npm install` ho vytvoří přes postinstall)
- `.env.example` – vzor proměnných; `security_warnings.md` – rizika
- Příkazy: `npm run dev`, `npm run build`, `npm run lint`, `npm run db:migrate`, `npm run db:seed`, `npm run test:e2e`
- `npm start` (Railway, obě prostředí): `prisma migrate deploy` → `prisma db seed` → `next start` při každém nasazení i restartu; nová prázdná DB se tím sama naplní (ručně nic); data se čtou až za běhu (`connection()`), build DB nepotřebuje

## Testy
- Playwright E2E: `playwright.config.ts`, testy v `e2e/*.spec.ts`, pomocníci `e2e/helpers/` (`seed-answers.ts` = správné odpovědi ze seedu, `game.ts` = hraní kola, localStorage, čekání na hydrataci)
- Projekty `desktop` (Desktop Chrome) a `mobile` (iPhone 13 v Chromiu); běží proti `next start` na portu 3100
- Testovací DB z `E2E_DATABASE_URL` (v `.env.local`), název musí obsahovat `test`; `e2e/global-setup.ts` udělá migrace + seed
- V cloud prostředí: lokální Postgres (`service postgresql start`), Chromium z `/opt/pw-browsers` (config ho najde sám)
- CI: `.github/workflows/e2e.yml` u každého PR do dev i main (Postgres service, lint, build, seed, testy; při chybě artefakt `playwright-report`)
- Novou funkci pokryj testem; při změně textů v UI uprav i testy

- Historický obsah: ověřené opravy a zdroje v `docs/historical-content.md`; regrese `e2e/historical-content.spec.ts` hlídá fakta, zdroje a všech 108 otázek.

- Přístupnost kvízu: po změně otázky a výsledku fokus na nadpis (s pořadím/skóre pro čtečky), bez dalšího kroku v tabulátoru; regrese `e2e/quiz-accessibility.spec.ts`. Velké nadpisy na pergamenu používají `gilt-text gilt-text-ink` (WCAG AA ≥ 3 : 1), světlé zlato zůstává na tmavém pozadí.

- Stabilita a 404: `e2e/loading-and-not-found.spec.ts` kontroluje pozdní načtení písem na úvodu, ve sbírce a ve hře; GET/HEAD 404 obou herních URL a HTTP 200 pro všech 12 panovníků i zlatá kola.

## Rozhodnutí
- 2026-11-08: všechna tři písma se dál přednačítají; `display: optional` brání pozdní výměně písma a poskakování stránky. Na pomalé síti může v daném zobrazení zůstat náhradní písmo. `src/proxy.ts` před streamováním ověřuje existenci panovníka pro skutečné HTTP 404; běžné stránky dál streamují. Zbývající vývojová zranitelnost a důvod neprovedení rizikového upgradu jsou v `security_warnings.md`.
- 2026-11-07: postup v localStorage místo účtů, protože jde o ukázkovou verzi bez přihlášení
- 2026-11-07: shadcn/ui nastaveno ručně (ui.shadcn.com je z cloud prostředí blokované); nové komponenty kopírovat do `src/components/ui/`
- 2026-11-07: Prisma 7.10.1 (stabilní; tag `latest` na npm je zatím RC verze 8)
- 2026-11-07: seed při každém deployi v jedné transakci; nejdřív posune `order` existujících králů na dočasné záporné hodnoty (unikátní order), pak upsert podle slug; otázky krále se smažou (WHERE kingId) a vloží znovu
- 2026-11-07: nezískaný král v galerii ukazuje jméno a roky, erb je silueta s otazníkem
- 2026-11-07: správnost odpovědi zná jen server; odpovědi se míchají na serveru při každém načtení
- 2026-11-07: hodnost podle podílu sbírky: 0 = panoš, < 1/2 = rytíř, ≥ 1/2 = šlechtic, všichni = Český král / Česká královna (dříve Rádce krále)
- 2026-11-07: localStorage klíč `cesky-kral:collection`, tvar `{ version: 1, kings: string[] }`
- 2026-11-08: localStorage v2 `{ version: 2, kings, golden }`; v1 se při načtení převede (golden = []), nečitelná data se nepřepisují; golden ⊆ kings
- 2026-11-08: zlaté kolo – zámek „jen ve sbírce“ je na klientovi (sbírka je v localStorage); správnost dál jen server
- 2026-11-08: počet „Zlatých: Y z N“ podle počtu panovníků v DB (galerie i /sbirka)
- 2026-11-07: Railway nastaven (DATABASE_URL, doména) a nasazuje z větve dev; PR do main zatím nedělat
- 2026-11-07: vzhled iluminovaného rukopisu; Playfair nahrazen Grenze Gotisch (Almendra nemá ť/ď, Unifraktur nemá české znaky)
- 2026-11-07: cloud prostředí `cesky-kral` povoluje Wikimedia Commons (Default ho blokuje); Commons omezuje počet stažení – stahovat pomalu, se slušným User-Agent
- 2026-11-08: panovníci podle doby (order 1–12): Libuše, Svatý Václav, Přemysl Otakar I., Přemysl Otakar II., Václav II., Jan Lucemburský, Karel IV., Jiří z Poděbrad, Rudolf II., Marie Terezie, Josef II., Karel I.
- 2026-11-07: migrace `king_title_legend` (title + isLegend, roky nepovinné) – nedestruktivní
- 2026-11-07: patička bez „ukázkový projekt“: jen Český král, odkaz na /zdroje a rok (`SITE_YEAR`)
- 2026-11-07: obtížnost otázek (migrace `question_difficulty`, sloupec s výchozí 1, nedestruktivní); 9 otázek na krále
- 2026-11-07: obrázky: Přemysl Otakar II. = jezdecká pečeť 1273 (kresba K. von Sava 1864, PD-old; Mucha má Unclear-PD-US), Karel IV. = výřez z votivního obrazu Jana Očka, Marie Terezie = kresba Meytens; Václav II. = Codex Manesse fol. 10r (PD-old-100), Jan Lucemburský = jezdecká pečeť, foto O. Posse 1909 (PD-old); všechny PD ověřené na Commons
- 2026-11-07: obrázky dávky 3+4: Libuše = obraz K. V. Mašek 1893, sv. Václav = Gumpoldova legenda (Wolfenbüttel, fol. 18v, před 1006), Jiří = dřevořez M. Kuthen 1539, Rudolf II. = Hans von Aachen 1606–08, Josef II. = A. von Maron, Karel I. = foto E. Förster 1917 (LoC); vyřazeno: pečeť Jiřího (PD-CzechGov nejisté), foto Maškova obrazu (CC BY)
- 2026-11-08: kronika panovníka (migrace `king_chronicle`, nedestruktivní, výchozí prázdné hodnoty); fakta navazují na „Věděli jste, že…“ a zobrazují se doslova; zdroje jen https; kronika i u Přemysla Otakara I. (dávka 5)

- 2026-11-08: obrázek Přemysla Otakara I. = jezdecká pečeť 1192–93, kresba A. Sedláček (PD-old); 12 karet = plná mřížka (2 sloupce mobil, 3 od `sm`)

- 2026-11-08: stránka /sbirka; „Do sbírky“ po hře vede na /sbirka, „Zpět do galerie“ na /; usePathname v hlavičce musí být v Suspense (Cache Components)
- 2026-11-08: oddíly kroniky (migrace `king_chronicle_sections`, nedestruktivní, výchozí []); `intro` v `chronicles.ts` zůstává jako záloha

- 2026-11-08: Kdo vládl dřív? – karty do prohlížeče bez roků, roky vrací až server action po odpovědi; remíza v roce = správně obojí
- 2026-11-08: E2E testy Playwright; data seedu přesunuta do `prisma/seed-data.ts` (beze změny obsahu), aby je testy mohly importovat; mobil testován v Chromiu (jeden prohlížeč stačí)
- 2026-11-08: galerie ukazuje roky vlády jen u získaných panovníků (jinak „???? – ????“), aby nešlo opisovat do Kdo vládl dřív?; totéž /kral a Řeka času (nezískaní jen jako počet, bez jmen, odkazů a pořadí); test `e2e/hidden-reign.spec.ts`
- 2026-11-08: roky všech panovníků zůstávají v datech stránky (zdrojový kód) – vědomě: hra není ochrana proti podvádění, roky jsou veřejně dostupné

- 2026-11-08: dvě prostředí na Railway (staging z dev, production z main, každé s vlastní DB); migrace + seed dál v `npm start` (ověřeno: prázdná DB se naplní, opakovaný seed bez duplicit); railway.json nepřidán (dokumentaci Railway nešlo z cloudu ověřit)

## Údržba tohoto souboru
- Aktualizuj po každé strukturální změně, novém pravidlu nebo rozhodnutí
- Maximální stručnost
