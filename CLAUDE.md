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
- Auth: žádné účty; anonymní hráč = náhodný token v prohlížeči (`cesky-kral:player`), server ukládá jen jeho SHA-256
- Hosting: Railway, dvě prostředí, každé s vlastní databází:
  - větev `dev` = staging (testovací web): https://cesky-kral-staging.up.railway.app
  - větev `main` = ostrý web: https://cesky-kral.up.railway.app
- Prostředí: Claude Code na webu (claude.ai/code), bez Dockeru

## Herní logika
- Každý král má 9 otázek: 3 lehké, 3 střední, 3 těžké (seed to validuje). Každá otázka má přesně 3 odpovědi, z toho 1 správnou.
- Kolo o krále = 5 otázek: 2 lehké, 2 střední, 1 těžká, v tomto pořadí, v rámci úrovně náhodně (`ROUND_PLAN`).
- U otázky štítek obtížnosti: 1–3 korunky.
- Na začátku hry o krále i rychlovky zdobný štítek „⚔️ Rytířský slib: Odlož AI i internet. Králové vše vidí. 👁️“.
- Po odpovědi hned ukaž správně/špatně + jednu větu vysvětlení.
- 4 a více správně z 5 = král se přidá do sbírky. Hlavní oslava hry (`card-celebration`, modální, na celou obrazovku): při prvním získání karta přiletí a otočí se lícem, velké jméno, věta kronikáře, velký ohňostroj (7 ran, větší než bronz 4 a stříbro 6, menší než zlatá koruna 8); při opakované výhře menší oslava bez ohňostroje („Karta znovu obhájena“). Tlačítka Pokračovat a Zobrazit ve sbírce. Pořadí slávy: zlatá koruna > karta > stříbro > bronz.
- Oslavy nikdy přes sebe – fronta v `quiz`: v kole o kartu se koruna získaná během kola ukáže až na konci, nejdřív karta, po Pokračovat koruna (jen nejvyšší dosažená); v ostatních režimech koruna hned po odpovědi. Pokračovat vrací fokus na Další otázku / nadpis výsledku.
- Mistrovské kolo (dříve „zlaté kolo“, URL zůstává `/kral/[slug]/zlate-kolo`): jen pro panovníka ve sbírce; všechny jeho těžké otázky v náhodném pořadí; všechny správně = zlatá karta (zlatý třpytivý rám všude). Tlačítko „✨ Mistrovské kolo“ na kartě, v Moje sbírka i na stránce panovníka.
- Rychlovka: 10 náhodných otázek napříč králi, seřazených od lehkých po těžké; vybírá a boduje server (`GameSession`, `/api/game/…`), před hrou „Tvůj osobní rekord“, po hře osobní rekord / „Nový osobní rekord!“ + žebříček (`GameFinish`); bez serveru se hraje bez zápisu. Po konci tlačítko Sdílet (stejný `ShareButton` jako u výzvy): „Český král 👑 Rychlovka 8/10“ + řádek 👑/⚔️ + adresa; bez otázek a odpovědí.
- Denní výzva (`/vyzva`, menší tmavé tlačítko na úvodu pod „Začni hrát“): 5 otázek (2 lehké, 2 střední, 1 těžká, každá od jiného panovníka), pro všechny stejné – vybrané deterministicky podle data v Europe/Prague (`pickDailyQuestions`, podle slug + textu otázky, ne id), nová o půlnoci. Nahoře pravidla (stejné otázky, jeden pokus, nová o půlnoci) + odpočet. Skóre počítá jen server: `/api/daily/start` (založí pokus, čas běží), `/api/daily/answer` (jen další otázka v pořadí, čte jen token/datum/id; atomicky `answered`), `DailyAttempt` unikátní hráč+den. Odpovědi z doby bez serveru se počítají jako špatné (`offlineAnswered`). Server nedostupný = hraje se bez žebříčku. Prohlížeč dál ukládá postup a sérii (localStorage `cesky-kral:daily`, `{ version: 1, date, marks, streak, lastCompleted }`). Výsledek: skóre, 👑/⚔️, série 🔥, pořadí („Tvoje pořadí: 3. z 25“ / „Jsi Dnešní vládce!“ / bez přezdívky „Patřilo by ti …“ + formulář) a co chybělo na lepší místo (`gapText`), odpočet, Sdílet: „Český král – výzva 8. 11. 4/5 👑👑👑👑⚔️“ (+ „🔥 N dny“ od 2 dnů, + „🏆 N. místo z M“ v žebříčku) + odkaz. Dnešní žebříček (top 10, počet správných, při shodě kratší čas, pak dřívější dojezd) pod hrou; 1. místo velké jako „Dnešní vládce“ (`TodayRulerCard`) na /vyzva i na úvodu.
- /jak-hrat: 5 očíslovaných kroků (cíl, jak získáš panovníka, režimy, sbírka a kronika, odkud jsou fakta), Přehled odměn (karta, koruna, zlatá karta, hodnost, díly erbu, Dnešní vládce, série), Tvůj erb (pravidlo tinktur + tabulka odemykání `unlockTable`), Žebříčky a přezdívka (co se ukládá), 5 častých otázek (details/summary), tlačítko „Hrát“ → /; čísla bere z `game-rules.ts` a `daily.ts`; odkaz i v patičce.
- „🪙 Hoď kronikáři groš“ – `KofiButton` (kartička „Baví tě hra? Hoď kronikáři groš a pomůžeš mu psát další kapitoly.“): na stránce nejvýš jedno tlačítko – úvod jednou úplně dole pod odkazy, po dohrání každého režimu (hra o kartu, mistrovské kolo, Rychlovka, Denní výzva, Kdo vládl dřív?, Řeka času), konec /jak-hrat, na oslavě karty a koruny pod Pokračovat (`variant="subtle"`; když je oslava otevřená, kartička stránky `.kofi-page` se skryje); nikdy v hlavičce ani během otázky. V patičce všech stránek malý odkaz „🪙 Hoď groš“ (`kofi-footer-link`, nepočítá se). Zelená `--grosh` #1e5b3c se zlatým rámečkem (pergamenový text 7 : 1). Jen když je `NEXT_PUBLIC_KOFI_URL` https://ko-fi.com/… (`src/lib/kofi.ts`), jinak nic; obyčejný odkaz do nového okna, žádná vyskakovací okna. Proměnná se čte při buildu → po změně na Railway nasadit znovu. Na ostrém webu zatím nenastavená; testovací build (Playwright i CI) má falešnou adresu `e2e/helpers/kofi.ts`; test `e2e/kofi.spec.ts`.
- Koruny učenosti (ne „zlaté kolo“ / „zlatá karta“): u každého panovníka bronzová / stříbrná / zlatá koruna učenosti po 1/3, 2/3 a všech jeho otázkách zodpovězených správně (různých, v libovolném režimu s otázkami – hra o kartu, zlaté kolo, Rychlovka, Denní výzva; při 9 otázkách 3, 6, 9; prahy podle skutečného počtu otázek, `src/lib/mastery.ts`). `checkAnswer` vrací `ruler` (slug, jméno, `questionKey` = stabilní hash slug + textu otázky, ne id; počet otázek). Hned po odpovědi, která stupeň dá, oslavná obrazovka (`tier-celebration`, modální dialog: ohňostroj v barvách stupně přes celou obrazovku (`fireworks`, čisté CSS, bronz 4 / stříbro 6 / zlato 8 ran, zlato i barevné jiskry, opakuje se; při `prefers-reduced-motion` vypnutý), koruna se snese na hlavu, záře a třpyt v barvě stupně, zlato nejvíc – paprsky, víc třpytu, lesk; jméno, název stupně, věta kronikáře, „Pokračovat“ vrátí fokus na Další otázku); každý stupeň jen jednou. Koruna (`tier-crown`) na portrétu v kartě (galerie, Moje sbírka) i v kronice. Uloženo v prohlížeči jako sbírka: localStorage `cesky-kral:mastery`, `{ version: 1, kings: { [slug]: { known: string[], tier } } }` (`src/lib/mastery-progress.ts`); stupeň se nikdy neodebere.
- Hodnosti podle podílu získaných panovníků: panoš → rytíř → šlechtic → Pán / Paní erbovní knihy (všichni; dříve „Český král / Česká královna“ – pletlo se s názvem hry).
- Odměny (každá jeden smysl, přehled „Přehled odměn“ na /jak-hrat: co to je + jak ji získám): karta panovníka (hra o kartu) · koruna učenosti bronz/stříbro/zlato (znalost otázek) · zlatá karta (mistrovské kolo) · hodnost (podíl sbírky) · série 🔥.
- Úniky odpovědí: správná odpověď nesmí být čitelná ze jména panovníka (test `e2e/answer-leaks.spec.ts`); popis (`KingBio`) a dynastie se na /kral ukazují až po získání karty (jako roky); popis pro sdílení bez `shortBio`. Robotům sociálních sítí posílá Next metadata v `<head>`, prohlížečům je streamuje (proto je popis i patička ve zdroji „níž“) – test v `share-preview.spec.ts`.
- Pověstné postavy (`isLegend`): štítek „Pověst“ na kartě i ve hře, ve hře věta „Otázky jsou o pověsti, ne o doložené historii.“, roky se nezobrazují.
- Na kartě se zobrazuje titul (kníže / kněžna / král / královna).
- Postup hráče se ukládá v prohlížeči (localStorage), bez účtů. Přezdívka (3–16 znaků, `checkNickname` + `containsProfanity` v `src/lib/profanity.ts`, unikátní podle `nicknameKey` bez diakritiky a mezer) jen pro žebříčky. Přenos na jiné zařízení: v Moje sbírka kód 8 znaků (`ABCD-EFGH`, 30 min, jednou), přenese token, sbírku, koruny, výzvu a nejlepší sérii; sloučí se (nic se neztratí). Jak hrát: sekce „Co se ukládá“.
- API (`src/app/api/…`, JSON, `src/lib/api.ts`): rate limit v paměti podle IP (`src/lib/rate-limit.ts`, poslední položka X-Forwarded-For); v E2E testech má localhost výjimku `E2E_RATE_LIMIT_LOOPBACK_EXEMPT=1` (nikdy v produkci).
- /sbirka „Moje sbírka“: hodnost + „Ve sbírce: X z N“ + „✨ Zlatých: Y z N“, získaní (klik = kronika), „Ještě chybí“ (siluety, Hrát o kartu); prázdný stav s tlačítkem na prvního panovníka. Hlavička: „Moje sbírka“ → /sbirka, ⏳ → /kdo-driv, Rychlovka → /rychlovka, 🏆 Žebříčky → /zebricky, 🛡️ Můj erb → /muj-erb, „Jak hrát“ → /jak-hrat; pod `lg` (1024 px) všechny položky jen ikonou, od `lg` všechny ikona + text; pod 360 px užší okraje ikon (cíl ≥ 24 px, WCAG 2.5.8); každý odkaz má aria-label, aktivní `aria-current="page"`; logo → /. Pod 460 px menší logo a odsazení; vše na jednom řádku od 320 px i s náhradním písmem (`display: optional`); když se nevejde (větší písmo), menu přejde na druhý řádek (`flex-wrap`), logo se nikdy neusekne; test `e2e/header-layout.spec.ts`.
- Kdo vládl dřív? (`/kdo-driv`): dvě náhodné karty (bez pověstí), roky skryté; klik na toho, kdo začal vládnout dřív (`reignFrom`). Plná hra: dvojice vybírá a sérii počítá server (`/api/game`), okénko na úvodu dál přes server action `checkWhoFirst`. Správně = pulznutí, roky, série +1 🔥, Další; špatně = zatřesení, roky, konec, skóre + nejlepší série (localStorage `cesky-kral:who-first`, `{ version: 1, best }`). Stejná dvojice nikdy dvakrát po sobě. V hlavičce jen ikona ⏳ (aria-label).
- Řeka času – hra (`/reka-casu`, `TimelineGame`): 4 panovníci bez roků, klepáním je očísluješ od nejdřívějšího, „Ověřit pořadí“; server vybírá a kontroluje (shoda roku = obojí správně), správné kolo +1, chyba = konec, pak roky ve správném pořadí. Odkaz pod Řekou času na úvodu.
- Automatický posun: po správné odpovědi (kvízy, Kdo vládl dřív?, Řeka času) další otázka/dvojice/kolo za 1,2 s (`AUTO_ADVANCE_MS`, pruh v tlačítku Další); chybná odpověď v kvízu čeká na Další (vysvětlení); při `prefers-reduced-motion` nic samo nenaskočí.
- Žebříčky (`/zebricky`, v hlavičce 🏆): Dnešní vládce + Kdo vládl dřív?, Řeka času, Rychlovka – „Tento týden“ (od pondělí 0:00 Praha) / „Celkově“, nejlepší výsledek každého hráče s přezdívkou; při shodě Rychlovka kratší čas, jinak dřívější.
- Můj erb (`/muj-erb`, `CrestEditor`; logika `src/lib/heraldry.ts`, kresba `crest-svg.tsx` – vlastní SVG): tvar (6), dělení (8), tinktury (zlato, stříbro, červená, modrá, černá, zelená, purpur, hermelín), figura (11 + bez), heslo ≤ 32 znaků s filtrem. Pravidlo tinktur: hlava a lem na poli i figura na poli kov × barva (hermelín ke všemu); dělení (polcený, dělený, …) libovolné dvě různé; figura přes dělení kov+barva libovolná; porušení = volba aria-disabled, klepnutí vysvětlí proč. Zámky `UNLOCKS` podle počtu karet (klíč 1, zaoblený štít 3, dělený 6) a panovníků s bronz/stříbro/zlato korunou, nejvzácnější (hermelín, královský štít) = zlato u všech; 33 dílů; zamčené ukazují „🔒 3× zlato“ a po klepnutí celý text. Uloženo: localStorage `cesky-kral:crest` `{ version: 1, design }` + `Player.crest` (`/api/player/crest`, jen parametry, `parseCrest`). Vedle přezdívky v žebříčcích (`NicknameWithCrest`). Sdílení: PNG (canvas, `crest-png.ts`) a odkaz `/erb?s=&d=&t=&c=&m=` (neplatný = 404 v `proxy.ts`) s „Vytvoř si vlastní erb“. Karta „Tvůj erb“ (`MyCrestCard`: bez erbu výzva s ukázkovým štítem, s erbem erb + přezdívka + „Odemčeno X z 33 dílů“) na úvodu hned pod hodností a nahoře v Moje sbírka; v hlavičce „Můj erb“ (štít); oslava karty i koruny ukáže „Nový díl erbu odemčen: …“ + „Ozdobit erb“ (`newlyUnlocked`, `unlockedBy`; `checkAnswer` vrací `rulerCount`); sdílení výsledku Denní výzvy a Rychlovky má zaškrtávátko „Sdílet i můj erb“; přenos kódem nese i erb.
- Řeka času (`ReignTimeline`, jedna komponenta): podle `reignFrom`, pověsti první se štítkem Pověst. Získaný = malý portrét + jméno + roky (zlatá karta = zlatý rám), klik = kronika; nezískaní jen jako řádek „X panovníků čeká na objevení“ (bez jmen, odkazů a pořadí). Naposledy získaný má štítek „Nový“ (`new-badge`, v aria-label „nově získaný“), dokud ho hráč v Řece času jednou neuvidí (localStorage `cesky-kral:timeline-seen`, `{ version: 1, slug }`; `src/lib/timeline-new.ts`). `full` na /sbirka (mobil svisle, od `lg` vodorovně), `compact` na / (vodorovný pruh, posouvá se jen pruh).
- Úvodní stránka (shora): malá hodnost `RankPill` („Postup sbírky“, odkaz na /sbirka) → nadpis + jedna věta o hře → hlavní zlaté tlačítko `StartButton` (nový hráč „Začni hrát“ → první panovník; vracející se „Pokračuj“ → další nezískaný podle pořadí, pak první bez zlaté karty do mistrovského kola, nakonec Rychlovka; logika `src/lib/next-step.ts`) + pod ním malý textový odkaz Denní výzvy se stavem (`DailyHomeButton`) → Řeka času (`compact`, bez nadpisu a popisu; prstem se posune a po puštění se vrátí, `useSpringBack`, jen dotyk) → galerie → dole `HomeMoreLinks` (malý znak erbu → /muj-erb, „⏳ Kdo vládl dřív?“ → /kdo-driv) → groš. Na úvodu není karta erbu, hra Kdo vládl dřív?, Dnešní vládce ani Rychlovka (vše v hlavičce / na vlastních stránkách). Data jedním dotazem (`cache`).
- Kronika panovníka: po otočení vyhrané karty tlačítko „📜 Přečíst kroniku“; v galerii klik na získanou kartu otevře kroniku (dialog, na mobilu přes celou obrazovku), nezískaná karta: „Kronika se odemkne, až panovníka získáš.“ Bez kroniky = nic se nezobrazí. Kronika = oddíly (nadpis + text, iniciála jen u prvního, mezi nimi oddělovač), bez oddílů úvod (`chronicleIntro`); pak „Věděli jste, že…“ a zdroje. Nadpis „Kronika: …“ a zavřít zůstávají nahoře, posouvá se jen obsah.

