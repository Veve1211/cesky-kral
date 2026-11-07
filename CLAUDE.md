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
- Nadpisy: Playfair Display, text: Inter (obě s českou diakritikou)
- Styl: sběratelské karty jako z erbovní knihy, zaoblené rohy, jemné animace (odkrytí karty, správná odpověď)
- Mobile first
- Nezískaný král: tmavá silueta s otazníkem

## Struktura projektu
- Next.js 16 (App Router, `src/`, Cache Components zapnuté), Tailwind 4, Prisma 7
- `src/app/` – stránky: `page.tsx` (galerie /), `kral/[slug]/` (hra), `rychlovka/`, `not-found.tsx`, `layout.tsx` (fonty, hlavička), `globals.css` (barvy, animace)
- `src/app/actions/quiz.ts` – server action `checkAnswer` (ověření odpovědi na serveru)
- `src/components/` – `site-header`, `king-card`, `crest` (erb s iniciálou = placeholder), `quiz` (hra + výsledky, klient), `collection-gallery` (galerie podle sbírky, klient)
- `src/components/ui/` – shadcn komponenty (button, card, progress)
- `src/lib/` – `utils.ts` (cn), `game-rules.ts` (konstanty, `getRank`), `prisma.ts` (klient s adapterem pg), `kings.ts` (dotazy na krále), `questions.ts` (otázky bez správnosti, míchání), `quiz-types.ts`, `collection.ts` (sbírka v localStorage), `slug.ts`, `king-initial.ts`
- `prisma/schema.prisma` – King, Question, Answer; `prisma/migrations/` – migrace; `prisma/seed.ts` – obsah (idempotentní); `prisma.config.ts` čte `.env.local`
- `src/generated/prisma` – vygenerovaný klient (gitignored, `npm install` ho vytvoří přes postinstall)
- `.env.example` – vzor proměnných; `security_warnings.md` – rizika
- Příkazy: `npm run dev`, `npm run build`, `npm run lint`, `npm run db:migrate`, `npm run db:seed`
- `npm start` (Railway): `prisma migrate deploy` → `prisma db seed` → `next start`; data se čtou až za běhu (`connection()`), build DB nepotřebuje

## Rozhodnutí
- 2026-11-07: postup v localStorage místo účtů, protože jde o ukázkovou verzi bez přihlášení
- 2026-11-07: shadcn/ui nastaveno ručně (ui.shadcn.com je z cloud prostředí blokované); nové komponenty kopírovat do `src/components/ui/`
- 2026-11-07: Prisma 7.10.1 (stabilní; tag `latest` na npm je zatím RC verze 8)
- 2026-11-07: seed při každém deployi; král upsert podle slug, jeho otázky se v transakci smažou (WHERE kingId) a vloží znovu
- 2026-11-07: nezískaný král v galerii ukazuje jméno a roky, erb je silueta s otazníkem
- 2026-11-07: správnost odpovědi zná jen server; odpovědi se míchají na serveru při každém načtení
- 2026-11-07: hodnost podle podílu sbírky: 0 = panoš, < 1/2 = rytíř, ≥ 1/2 = šlechtic, všichni = rádce krále
- 2026-11-07: localStorage klíč `cesky-kral:collection`, tvar `{ version: 1, kings: string[] }`
- 2026-11-07: Railway nastaven (DATABASE_URL, doména) a nasazuje z větve dev; PR do main zatím nedělat

## Údržba tohoto souboru
- Aktualizuj po každé strukturální změně, novém pravidlu nebo rozhodnutí
- Maximální stručnost
