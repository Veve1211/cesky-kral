# Český král

Webová kvízová hra o českých dějinách – „Sbírej české panovníky“.

## Testy (Playwright, E2E)

Automatické testy proklikají hru v prohlížeči jako hráč – na počítači i na mobilu (iPhone 13).
Běží proti produkčnímu buildu aplikace a **samostatné testovací databázi** naplněné seedem.
Správné odpovědi znají testy přímo ze seedu (`prisma/seed-data.ts`), takže umí vyhrát i prohrát.

1. Připrav prázdnou PostgreSQL databázi, jejíž název obsahuje `test` (např. `cesky_kral_test`).
2. Do `.env.local` přidej její adresu:

   ```
   E2E_DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cesky_kral_test"
   ```

3. Prohlížeč pro testy (jen poprvé, v cloud prostředí Claude Code není potřeba):

   ```bash
   npx playwright install chromium
   ```

4. Spusť testy (sestaví aplikaci, nahraje do testovací DB migrace + seed a spustí testy):

   ```bash
   npm run test:e2e
   ```

Užitečné varianty:

- jen jeden soubor: `npm run test:e2e -- e2e/king-round.spec.ts`
- jen mobil: `npm run test:e2e -- --project=mobile`
- bez nového buildu (už sestaveno): `E2E_SKIP_BUILD=1 npm run test:e2e`

Na GitHubu se testy spouštějí automaticky u každého pull requestu do `dev` i do `main`
(`.github/workflows/e2e.yml`). Když něco selže, report je ke stažení v záložce
**Actions** jako artefakt `playwright-report`.