## Datový model
- King: name, slug, reignFrom?, reignTo? (prázdné u pověstí), title (kníže/kněžna/král/královna, CHECK v DB), isLegend, dynasty, shortBio, imageUrl?, order, chronicleIntro (""), chronicleFacts (text[]), chronicleSources (JSON `[{label, url}]`, CHECK pole), chronicleSections (JSON `[{heading, text}]`, výchozí [], CHECK pole)
- Question: kingId, text, explanation, sourceUrl, difficulty (1 lehká, 2 střední, 3 těžká; CHECK 1–3 v DB)
- Answer: questionId, text, isCorrect
- Player: tokenHash (unikátní), nickname?, nicknameKey? (unikátní); DailyAttempt: playerId+date (unikátní), marks, answered, score, startedAt, finishedAt?, durationMs? (CHECK počty); TransferCode: codeHash, payload (JSON), expiresAt; Player.crest? (JSON parametry erbu, CHECK objekt); GameSession: publicId (náhodné), playerId, mode (quick/who-first/timeline, CHECK), state (JSON: id otázek / panovníci), answered, score, finishedAt?, durationMs?
- Obsah se nahrává přes Prisma seed (prisma/seed.ts); kroniky v `prisma/chronicles.ts` (podle slug, chybějící král se přeskočí).

