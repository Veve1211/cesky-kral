# Český král 👑

**Webová kvízová hra o českých dějinách – „Sbírej české panovníky“.**
Hráč odpovídá na krátké otázky o českých panovnících a sbírá je jako sběratelské karty
z iluminované erbovní knihy. Hra je v češtině, navržená hlavně pro mobil, bez registrace.

🌐 **Ostrý web:** [cesky-kral.up.railway.app](https://cesky-kral.up.railway.app)
· testovací web (staging): [cesky-kral-staging.up.railway.app](https://cesky-kral-staging.up.railway.app)

Ukázkový projekt do portfolia: celý stack od databáze přes server a UI po testy a nasazení.

---

## Herní režimy a mechaniky

| Režim | Jak funguje |
| --- | --- |
| **Hra o kartu** (`/kral/[slug]`) | 5 otázek o jednom panovníkovi: 2 lehké → 2 střední → 1 těžká. Každá má 3 odpovědi, jedna správná. Hned po odpovědi správně/špatně + jedna věta vysvětlení a odkaz na zdroj. **4 z 5** = karta ve sbírce (oslava s otočením karty a ohňostrojem). |
| **Zlaté kolo** (`/kral/[slug]/zlate-kolo`) | Jen pro panovníka ve sbírce: všechny jeho těžké otázky, všechny správně = **zlatá karta**. |
| **Denní výzva** (`/vyzva`) | 5 otázek od 5 různých panovníků, pro všechny hráče stejných – vybrané deterministicky podle data v Praze. Jeden pokus denně, nová o půlnoci, série 🔥, sdílení výsledku. |
| **Rychlovka** (`/rychlovka`) | 10 náhodných otázek napříč panovníky, od lehkých po těžké, sdílení skóre. |
| **Kdo vládl dřív?** (`/kdo-driv`) | Dva panovníci, klepni na toho, kdo začal vládnout dřív. Série trvá do první chyby, nejlepší série se pamatuje. |

**Postup a odměny**
- **Sbírka** a **hodnost** podle podílu získaných panovníků: panoš → rytíř → šlechtic → Český král / Česká královna.
- **Koruny učenosti** (bronzová / stříbrná / zlatá) za 1/3, 2/3 a všechny různé otázky panovníka zodpovězené správně v jakémkoli režimu.
- **Kronika** panovníka (oddíly, „Věděli jste, že…“, zdroje) se odemkne se získanou kartou.
- **Řeka času** řadí získané panovníky podle začátku vlády; nezískaní jsou jen jako počet, aby nešlo opisovat do „Kdo vládl dřív?“.
- Postup se ukládá v prohlížeči (localStorage, verzovaná data čtená defenzivně), bez účtů.

Pravidla pro hráče jsou na stránce [/jak-hrat](https://cesky-kral.up.railway.app/jak-hrat);
čísla na ní se berou přímo z herních konstant v kódu (`src/lib/game-rules.ts`, `src/lib/daily.ts`).

## Technologie

- **Next.js 16** (App Router, React Server Components, Server Actions, Cache Components) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Radix), vlastní SVG ornamenty a CSS animace (respektují `prefers-reduced-motion`)
- **PostgreSQL** + **Prisma 7** (adapter `pg`), migrace a idempotentní seed
- **Playwright** E2E testy (desktop + mobil), **GitHub Actions** CI
- Hosting **Railway** (dvě prostředí, každé s vlastní databází)

## Struktura projektu

```
src/
  app/                 stránky (App Router)
    page.tsx           úvod: Řeka času, Kdo vládl dřív?, galerie
    kral/[slug]/       hra o kartu, zlate-kolo/, vlastní OG náhled
    vyzva/ rychlovka/ kdo-driv/ sbirka/ jak-hrat/ zdroje/
    actions/           server actions: checkAnswer, checkWhoFirst
  components/          UI komponenty (quiz, karty, oslavy, kronika, hlavička…)
    ui/                shadcn komponenty
  lib/                 herní pravidla, dotazy do DB, localStorage úložiště, sdílení
  proxy.ts             skutečné HTTP 404 pro neexistující panovníky
prisma/
  schema.prisma        King, Question, Answer
  migrations/          SQL migrace (s CHECK omezeními)
  seed-data.ts         obsah: panovníci a otázky (se zdroji)
  chronicles.ts        kroniky panovníků
  seed.ts              validace + zápis do DB v jedné transakci
e2e/                   Playwright testy a pomocníci
docs/                  ověření historického obsahu
```

## Ochrana odpovědí na serveru

- Do prohlížeče jdou jen texty otázek a odpovědí s `id` – **nikdy příznak správnosti ani vysvětlení**.
  Odpovědi se míchají na serveru (`crypto.randomInt`) při každém načtení.
- Správnost ověřuje server action **`checkAnswer`** (`src/app/actions/quiz.ts`): validuje vstupy
  (kladná celá čísla v rozsahu INT), ověří, že odpověď patří k otázce, a teprve pak vrátí výsledek,
  správnou odpověď, vysvětlení a `https://` zdroj.
- „Kdo vládl dřív?“ posílá karty bez roků; roky vrací až **`checkWhoFirst`** po odpovědi.
- Dotazy do DB jsou parametrizované (Prisma), slug se validuje regulárním výrazem, veškerý text
  se vykresluje přes React (escapování, žádné `dangerouslySetInnerHTML`), externí odkazy jen `https://`.
- Známá a vědomě přijatá omezení (sbírka v prohlížeči lze upravit) a další rizika jsou v
  [`security_warnings.md`](security_warnings.md).

## Fakta a zdroje

- Žádná vymyšlená fakta: každá otázka má ověřený zdroj (URL, jen `https://`); co nejde ověřit, se vynechá.
- Seed obsah validuje: 9 otázek na panovníka (3 lehké, 3 střední, 3 těžké), 3 odpovědi, jedna správná,
  žádné duplicity, https zdroje.
- Ověření a opravy obsahu jsou zapsané v [`docs/historical-content.md`](docs/historical-content.md);
  regresní testy hlídají fakta i počty otázek.
- Obrázky panovníků jen volná díla (public domain) z Wikimedia Commons, s kredity na stránce `/zdroje`.

## Prostředí a postup práce

| Větev | Prostředí | Web |
| --- | --- | --- |
| `dev` | staging (testovací, vlastní DB) | cesky-kral-staging.up.railway.app |
| `main` | production (ostrý, vlastní DB) | cesky-kral.up.railway.app |

1. Práce ve feature větvi z `dev`.
2. Pull request do `dev` → automatické testy (GitHub Actions).
3. Merge = nasazení na testovací web → kontrola tam.
4. Pull request `dev` → `main` → testy → merge (jen správce repozitáře, nikdy automaticky) = vydání na ostrý web.

Při každém nasazení i restartu `npm start` spustí `prisma migrate deploy` → `prisma db seed` → `next start`,
takže nová prázdná databáze se naplní sama a opakovaný seed nevytváří duplicity.

## Spuštění lokálně

Potřebuješ Node.js 22+ a PostgreSQL.

```bash
npm install
```

Vytvoř `.env.local` podle `.env.example` (soubor je v `.gitignore`, nikdy ho necommituj):

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cesky_kral"
```

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Hra běží na <http://localhost:3000>.

## Testy (Playwright, E2E)

Testy proklikají hru v prohlížeči jako hráč – na počítači (Desktop Chrome) i na mobilu (iPhone 13).
Běží proti produkčnímu buildu a **samostatné testovací databázi** (název musí obsahovat `test`,
jinak se běh zastaví – testy tak nikdy nesáhnou na produkci). Správné odpovědi znají testy ze seedu.

1. Do `.env.local` přidej adresu prázdné testovací DB:
   `E2E_DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cesky_kral_test"`
2. Jen poprvé (v cloud prostředí Claude Code není potřeba):

```bash
npx playwright install chromium
```

3. Spusť testy (build, migrace + seed testovací DB, testy):

```bash
npm run test:e2e
```

Varianty: jeden soubor `npm run test:e2e -- e2e/king-round.spec.ts`, jen mobil
`npm run test:e2e -- --project=mobile`, bez nového buildu `E2E_SKIP_BUILD=1 npm run test:e2e`.

**GitHub Actions** (`.github/workflows/e2e.yml`) spouští u každého pull requestu do `dev` i `main`
lint, build, migrace + seed dočasné Postgres databáze a všechny E2E testy. Při chybě je report
ke stažení v záložce **Actions** jako artefakt `playwright-report`.
