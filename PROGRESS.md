# Průběh práce – audit (PR 1), první dojem (PR 2), vyleštění (PR 4)

Aktualizováno: 2026-11-10 (Praha). PR 3 (víc otázek) se na pokyn uživatelky nedělá.
STOP pravidlo: v 6:00 práci ukončit. Obnoveno 10. 11. v 9:50 (po 6:00) → otevřen jen PR #47, PR 2 a PR 4 čekají na pokyn „pokračuj“.
10. 11. dopoledne: odevzdání do hodiny – PR 2 jen úvod + první otázka na mobilu, PR 4 jen groš + test + README.
Další krok: počkat na CI #48 a #49; po odevzdání body ⏳ z AUDIT.md.

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
