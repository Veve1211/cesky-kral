# Český král 👑

**Webová kvízová hra o českých dějinách – „Sbírej české panovníky“.**
Hráč odpovídá na krátké otázky o českých panovnících a sbírá je jako sběratelské karty
z iluminované erbovní knihy. Hra je v češtině, navržená hlavně pro mobil, bez registrace.

🌐 **Ostrý web:** [cesky-kral.up.railway.app](https://cesky-kral.up.railway.app)
· testovací web (staging): [cesky-kral-staging.up.railway.app](https://cesky-kral-staging.up.railway.app)

Ukázkový projekt do portfolia: celý stack od databáze přes server a UI po testy a nasazení.

---

## Herní režimy a mechaniky

Úvodní stránka má jedno hlavní tlačítko **„Začni hrát“** (nového hráče pošle rovnou do hry o prvního
panovníka); vracející se hráč vidí **„Pokračuj“** s dalším nezískaným panovníkem.

| Režim | Jak funguje |
| --- | --- |
| **Hra o kartu** (`/kral/[slug]`) | 5 otázek o jednom panovníkovi: 2 lehké → 2 střední → 1 těžká. Každá má 3 odpovědi, jedna správná. Hned po odpovědi správně/špatně + jedna věta vysvětlení a odkaz na zdroj. **4 z 5** = karta ve sbírce (oslava s otočením karty a ohňostrojem). |
| **Mistrovské kolo** (`/kral/[slug]/zlate-kolo`) | Jen pro panovníka ve sbírce: všechny jeho těžké otázky, všechny správně = **zlatá karta**. |
| **Denní výzva** (`/vyzva`) | 5 otázek od 5 různých panovníků, pro všechny stejných (vybrané deterministicky podle data v Praze). Jeden pokus denně, nová o půlnoci, odpočet, série 🔥. **Denní žebříček** (počet správných, při shodě čas) s **„Dnešním vládcem“**; po dohrání pořadí a co chybělo na lepší místo. |
| **Rychlovka** (`/rychlovka`) | 10 náhodných otázek napříč panovníky, od lehkých po těžké. Osobní rekord, týdenní a celkový žebříček. |
| **Kdo vládl dřív?** (`/kdo-driv`) | Dva panovníci, klepni na toho, kdo začal vládnout dřív. Série do první chyby, týdenní a celkový žebříček. |
| **Řeka času** (`/reka-casu`) | Seřaď čtyři panovníky od toho, kdo začal vládnout nejdřív. Každé správné kolo +1, chyba = konec. Týdenní a celkový žebříček. |

Po správné odpovědi hra sama naskočí na další otázku (~1 s); po chybné počká, aby šlo přečíst vysvětlení.
S nastavením „omezit pohyb“ v systému se nic samo neposouvá.

**Odměny** (každá má jeden smysl, přehled je na stránce Jak hrát)
- **Karta panovníka** – hra o kartu; odemkne kroniku a roky vlády.
- **Koruna učenosti** bronzová / stříbrná / zlatá – za 1/3, 2/3 a všechny různé otázky panovníka zodpovězené správně v jakémkoli režimu.
- **Zlatá karta** – z mistrovského kola.
- **Hodnost** podle podílu sbírky: panoš → rytíř → šlechtic → Pán / Paní erbovní knihy.
- **Díly erbu** – koruny učenosti odemykají vzácnější tvary štítu, barvy a figury.
- **Série 🔥** – Denní výzva dny v řadě, Kdo vládl dřív? trefy za sebou.

**Můj erb** (`/muj-erb`) – editor vlastního erbu (vše vlastní SVG): tvar štítu, dělení, barvy podle
**pravidla tinktur** (kov na barvu, barva na kov – editor vysvětlí proč), figura (lev, orlice, koruna,
věž, lilie…) a heslo pod štítem (s filtrem sprostých slov). Základní díly hned, další za bronzové,
stříbrné a zlaté koruny učenosti, nejvzácnější (hermelín, královský štít) za zlato u všech panovníků.
Erb se ukazuje vedle přezdívky v žebříčcích (na server jdou jen parametry), dá se stáhnout jako PNG
a sdílet odkazem (`/erb?…`) s výzvou „Vytvoř si vlastní erb“.

**Bez registrace**
- Postup (sbírka, koruny, výzva, série, erb) je v prohlížeči (localStorage, verzovaná data čtená defenzivně).
- Do žebříčků stačí **přezdívka** (3–16 znaků, filtr sprostých a urážlivých slov v češtině, unikátní).
  Hráče pozná server podle náhodného anonymního tokenu; v databázi je jen jeho otisk (SHA-256).
- **Přenos na jiné zařízení** krátkým kódem `ABCD-EFGH` (platí 30 minut, jen jednou), postup se sloučí.
- **Kronika** panovníka (oddíly, „Věděli jste, že…“, zdroje) se odemkne se získanou kartou.
- „🪙 Hoď kronikáři groš“ (dobrovolná podpora) jen po dohrání hry a na stránce Jak hrát.

Pravidla pro hráče jsou na stránce [/jak-hrat](https://cesky-kral.up.railway.app/jak-hrat);
čísla na ní se berou přímo z herních konstant v kódu.

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
    page.tsx           úvod: Začni hrát, Denní výzva, Řeka času, Kdo vládl dřív?, galerie
    kral/[slug]/       hra o kartu, zlate-kolo/ (mistrovské kolo), vlastní OG náhled
    vyzva/ rychlovka/ kdo-driv/ reka-casu/ zebricky/ sbirka/ jak-hrat/ zdroje/
    muj-erb/ erb/      editor erbu a sdílený erb
    api/               JSON API: hráč, přezdívka, erb, Denní výzva, hry, žebříčky, přenos
    actions/           server actions: checkAnswer, checkWhoFirst
  components/          UI komponenty (quiz, karty, oslavy, kronika, hlavička…)
    ui/                shadcn komponenty
  lib/                 herní pravidla, dotazy do DB, localStorage úložiště, sdílení
  proxy.ts             skutečné HTTP 404 pro neexistující panovníky a neplatné odkazy na erb
prisma/
  schema.prisma        King, Question, Answer, Player, DailyAttempt, GameSession, TransferCode
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
- „Kdo vládl dřív?“ a Řeka času posílají panovníky bez roků; roky vrací server až po odpovědi.

## Skóre jen ze serveru (žebříčky)

- Prohlížeč **nikdy neposílá skóre**. Server sám vybere otázky, dvojice i panovníky, uloží je k pokusu
  (`DailyAttempt`, `GameSession`) a přijme jen další krok v pořadí – ID otázky a odpovědi, volbu nebo pořadí.
  Pole jako `score`, `marks` nebo `durationMs` v požadavku ignoruje (testy to ověřují podvrženými požadavky).
- Zápis kroku je atomický (dvojklik ani opakované odeslání se nezapočte dvakrát), Denní výzva má jeden pokus
  na hráče a den (unikátní index), čas měří server.
- API (`/api/...`) přijímá jen JSON s limitem velikosti, každé pole validuje a má **rate limit** podle IP.
- Leaderboard dotazy jsou parametrizované; přezdívky a hesla erbů procházejí filtrem a vykreslují se jen jako text.
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

Mimo jiné hlídají: podvržené skóre a opakované odpovědi (`leaderboards.spec.ts`, `game-boards.spec.ts`),
filtr přezdívek, rate limit, přenos kódem, editor erbu se zámky a pravidlem tinktur (`crest.spec.ts`),
přístupnost kvízu, hlavičku na 14 šířkách displeje a ověřená historická fakta.

Varianty: jeden soubor `npm run test:e2e -- e2e/king-round.spec.ts`, jen mobil
`npm run test:e2e -- --project=mobile`, bez nového buildu `E2E_SKIP_BUILD=1 npm run test:e2e`.

**GitHub Actions** (`.github/workflows/e2e.yml`) spouští u každého pull requestu do `dev` i `main`
lint, build, migrace + seed dočasné Postgres databáze a všechny E2E testy. Při chybě je report
ke stažení v záložce **Actions** jako artefakt `playwright-report`.