## Pravidla

### Obsah
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

## Struktura projektu
- Next.js 16 (App Router, `src/`, Cache Components zapnuté), Tailwind 4, Prisma 7
- `src/app/` – stránky: `page.tsx` (galerie /), `kral/[slug]/` (hra), `kral/[slug]/zlate-kolo/` (zlaté kolo), `rychlovka/`, `vyzva/` (Denní výzva), `kdo-driv/` (Kdo vládl dřív?), `sbirka/` (Moje sbírka), `zdroje/` (licence obrázků a písem), `jak-hrat/` (pravidla), `not-found.tsx`, `layout.tsx` (fonty, hlavička, metadata), `opengraph-image.tsx` (náhled pro sdílení; `kral/[slug]/opengraph-image.tsx` = vlastní náhled panovníka: portrét, jméno, titul, bez roků), `globals.css` (barvy, pergamen, animace)
- `src/app/actions/quiz.ts` – server action `checkAnswer` (jádro `src/lib/answer-check.ts`); `actions/who-first.ts` – `checkWhoFirst`
- `src/components/` – `site-header`, `site-nav` (navigace, aktivní odkaz; klient v Suspense), `king-card`, `king-portrait` (zlatý rám, silueta), `crest` (erb s iniciálou = placeholder), `ornaments` (rohy, oddělovač, koruna), `illuminated-initial` (písmeno přes CSS `::before`, v DOM textu jen jednou), `royal-celebration`, `legend-badge` (Pověst), `difficulty-badge` (korunky), `knight-oath` (rytířský slib), `quiz` (hra + výsledky + otočení karty, klient), `collection-gallery` (galerie /, klient), `collection-summary` (`useCollectionSummary`, `CollectionStatus`, `GoldenCount`, `KingGrid` – sdílí galerie i /sbirka), `my-collection` (/sbirka, klient), `chronicle-dialog` (kronika, klient), `golden-badge` (Zlatá karta), `golden-round-button` (tlačítko mistrovského kola + zlatý rám hlavičky panovníka, klient), `reign-timeline` (Řeka času jen se získanými + „X panovníků čeká na objevení“, klient), `king-reign-line` (roky na /kral podle sbírky, klient), `new-badge` (štítek Nový), `tier-crown` (koruna učenosti), `tier-celebration` (oslava nového stupně), `fireworks` (ohňostroj oslavy, úroveň 1–3 nebo `card`), `card-celebration` (oslava získané karty), `kofi-button` (Hoď kronikáři groš, jedna kartička), `start-button` (Začni hrát / Pokračuj), `daily-challenge` (Denní výzva: hra, výsledek, odpočet, klient), `daily-home-button` (menší tlačítko výzvy na úvodu, klient), `share-button` (Sdílet), `daily-countdown`, `daily-standing` (pořadí po výzvě), `daily-leaderboard` (žebříček + `TodayRulerCard`), `nickname-form`, `player-panel` (přezdívka + přenos na /sbirka), `quick-game` (Rychlovka se serverem), `timeline-game` (Řeka času), `game-board` (`GameBoard` týden/celkem, `BoardList`), `game-finish` (rekord + žebříček po hře), `crest-svg`, `crest-editor`, `my-crest-card`, `nickname-with-crest`, `who-first-game` (Kdo vládl dřív?, `full` / `teaser`, klient)
- `src/components/ui/` – shadcn komponenty (button, card, progress, dialog)
- `src/lib/` – `utils.ts` (cn), `game-rules.ts` (konstanty, `getRank`), `prisma.ts` (klient s adapterem pg), `kings.ts` (dotazy na krále), `questions.ts` (otázky bez správnosti, míchání, `getGoldenQuestions`), `quiz-types.ts`, `collection.ts` (sbírka + zlaté karty v localStorage, verze 2, `useCollectionReady`), `slug.ts`, `king-initial.ts`, `king-image.ts` (povolené cesty obrázků), `king-display.ts` (titul, roky, text o pověsti), `chronicle.ts` (typ + bezpečné čtení kroniky a oddílů), `who-first.ts` (typy, `pickPair`), `who-first-best.ts` (nejlepší série v localStorage), `timeline-new.ts` (štítek Nový v Řece času), `daily.ts` (den v českém čase, výběr otázek, odpočet, text sdílení – sdílí server, klient i testy), `daily-progress.ts` (výzva a série v localStorage), `share-text.ts` (texty ke sdílení, řádek 👑/⚔️), `kofi.ts` (ověřená adresa Ko-fi z proměnné), `next-step.ts` (kam vede Začni hrát / Pokračuj), `mastery.ts` (koruny učenosti: prahy, názvy, `questionKey`), `mastery-progress.ts` (koruny v localStorage), `player.ts` (token v prohlížeči, `postJson`), `player-server.ts`, `daily-server.ts` (skórování a žebříček výzvy), `leaderboard.ts` (`gapText`, `formatDuration`), `nickname.ts`, `profanity.ts`, `rate-limit.ts`, `api.ts`, `transfer-code.ts`, `transfer-server.ts`, `games.ts` (režimy, `isChronological`), `game-server.ts` (sezení, odpovědi, žebříčky), `game-client.ts`, `auto-advance.ts`, `heraldry.ts` (erb: díly, pravidlo tinktur, zámky, odkaz), `crest-progress.ts`, `crest-png.ts`, `image-credits.ts`
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

