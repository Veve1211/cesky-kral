# Security warnings

Living list of known risks. Update with every feature.

- **Route param `/kral/[slug]`**: slug is only used to look up a known king; unknown values return the 404 page. When the DB is connected, query by slug via Prisma (parameterized) – never build raw SQL from it. Note: with streaming (Cache Components) the 404 page is rendered but the HTTP status can be 200.
- **XSS**: all text is rendered through React (auto-escaped). Never use `dangerouslySetInnerHTML` for seed content (questions, explanations).
- **Secrets**: `DATABASE_URL` lives only in `.env.local` (git-ignored, `.env*` in .gitignore). `.env.example` contains placeholders only.
- **sourceUrl / imageUrl** (future): validate they are `https://` URLs before rendering as links/images; add `rel="noopener noreferrer"` to external links.
- **localStorage progress** (future): data is user-controlled – parse defensively (try/catch, validate shape), never trust it for anything server-side.
