# Průběh práce (PR 0, A–D)

Aktualizováno: 2026-11-09 18:40 (Praha). STOP pravidlo: v 6:00 práci ukončit.

| Fáze | Větev | PR | Stav |
| --- | --- | --- | --- |
| PR 0 – bezpečnost + README | `chore/security-readme` | #39 | hotovo, testy lokálně zelené (274) |
| PR A – úvod, groš, hlavička, odměny | `feat/home-rewards` (z PR 0) | #40 | hotovo, testy lokálně zelené (280) |
| PR B – žebříčky, Denní výzva, přenos | `feat/leaderboards` (z PR A) | – | kód hotový, běží celá sada testů |
| PR C – plynulé režimy, další žebříčky | `feat/smooth-modes` (z PR B) | – | nezačato |
| PR D – vlastní erb + README novinky | `feat/crest` (z PR C) | – | nezačato |

Pořadí mergování: #39 → #40 → B → C → D (každý je založený na předchozím).

## Další konkrétní krok
1. Dokončit celou sadu testů PR B, zkontrolovat vzhled /vyzva a /sbirka na mobilu, vytvořit PR B („mergovat až po #40“).
2. Založit `feat/smooth-modes` z `feat/leaderboards` a začít PR C (automatický posun po ~1 s, GameSession na serveru, žebříčky týden/celkem pro Kdo vládl dřív?, Řeku času, Rychlovku, osobní rekord).

## Poznámky pro obnovení
- Lokální testy: `service postgresql start`, `.env.local` s `E2E_DATABASE_URL` (DB `cesky_kral_test`, uživatel `kral`), build s `NEXT_PUBLIC_KOFI_URL=https://ko-fi.com/cesky-kral-test`, pak `E2E_SKIP_BUILD=1 npm run test:e2e`.
- CI na GitHubu se spouští u PR do dev.
