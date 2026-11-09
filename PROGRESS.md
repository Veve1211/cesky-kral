# Průběh práce (PR 0, A–D)

Aktualizováno: 2026-11-09 20:05 (Praha). STOP pravidlo: v 6:00 práci ukončit.

| Fáze | Větev | PR | Stav |
| --- | --- | --- | --- |
| PR 0 – bezpečnost + README | `chore/security-readme` | #39 | hotovo, testy lokálně zelené (274) |
| PR A – úvod, groš, hlavička, odměny | `feat/home-rewards` (z PR 0) | #40 | hotovo, testy lokálně zelené (280) |
| PR B – žebříčky, Denní výzva, přenos | `feat/leaderboards` (z PR A) | #41 | hotovo, lokálně 297 zelených, CI zelené |
| PR C – plynulé režimy, další žebříčky | `feat/smooth-modes` (z PR B) | #42 | hotovo, lokálně 314 zelených |
| PR D – vlastní erb + README novinky | `feat/crest` (z PR C) | – | kód + testy erbu hotové, README a CLAUDE.md doplněné; běží celá sada |

Pořadí mergování: #39 → #40 → B → C → D (každý je založený na předchozím).

## Další konkrétní krok (PR C)
1. ✅ Automatický posun (commit „feat: auto-advance…“): kvíz po správné odpovědi 1,2 s, Kdo vládl dřív? po správné volbě; vypnuto při „omezit pohyb“; test `e2e/auto-advance.spec.ts`.
2. ✅ GameSession + API + klient: Rychlovka (`quick-game`), Kdo vládl dřív? (sezení na serveru), Řeka času `/reka-casu`, `/zebricky`, odkaz Žebříčky v hlavičce.
3. ✅ Testy `e2e/game-boards.spec.ts`, CLAUDE.md, security_warnings.md.
4. ✅ Celá sada 314 zelených; PR C.

## Další krok (PR D, větev `feat/crest`)
- testy `e2e/crest.spec.ts`, vzhled na mobilu, CLAUDE.md, README s novinkami A–D, celá sada, PR D.

## Poznámky pro obnovení
- Lokální testy: `service postgresql start`, `.env.local` s `E2E_DATABASE_URL` (DB `cesky_kral_test`, uživatel `kral`), build s `NEXT_PUBLIC_KOFI_URL=https://ko-fi.com/cesky-kral-test`, pak `E2E_SKIP_BUILD=1 npm run test:e2e`.
- CI na GitHubu se spouští u PR do dev.