- Historický obsah: ověřené opravy a zdroje v `docs/historical-content.md`; regrese `e2e/historical-content.spec.ts` hlídá fakta, zdroje a všech 162 otázek; `e2e/new-rulers.spec.ts` dávku 6.

- Přístupnost kvízu: po změně otázky a výsledku fokus na nadpis (s pořadím/skóre pro čtečky), bez dalšího kroku v tabulátoru; regrese `e2e/quiz-accessibility.spec.ts`. Velké nadpisy na pergamenu používají `gilt-text gilt-text-ink` (WCAG AA ≥ 3 : 1), světlé zlato zůstává na tmavém pozadí.

- Stabilita a 404: `e2e/loading-and-not-found.spec.ts` kontroluje pozdní načtení písem na úvodu, ve sbírce a ve hře; GET/HEAD 404 obou herních URL a HTTP 200 pro všech 18 panovníků i zlatá kola.

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
- 2026-11-08: štítek „Nový“ v Řece času: naposledy získaný = poslední v pořadí sbírky; „viděno“ = zastávka aspoň z 60 % na obrazovce, štítek vydrží do konce návštěvy, zmizí při další; v pruhu na / se zastávka sama posune do zorného pole; test `e2e/timeline-new.spec.ts`
- 2026-11-08: Denní výzva – den a otázky určuje server (Europe/Prague) při každém požadavku; výběr nezávisí na id (seed je mění), jen na datu a obsahu; série se prodlouží jen dohráním; „hrát jednou“ hlídá jen prohlížeč (stejně jako sbírka); v hlavičce zatím bez odkazu (vstup je hlavní tlačítko na úvodu); test `e2e/daily.spec.ts`
- 2026-11-09: koruny učenosti – vlastní klíč v localStorage vedle sbírky (stejný způsob ukládání, sbírka v2 beze změny); otázka se počítá podle stabilního klíče (id se mění se seedem); oslava se uloží spolu s odpovědí, takže po obnovení stránky už nepřijde; E2E pomocník `settleAnswer` / `dismissCelebration` zavírá oslavu ve starších testech; test `e2e/knowledge-crowns.spec.ts`
- 2026-11-09: panovníci podle doby (order 1–18): Libuše, Svatý Václav, Vratislav II., Přemysl Otakar I., Přemysl Otakar II., Václav II., Jan Lucemburský, Karel IV., Václav IV., Jiří z Poděbrad, Vladislav II. Jagellonský, Ferdinand I., Rudolf II., Fridrich Falcký, Marie Terezie, Josef II., František Josef I., Karel I.; dávka 6 (6 nových) na pokyn uživatele s ověřením v české Wikipedii, zatím bez obrázků a kronik
- 2026-11-09: v kole o kartu se koruna učenosti ukazuje až po oslavě karty na konci kola (pravidlo „nikdy dvě oslavy přes sebe, nejdřív karta“), uloží se ale hned po odpovědi; E2E pomocník `dismissAllCelebrations` projde frontu oslav

