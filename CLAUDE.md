# CLAUDE.md

Živý dokument. Průběžně aktualizuj, udržuj krátký a přehledný.

## Projekt
- Název: Český král
- Popis: webová kvízová hra o českých dějinách. Hráč odpovídá na otázky o panovnících a sbírá je jako sběratelské karty. Podtitul: „Sbírej české panovníky“.
- Cíl: ukázkový projekt do portfolia, celý stack od databáze po nasazení
- Inspirace principu: trefujse.cz (krátká kola, 3 odpovědi, okamžitá zpětná vazba). Nekopíruj vzhled ani texty.
- Cílová skupina: žáci a učitelé dějepisu, veřejnost; hlavně na mobilu
- Fáze: dokončení. Žádné nové funkce bez výslovného pokynu Veve; jen opravy, texty, testy a dokumentace
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
- Auth: žádné účty; anonymní hráč = náhodný token v prohlížeči (`cesky-kral:player`), server ukládá jen jeho SHA-256
- Hosting: Railway, dvě prostředí, každé s vlastní databází:
  - větev `dev` = staging (testovací web): https://cesky-kral-staging.up.railway.app
  - větev `main` = ostrý web: https://cesky-kral.up.railway.app
- Prostředí: Claude Code na webu (claude.ai/code), bez Dockeru

## Herní logika (zkráceně, detail v `docs/game-logic.md`)
- 18 panovníků, každý 9 otázek (3 lehké, 3 střední, 3 těžké), každá 3 odpovědi, 1 správná; správnost zná jen server
- Hra o kartu: 5 otázek, 4 správně = karta do sbírky; Mistrovské kolo = zlatá karta
- Režimy: Denní výzva, Rychlovka, Kdo vládl dřív?, Řeka času; skóre do žebříčků počítá jen server
- Odměny: karta, koruny učenosti, zlatá karta, hodnost, díly erbu, série 🔥
- Bez účtů: postup v localStorage, do žebříčků jen přezdívka, server zná jen hash tokenu
- Roky nezískaných panovníků skryté („???? – ????“), správná odpověď nesmí být čitelná ze jména

## Pravidla

### Obsah
- Nikdy nenechávej v UI placeholder.
- NIKDY si nevymýšlej historická fakta, otázky ani odpovědi. Používej jen obsah ze seed souboru, který dodá uživatel; nový obsah jen na výslovný pokyn uživatele a jen s ověřeným zdrojem (URL) u každé otázky – co nejde ověřit, vynech (viz `docs/historical-content.md`).
- Obrázky jen vlastní, generované nebo s volnou licencí (public domain). Dokud nejsou, použij dekorativní placeholder (iniciála krále v erbu).

### Prostředí
- NIKDY needituj .env, používej pouze .env.local
- NIKDY nevypisuj hesla ani DATABASE_URL do chatu, kódu ani commitů
- Komunikace v chatu: česky
- Kód (proměnné, komentáře, commity): anglicky

### Git a commity
- Pracuj ve feature větvi z dev, nikdy přímo na dev ani main
- Postup: práce → PR do dev (testy) → merge = nasazení na testovací web → kontrola tam → PR dev → main (testy) → merge = vydání na ostrý web
- PR vždy do dev; na ostrý web jde změna jen přes PR dev → main a ten merguje Veve (Claude nikdy nemerguje)
- Před každým commitem a pushem se zeptej uživatele
- Před každým push na main otestuj web přes Chrome DevTools MCP.
- Před merge do main zkontroluj staging na mobilu, tabletu a počítači
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
- Styl: iluminovaný rukopis – pergamen z CSS gradientů, zlacené rámy (`.gilt`), vlastní SVG ornamenty, zlatá iniciála; animace: otočení karty po výhře, zelené pulznutí / zatřesení, zlatá karta (`.golden-frame` + `.golden-sheet` + `.golden-sheen`), slavnostní obrazovka „Pán / Paní erbovní knihy“; respektuje prefers-reduced-motion
- Mobile first
- Nezískaný král: tmavá silueta obrázku (nebo erbu) se zlatým otazníkem; roky vlády skryté jako „???? – ????“ (galerie i /kral); Řeka času ukazuje jen získané
- Obrázky králů: jen public domain z Wikimedia Commons, `public/kings/<slug>.webp` (max 800 px), kredity v `src/lib/image-credits.ts` → stránka /zdroje

## Struktura projektu (detail v `docs/game-logic.md`)
- Next.js 16 (App Router, `src/`, Cache Components), Tailwind 4, Prisma 7
- `src/app/` stránky a API, `src/components/` UI, `src/lib/` logika, `prisma/` schéma, migrace a seed, `e2e/` testy, `docs/` dokumentace
- Příkazy: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run db:migrate`, `npm run db:seed`, `npm run test:e2e`
- `npm start` (Railway): `prisma migrate deploy` → `prisma db seed` → `next start`
- Soukromí: `src/app/soukromi` (co se ukládá v prohlížeči a na serveru, kontakt pro smazání), odkaz v patičce; při změně ukládaných údajů stránku uprav
- SEO a bezpečnost: `src/app/sitemap.ts` (veřejné stránky + králové ze seedu), `src/app/robots.ts`, adresa webu v `src/lib/site-url.ts`, bezpečnostní hlavičky v `next.config.ts`; ikony `src/app/favicon.ico` a `apple-icon.png` (koruna); PWA „Přidat na plochu“: `src/app/manifest.ts` + `public/icons/` (192, 512, maskable), `appleWebApp` v layoutu, bez service workeru (test `e2e/pwa.spec.ts`)

## Testy
- Jednotkové testy (Vitest, `npm test`): čistá herní logika v `src/lib/*.test.ts` (hodnosti, koruny, denní výzva, erb, další krok), bez DB, běží v CI před buildem
- Playwright E2E (desktop + mobil), testovací DB z `E2E_DATABASE_URL` (název musí obsahovat `test`); CI na každém PR do dev i main
- Novou funkci pokryj testem; při změně textů v UI uprav i testy

## Rozhodnutí
- Viz `docs/decisions.md`

## Údržba tohoto souboru
- Aktualizuj po každé strukturální změně, novém pravidlu nebo rozhodnutí
- Maximální stručnost
- Rozhodnutí (datum + co + proč) zapisuj do `docs/decisions.md`, ne sem
