# Průběh práce – erb viditelně (PR „Erb všude“)

Aktualizováno: 2026-11-09 21:50 (Praha). STOP pravidlo: v 6:00 práci ukončit.
Větev `feat/crest-visible` z dev (PR #39–#43 už v dev). PR: #44 (CI běží).

## Kroky
1. ✅ Odemykání i za karty (klíč 1, zaoblený štít 3, dělený 6 karet); oslava karty / koruny ukáže nové díly + „Ozdobit erb“.
2. ✅ Karta „Tvůj erb“ na úvodu u hodnosti a nahoře v Moje sbírka (přezdívka, X z Y dílů).
3. ✅ Hlavička: položka Erb (ověřit šířky).
4. ✅ Sdílení výsledku s odkazem na erb (Denní výzva, Rychlovka).
5. ✅ Jak hrát: odměny (+ Dnešní vládce), sekce Erb, Žebříčky a přezdívka, FAQ.
6. ✅ Celá sada 340 + oprava testu žebříčku (plná místní DB); PR vytvořen.

## Poznámky pro obnovení
- `service postgresql start`; build s `NEXT_PUBLIC_KOFI_URL=https://ko-fi.com/cesky-kral-test`; `E2E_SKIP_BUILD=1 npm run test:e2e`.
