# CLAUDE.md

Živý dokument. Průběžně aktualizuj, udržuj krátký a přehledný.

## Projekt
- Název: Český král
- Popis: webová kvízová hra o českých dějinách. Hráč odpovídá na otázky o panovnících a sbírá je jako sběratelské karty.
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
- Hosting: Railway (deploy z GitHubu, větev dev)
- Prostředí: Claude Code na webu (claude.ai/code), bez Dockeru

## Herní logika
- Každý král má 9 otázek: 3 lehké, 3 střední, 3 těžké (seed to validuje). Každá otázka má přesně 3 odpovědi, z toho 1 správnou.
- Kolo o krále = 5 otázek: 2 lehké, 2 střední, 1 těžká, v tomto pořadí, v rámci úrovně náhodně (`ROUND_PLAN`).
- U otázky štítek obtížnosti: 1–3 korunky.
- Na začátku hry o krále i rychlovky zdobný štítek „⚔️ Rytířský slib: Odlož AI i internet. Králové vše vidí. 👁️“.
- Po odpovědi hned ukaž správně/špatně + jednu větu vysvětlení.
- 4 a více správně z 5 = král se přidá do sbírky.
- Rychlovka: 10 náhodných otázek napříč králi, seřazených od lehkých po těžké.
- Hodnosti podle počtu získaných králů: panoš → rytíř → šlechtic → rádce krále.
- Postup hráče se ukládá v prohlížeči (localStorage), bez účtů.

## Datový model
- King: name, slug, reignFrom, reignTo, dynasty, shortBio, imageUrl, order
- Question: kingId, text, explanation, sourceUrl, difficulty (1 lehká, 2 střední, 3 těžká; CHECK 1–3 v DB)
- Answer: questionId, text, isCorrect
- Obsah se nahrává přes Prisma seed (prisma/seed.ts).

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
- Pracuj na větvi dev (nebo feature větvi z dev), nikdy přímo na main
- Railway zatím nasazuje z dev (každý merge do dev = nasazení); main se zatím nepoužívá, PR do main nedělat
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
- Styl: iluminovaný rukopis – pergamen z CSS gradientů, zlacené rámy (`.gilt`), vlastní SVG ornamenty, zlatá iniciála; animace: otočení karty po výhře, zelené pulznutí / zatřesení, slavnostní obrazovka Rádce krále; respektuje prefers-reduced-motion
- Mobile first
- Nezískaný král: tmavá silueta obrázku (nebo erbu) se zlatým otazníkem
- Obrázky králů: jen public domain z Wikimedia Commons, `public/kings/<slug>.webp` (max 800 px), kredity v `src/lib/image-credits.ts` → stránka /zdroje

## Struktura projektu
- Next.js 16 (App Router, `src/`, Cache Components zapnuté), Tailwind 4, Prisma 7
- `src/app/` – stránky: `page.tsx` (galerie /), `kral/[slug]/` (hra), `rychlovka/`, `zdroje/` (licence obrázků a písem), `not-found.tsx`, `layout.tsx` (fonty, hlavička, metadata), `opengraph-image.tsx` (náhled pro sdílení), `globals.css` (barvy, pergamen, animace)
- `src/app/actions/quiz.ts` – server action `checkAnswer` (ověření odpovědi na serveru)
- `src/components/` – `site-header`, `king-card`, `king-portrait` (zlatý rám, silueta), `crest` (erb s iniciálou = placeholder), `ornaments` (rohy, oddělovač, koruna), `illuminated-initial`, `royal-celebration`, `difficulty-badge` (korunky), `knight-oath` (rytířský slib), `quiz` (hra + výsledky + otočení karty, klient), `collection-gallery` (klient)
- `src/components/ui/` – shadcn komponenty (button, card, progress)
- `src/lib/` – `utils.ts` (cn), `game-rules.ts` (konstanty, `getRank`), `prisma.ts` (klient s adapterem pg), `kings.ts` (dotazy na krále), `questions.ts` (otázky bez správnosti, míchání), `quiz-types.ts`, `collection.ts` (sbírka v localStorage), `slug.ts`, `king-initial.ts`, `king-image.ts` (povolené cesty obrázků), `image-credits.ts`
- `assets/fonts/` – TTF písma pro generování OG obrázku (+ OFL licence)
- `prisma/schema.prisma` – King, Question, Answer; `prisma/migrations/` – migrace; `prisma/seed.ts` – obsah (idempotentní); `prisma.config.ts` čte `.env.local`
- `src/generated/prisma` – vygenerovaný klient (gitignored, `npm install` ho vytvoří přes postinstall)
- `.env.example` – vzor proměnných; `security_warnings.md` – rizika
- Příkazy: `npm run dev`, `npm run build`, `npm run lint`, `npm run db:migrate`, `npm run db:seed`
- `npm start` (Railway): `prisma migrate deploy` → `prisma db seed` → `next start`; data se čtou až za běhu (`connection()`), build DB nepotřebuje

## Rozhodnutí
- 2026-11-07: postup v localStorage místo účtů, protože jde o ukázkovou verzi bez přihlášení
- 2026-11-07: shadcn/ui nastaveno ručně (ui.shadcn.com je z cloud prostředí blokované); nové komponenty kopírovat do `src/components/ui/`
- 2026-11-07: Prisma 7.10.1 (stabilní; tag `latest` na npm je zatím RC verze 8)
- 2026-11-07: seed při každém deployi v jedné transakci; nejdřív posune `order` existujících králů na dočasné záporné hodnoty (unikátní order), pak upsert podle slug; otázky krále se smažou (WHERE kingId) a vloží znovu
- 2026-11-07: nezískaný král v galerii ukazuje jméno a roky, erb je silueta s otazníkem
- 2026-11-07: správnost odpovědi zná jen server; odpovědi se míchají na serveru při každém načtení
- 2026-11-07: hodnost podle podílu sbírky: 0 = panoš, < 1/2 = rytíř, ≥ 1/2 = šlechtic, všichni = rádce krále
- 2026-11-07: localStorage klíč `cesky-kral:collection`, tvar `{ version: 1, kings: string[] }`
- 2026-11-07: Railway nastaven (DATABASE_URL, doména) a nasazuje z větve dev; PR do main zatím nedělat
- 2026-11-07: vzhled iluminovaného rukopisu; Playfair nahrazen Grenze Gotisch (Almendra nemá ť/ď, Unifraktur nemá české znaky)
- 2026-11-07: cloud prostředí `cesky-kral` povoluje Wikimedia Commons (Default ho blokuje); Commons omezuje počet stažení – stahovat pomalu, se slušným User-Agent
- 2026-11-07: panovníci podle doby (order): Přemysl Otakar II., Václav II., Jan Lucemburský, Karel IV., Marie Terezie
- 2026-11-07: obtížnost otázek (migrace `question_difficulty`, sloupec s výchozí 1, nedestruktivní); 9 otázek na krále
- 2026-11-07: obrázky: Přemysl Otakar II. = jezdecká pečeť 1273 (kresba K. von Sava 1864, PD-old; Mucha má Unclear-PD-US), Karel IV. = výřez z votivního obrazu Jana Očka, Marie Terezie = kresba Meytens; Václav II. = Codex Manesse fol. 10r (PD-old-100), Jan Lucemburský = jezdecká pečeť, foto O. Posse 1909 (PD-old); všechny PD ověřené na Commons

## Údržba tohoto souboru
- Aktualizuj po každé strukturální změně, novém pravidlu nebo rozhodnutí
- Maximální stručnost