- 2026-11-09: opravy po recenzi – ozdobná iniciála jen přes CSS `::before` (čtečka i vyhledávač čtou slovo jednou, test `e2e/illuminated-initials.spec.ts`); Řeka času „X panovníků čeká na objevení“; každý panovník má vlastní Open Graph titulek, popis a obrázek (`sharp` převádí webp na PNG, bez roků vlády; test `e2e/share-preview.spec.ts`); kroniky dávky 6 jen z článků cs.wikipedia; Karel I. = jako český král Karel III. (cs.wikipedia); portréty dávky 6 = volná díla z Commons (Vratislav II. nástěnná malba Znojmo ~1134, Václav IV. Bible Václava IV., Vladislav II. malba ve Svatováclavské kapli 1509 (PD-Art; fotka téže malby na Commons je CC BY-SA, nepoužita), Ferdinand I. H. Bocksberger, Fridrich Falcký G. van Honthorst 1634, František Josef I. foto C. Pietzner 1910); vlastní kresby nebyly potřeba; test `e2e/rulers-complete.spec.ts` hlídá portrét, kredit a kroniku u všech 18

## Údržba tohoto souboru
- Aktualizuj po každé strukturální změně, novém pravidlu nebo rozhodnutí
- Maximální stručnost
- 2026-11-09: úvod má jedno hlavní tlačítko Začni hrát / Pokračuj, Denní výzva je druhá volba; groš jen po dohrání hry a na Jak hrát; hlavička: pod `md` jen ikony, od `md` ikona + text; „zlaté kolo“ → „Mistrovské kolo“ (zlaté zůstává jen pro zlatou kartu), nejvyšší hodnost „Pán / Paní erbovní knihy“ (ne název hry); přehled odměn na Jak hrát
- 2026-11-09: žebříčky bez registrace – anonymní token (jen hash v DB), přezdívka s filtrem; skóre Denní výzvy jen ze serveru (odpovědi v pořadí, jeden pokus, čas od startu na serveru); JSON API místo server actions kvůli přímým testům podvržených požadavků; rate limit v paměti (jedna instance Railway); přenos postupu jednorázovým kódem 30 min; test `e2e/leaderboards.spec.ts`
- 2026-11-09: automatický posun jen po správné odpovědi (chybná čeká kvůli vysvětlení), vypnutý při omezeném pohybu; Rychlovka, Kdo vládl dřív? a nová hra Řeka času bodované serverem v `GameSession` (stav hry drží server, klient posílá jen volbu); týdenní a celkové žebříčky (nejlepší výsledek hráče, SQL `DISTINCT ON`); test `e2e/game-boards.spec.ts`, `e2e/auto-advance.spec.ts`
- 2026-11-09: vlastní erb – zámky jen v prohlížeči (koruny jsou v localStorage, stejně jako sbírka), server ověřuje jen platnost dílů, pravidlo tinktur a heslo; sdílený odkaz nese celý erb v adrese (nic se neukládá); test `e2e/crest.spec.ts`
- 2026-11-09: erb viditelně – karta Tvůj erb na úvodu a ve sbírce, odkaz v hlavičce (6 položek: text až od `lg`), díly i za karty, aby oslava první karty měla „Ozdobit erb“; text „Nový díl erbu odemčen“ (bez rodu, místo „Odemkl jsi“); test `e2e/crest-visible.spec.ts`
- 2026-11-09: sedm otázek, které prozrazovalo jméno panovníka, přepsáno jen z už ověřených faktů (přehled v `docs/historical-content.md`); skóre v žebříčcích her má viditelnou jednotku („17 v řadě“, „5 kol“, „8/10“)
- 2026-11-10: první dojem – na úvodu pod nadpisem jedna věta o hře a hned „Začni hrát“; hlavička hry o kartu kompaktní (portrét vedle jména), nezískaný panovník bez zamčeného tlačítka mistrovského kola; první otázka bez posouvání na mobilu i desktopu (test `e2e/first-impression.spec.ts`); postupné odhalování režimů odloženo po odevzdání (AUDIT.md)
