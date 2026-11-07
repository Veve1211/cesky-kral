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
- Hosting: Railway (deploy z GitHubu)
- Prostředí: Claude Code na webu (claude.ai/code), bez Dockeru

## Herní logika
- Každý král má 5 otázek, každá otázka má přesně 3 odpovědi, z toho 1 správnou.
- Po odpovědi hned ukaž správně/špatně + jednu větu vysvětlení.
- 4 a více správně z 5 = král se přidá do sbírky.
- Rychlovka: 10 náhodných otázek napříč králi.
- Hodnosti podle počtu získaných králů: panoš → rytíř → šlechtic → rádce krále.
- Postup hráče se ukládá v prohlížeči (localStorage), bez účtů.

## Datový model
- King: name, slug, reignFrom, reignTo, dynasty, shortBio, imageUrl, order
- Question: kingId, text, explanation, sourceUrl
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
- main = produkce na Railway
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
- Nadpisy: Playfair Display, text: Inter (obě s českou diakritikou)
- Styl: sběratelské karty jako z erbovní knihy, zaoblené rohy, jemné animace (odkrytí karty, správná odpověď)
- Mobile first
- Nezískaný král: tmavá silueta s otazníkem

## Struktura projektu
- Next.js 16 (App Router, `src/`, Cache Components zapnuté), Tailwind 4, Prisma 7
- `src/app/` – stránky: `page.tsx` (galerie /), `kral/[slug]/` (hra), `rychlovka/`, `not-found.tsx`, `layout.tsx` (fonty, hlavička), `globals.css` (barvy, animace)
- `src/components/` – `site-header`, `king-card`, `crest` (erb s iniciálou = placeholder), `question-skeleton`
- `src/components/ui/` – shadcn komponenty (button, card, progress)
- `src/lib/` – `utils.ts` (cn), `game-rules.ts` (konstanty hry, hodnosti), `demo-kings.ts` (dočasná ukázková data, nahradí DB)
- `prisma/schema.prisma` – King, Question, Answer; `prisma.config.ts` čte `.env.local`
- `src/generated/prisma` – vygenerovaný klient (gitignored, `npm install` ho vytvoří přes postinstall)
- `.env.example` – vzor proměnných; `security_warnings.md` – rizika
- Příkazy: `npm run dev`, `npm run build`, `npm run lint`

## Rozhodnutí
- 2026-11-07: postup v localStorage místo účtů, protože jde o ukázkovou verzi bez přihlášení
- 2026-11-07: shadcn/ui nastaveno ručně (ui.shadcn.com je z cloud prostředí blokované); nové komponenty kopírovat do `src/components/ui/`
- 2026-11-07: Prisma 7.10.1 (stabilní; tag `latest` na npm je zatím RC verze 8)

## Údržba tohoto souboru
- Aktualizuj po každé strukturální změně, novém pravidlu nebo rozhodnutí
- Maximální stručnost
