# Průběh práce – audit (PR 1), první dojem (PR 2), vyleštění (PR 4)

Aktualizováno: 2026-11-10 (Praha). PR 3 (víc otázek) se na pokyn uživatelky nedělá.
STOP pravidlo: v 6:00 práci ukončit. Obnoveno 10. 11. v 9:50 (po 6:00) → otevřen jen PR #47, PR 2 a PR 4 čekají na pokyn „pokračuj“.
10. 11. dopoledne: odevzdání do hodiny – PR 2 jen úvod + první otázka na mobilu, PR 4 jen groš + test + README.
Další krok: počkat na CI #48 a #49; po odevzdání body ⏳ z AUDIT.md.

## Úvod bez korun (10. 11., větev `fix/home-no-crowns`)
- Koruny učenosti a počet zlatých karet jen v Moje sbírka; galerie i blok hodnosti na úvodu bez nich (úvod = hlavní hra a sbírka, odměny podrobně ve sbírce).

## Odevzdání 10. 11. (rozhodnutí)
- #47 sloučené do dev (uživatelka). CI #48 spadlo na 3 věcech: desktop – první otázka o 38 px pod okrajem (CI má jiná písma), test Pověsti hledal větu na starém místě, test štítku Nový čekal na „zhlédnutí“ Řeky času, která je na mobilu teď o řádek níž. Opraveno: hlavička ještě menší i na desktopu (bez ornamentu, menší mezery), testy upravené (Řeka času se v testu posune na obrazovku – „viděno“ znamená opravdu na obrazovce). Totéž sloučeno do PR 4.
- Kontrola tajných údajů: gitleaks přes celou historii (všechny větve) – nic; jen `.env.example` se zástupnými hodnotami a heslo dočasné testovací DB v CI (`kral:kral@localhost`, není tajné). Bezpečné zveřejnit: ANO.

| Fáze | Větev | PR | Stav |
| --- | --- | --- | --- |
| PR 1 – audit + fakta | `audit/facts` (z dev) | #47 | ✅ hotovo, CI běží |
| PR 2 – první dojem | `feat/first-impression` (z PR 1) | #48 | ✅ zúženo na nejvážnější nálezy (odevzdání dnes) |
| PR 4 – vyleštění + groš (nové zadání) | `chore/final-polish` (z PR 2) | #49 | ✅ groš + test, README, drobné texty |

## Groš v PR 4 (nové zadání uživatelky)
úvod 1× nenápadně dole; po dohrání každého režimu; oslava karty a koruny pod Pokračovat; konec Jak hrát; patička malý odkaz „🪙 Hoď groš“; nikde víc než 1 tlačítko (patička se nepočítá); test.

## Poznámky
- Ověřování: /tmp/claude-0/facts (stažené zdroje, skripty). Blokované hosty: prague.eu, rozhlas.cz (kromě archiv.radio.cz), newworldencyclopedia, novinky, opava-city.

## Přestavba úvodu (10. 11. odpoledne, větev `feat/home-redesign`)
Rozhodnutí (herní design):
- Pořadí: hodnost (malá, hned vidět) → věta + Začni hrát/Pokračuj → Řeka času → galerie → malý erb + „Kdo vládl dřív?“ → groš.
- Denní výzva zůstala jako malý textový odkaz pod hlavním tlačítkem: je to nejsilnější důvod se denně vracet a ukazuje sérii 🔥, ale už nekonkuruje hlavní hře.
- Pryč z úvodu: karta erbu, hra Kdo vládl dřív?, karta Dnešního vládce, tlačítko Rychlovka a odkaz „Hraj Řeku času“ – vše je v hlavičce nebo na vlastních stránkách.
- Řeka času bez nadpisu; po puštění prstu se vrátí na místo (jen dotyk, klávesnice a kolečko myši ji nechají, kde je – kvůli přístupnosti).
- Hodnost je malý štítek s odkazem na Moje sbírku (celý panel zůstává na /sbirka).
- Test serverové akce checkWhoFirst běží nově na /kdo-driv bez herního serveru (náhradní cesta, kterou akce obsluhuje).

## Úvod, 2. kolo (10. 11., větev `feat/home-round2`)
- Hodnost zpět jako výrazný blok (hodnost, „Ve sbírce“, ukazatel, zlaté karty), na mobilu kompaktní, aby Začni hrát zůstalo bez posouvání.
- Menu: Rychlovka, Kdo vládl dřív?, Žebříček, Můj erb, Moje sbírka, Jak hrát, Hoď groš. Hry jsou první, protože jsou nejčastější cíl; groš poslední. Pod 480 px užší okraje ikon, aby se 7 ikon vešlo s logem na řádek.
- „Hoď groš“ v menu je jen odkaz na novou stránku /hod-gros (ne tlačítko Ko-fi). Položka se ukáže jen s nastavenou adresou Ko-fi, aby nevedla do prázdna. Patička teď vede na stejnou stránku.
- Stránka /hod-gros: proč hra je, že je zdarma a bez reklam, na co groš půjde (provoz, další panovníci s ověřenými zdroji), jedno tlačítko.
- Dole na úvodu dvě karty (erb hráče / ukázkový, ⏳ Kdo vládl dřív?) s jednou větou; groš pod nimi jeden.
