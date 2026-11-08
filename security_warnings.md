# Security warnings

Living list of known risks. Update with every feature.

- **Route param `/kral/[slug]`**: slug is only used to look up a known king; unknown values return the 404 page. When the DB is connected, query by slug via Prisma (parameterized) – never build raw SQL from it. Note: with streaming (Cache Components) the 404 page is rendered but the HTTP status can be 200.
- **XSS**: all text is rendered through React (auto-escaped). Never use `dangerouslySetInnerHTML` for seed content (questions, explanations).
- **Secrets**: `DATABASE_URL` lives only in `.env.local` (git-ignored, `.env*` in .gitignore). `.env.example` contains placeholders only.
- **imageUrl**: only local paths matching `/kings/<slug>.webp` are rendered (`safeKingImage`); anything else from the DB falls back to the crest. No remote image hosts are allowed in `next.config`.
- **External links** (sources, /zdroje): `target="_blank" rel="noopener noreferrer"`, hard-coded or `https://`-validated URLs only.
- **localStorage progress** (future): data is user-controlled – parse defensively (try/catch, validate shape), never trust it for anything server-side.
- **Seed on every deploy**: `prisma/seed.ts` runs on each `npm start`. It only deletes questions scoped by `kingId` of seeded kings (no unscoped DELETE). Content is validated (slug format, 5 questions, https sources) before any write.
- **Slug lookup**: `getKingBySlug` rejects non-slug input (regex, max length) before querying; Prisma queries are parameterized.
- **Answer correctness**: questions sent to the browser contain only answer `id` + `text` (no `isCorrect`, no explanation). Answers are shuffled on the server (crypto `randomInt`). Correctness is checked by the `checkAnswer` server action.
- **`checkAnswer` input**: both ids must be positive safe integers ≤ INT max, and the answer must belong to the question; otherwise a generic error is returned. Only `correct`, `correctAnswerId`, `explanation` and an `https://` source are returned.
- **Known limitation – cheating**: anyone can call `checkAnswer` repeatedly (no rate limit, no session), and the collection lives in localStorage, so a player can edit it directly. Acceptable for a no-account demo; would need sessions + server-side progress for anything competitive.
- **localStorage parsing**: `collection.ts` wraps all access in try/catch, limits raw size (50 kB), checks `version`, keeps only valid slugs, dedupes and caps the list. Corrupted data falls back to an empty collection.
- **External source links**: rendered only for `https://` URLs with `target="_blank" rel="noopener noreferrer"`.
- **Open Graph `metadataBase`**: taken from `RAILWAY_PUBLIC_DOMAIN` only if it matches a hostname pattern; otherwise localhost (no user input involved).
- **Image licenses**: only public-domain images from Wikimedia Commons, each verified on its file page and listed on /zdroje before use.
- **Question difficulty**: DB CHECK constraint (1–3), seed validates exactly 3+3+3 questions per king and no duplicate texts; server maps any unexpected value to a safe default (`toDifficulty`).
- **King title / legend**: DB CHECK limits `title` to kníže/kněžna/král/královna; app maps unknown values to „král“ (`toKingTitle`). Seed requires years for non-legends and both-or-none for legends.
- **Image licenses**: a file with an unclear license template (e.g. `PD-CzechGov` on a modern photo of a seal) is NOT used – the crest stays instead.
- **Golden round (`/kral/[slug]/zlate-kolo`)**: hard questions are public anyway (same fields as a normal round, no `isCorrect`); correctness is still checked only by `checkAnswer`. The "only for collected kings" gate is client-side (localStorage), so a player can bypass it by editing storage – same accepted limitation as the collection itself. `addGoldenCard` refuses kings not in the collection.
- **localStorage v2 migration**: v1 data is rewritten as v2 only after it parsed successfully (unreadable data is never overwritten by the migration). Golden slugs are validated like king slugs and filtered to a subset of `kings`; raw size limit 100 kB.
- **Chronicle**: text rendered through React only (no HTML). `chronicleSources` is a JSON column (DB CHECK: must be an array); `toChronicle` validates shape, caps item count and keeps only `https:` URLs (parsed with `URL`), so no `javascript:` links. Links use `target="_blank" rel="noopener noreferrer"`. Seed validates non-empty intro/facts and https sources.
- **„Kdo vládl dřív?“ (`checkWhoFirst`)**: all three slugs validated (`isValidSlug`), the two kings must differ and the choice must be one of them; only non-legend kings with `reignFrom` are looked up (parameterized Prisma). Kings are sent to the browser without years; years come back only after answering. Known limitation: years are public elsewhere (gallery), and the action can be called repeatedly – the streak is only a local score, nothing server-side trusts it.
- **Best streak (`cesky-kral:who-first`)**: localStorage read in try/catch, size limit, version check, safe non-negative integer only; anything else counts as 0.

- **E2E tests**: they write to a database (migrations + seed). The URL comes only from `E2E_DATABASE_URL` and the database name must contain `test`, otherwise the run stops – so the tests never touch production. The password in `.github/workflows/e2e.yml` belongs to a throwaway Postgres service inside the CI job (not a secret).
