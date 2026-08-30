# Local News — Bilingual Local News Portal (Demo)

A demo-first, production-styled local news portal built with **Next.js 15
(App Router) + JavaScript + Tailwind CSS**. English and Hindi are both
first-class languages, and the entire content layer is a single JSON
file — `data/news.json` — that you can hand-edit to publish news, no
code changes required.

> **DEMO CONTENT NOTICE:** every article in `data/news.json` is
> fictional placeholder content written for this demo. Do not present
> it as real reporting. Swap in real, verified stories before using
> this in production.

---

## 1. Tech stack

- Next.js 15 (App Router), React 19, JavaScript only (no TypeScript)
- Tailwind CSS for styling, `lucide-react` for icons
- `next/font/google` for typography — Source Serif 4 / Inter for
  English, Noto Serif Devanagari / Noto Sans Devanagari for Hindi
- Single JSON file as the data source (`data/news.json`) — **no
  database, no auth, no backend** in this version
- Data is only ever read through `lib/news.js`, so the JSON file can be
  swapped for a real API later without touching any page or component
  (see §9)

---

## 2. Local setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

> **A note on this build:** this project was generated in a sandboxed
> environment with no network access, so `npm install` and
> `npm run build` could not be executed here to verify the build.
> Everything has been written and manually reviewed against Next.js 15
> App Router conventions, but **please run `npm run build` yourself
> after installing dependencies** and fix anything your exact
> dependency versions surface before deploying. If you hit an error,
> the most likely culprits are a Next.js/React minor-version mismatch —
> pin the versions in `package.json` if needed.

Optional: set `NEXT_PUBLIC_SITE_URL` in a `.env.local` file to your
real domain so SEO metadata (canonical URLs, sitemap, Open Graph)
points at the right place. It defaults to `http://localhost:3000`.

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 3. Project structure

```
news-portal/
├── app/                     Routes (App Router)
│   ├── page.js              Homepage
│   ├── news/page.js         All news (paginated)
│   ├── news/[slug]/page.js  Article page
│   ├── category/[category]/page.js
│   ├── location/[location]/page.js
│   ├── search/page.js       Client-triggered, server-rendered search
│   ├── hindi/page.js        Shortcut → redirects to "/?lang=hi"
│   ├── admin-preview/page.js  Read-only content stats (see §7)
│   ├── api/news-preview/route.js  Serves the raw JSON (used by admin-preview)
│   ├── sitemap.js, robots.js
│   └── about, contact, editorial-policy, privacy-policy, terms,
│       advertise — placeholder footer pages
├── components/              All UI components (see file headers)
├── lib/
│   ├── news.js               Data access layer — READ THIS FIRST
│   └── i18n.js                Language + translation helpers
├── data/
│   ├── news.json              ← your content lives here
│   └── translations.json      UI chrome strings (buttons, labels)
└── public/images/placeholder.svg   Fallback image
```

---

## 4. How to update daily news

**You only ever need to edit `data/news.json`.** No other file needs
to change for routine content updates.

### Add a new article

Copy an existing article object inside the `"articles"` array and
change its fields:

```json
{
  "id": "21",
  "slug": "unique-url-slug-here",
  "category": "local",
  "location": "meerut",
  "title": { "en": "Headline in English", "hi": "हिंदी में शीर्षक" },
  "summary": { "en": "One or two sentence summary.", "hi": "एक-दो वाक्य का सारांश।" },
  "content": {
    "en": ["Paragraph one.", "Paragraph two.", "Paragraph three."],
    "hi": ["पहला पैराग्राफ।", "दूसरा पैराग्राफ।", "तीसरा पैराग्राफ।"]
  },
  "image": "https://picsum.photos/seed/news21/1200/700",
  "author": "Reporter Name",
  "source": "Local News Desk",
  "sourceUrl": "",
  "publishedAt": "2026-08-30T10:00:00+05:30",
  "updatedAt": "2026-08-30T10:00:00+05:30",
  "featured": false,
  "breaking": false,
  "trending": false,
  "views": 0,
  "tags": ["tag1", "tag2"]
}
```

- `id` must be unique across all articles.
- `slug` must be unique — it becomes the article's URL
  (`/news/your-slug`). Use lowercase, hyphen-separated words.
- `content.en` / `content.hi` are **arrays of paragraph strings** —
  each entry renders as its own paragraph.
- `image` can be any reachable image URL. If it fails to load, the
  site automatically falls back to `public/images/placeholder.svg`
  (see `components/ImageWithFallback.js`).

### Edit an article

Find it by `id` or `slug` in `data/news.json` and change any field.
No rebuild step beyond your normal deploy — the site reads the file
fresh at build/request time.

### Mark breaking news

Set `"breaking": true`. It immediately appears in the scrolling
breaking-news ticker at the top of the site.

### Mark trending news

Set `"trending": true`. Trending articles are ranked by `views`
(highest first) in the Trending sidebar — update the `views` number to
change ranking.

### Change category or location

Change the `"category"` or `"location"` field to any `id` from the
`"categories"` / `"locations"` arrays at the top of `data/news.json`.

### Add a new category

Add an object to the top-level `"categories"` array:

```json
{ "id": "technology", "name": { "en": "Technology", "hi": "तकनीक" } }
```

A page at `/category/technology` starts working immediately — no
component changes needed.

### Add a new city / location

Add an object to the top-level `"locations"` array:

```json
{ "id": "lucknow", "name": { "en": "Lucknow", "hi": "लखनऊ" } }
```

A page at `/location/lucknow` starts working immediately.

### Update English or Hindi content independently

Every user-facing content field (`title`, `summary`, `content`) is an
object with `en` and `hi` keys — edit whichever language needs a
change without touching the other.

### Update UI labels (buttons, empty states, footer links)

Those live in `data/translations.json`, separate from article content,
also keyed by `en` / `hi`.

---

## 5. Language switching

The site does **not** use separate `/en` / `/hi` URL prefixes. Instead
it uses a `?lang=hi` query parameter (English is the default and needs
no parameter). This was the simplest approach that still satisfies the
core requirement: **switching language preserves the current page or
article** — `components/LanguageSwitcher.js` reads the current path
and only swaps the `lang` param, so `/news/some-article` becomes
`/news/some-article?lang=hi` and back, never losing your place.

`/hindi` is kept as a simple shortcut that redirects to `/?lang=hi`,
matching the route named in the original structure.

---

## 6. Search

Search is fully client-triggered but server-rendered: typing a query
in the search box navigates to `/search?q=your+query`, and
`app/search/page.js` runs `searchNews()` from `lib/news.js` across
English/Hindi titles, summaries, tags, category, and location. No
external search service is used.

---

## 7. Admin preview

`/admin-preview` is a **read-only** demo page showing article counts
(total / breaking / featured / trending) and a link to view the raw
JSON via `/api/news-preview`. It does not let you edit content — the
real source of truth stays `data/news.json`. This route is excluded
from search engines via `robots.js`.

---

## 8. Deploying to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: Vercel will auto-detect **Next.js** — no changes
   needed.
4. No environment variables are required for the basic demo. Optionally
   set `NEXT_PUBLIC_SITE_URL` to your production domain for correct SEO
   metadata.
5. Click Deploy.

To update news after deploying: edit `data/news.json` in your repo and
push — Vercel redeploys automatically. There's no CMS or database to
manage for this version.

---

## 9. Migrating from JSON to an API / PostgreSQL later

The whole point of `lib/news.js` is that **no component or page ever
imports `data/news.json` directly** — they only call functions like
`getLatestNews()`, `getNewsBySlug(slug)`, `searchNews(query)`, etc.
Every one of those functions is already declared `async` and returns
the same shape it always will.

**Demo (today):**

```
Next.js → lib/news.js → data/news.json
```

**Production (later):**

```
Next.js → lib/news.js → fetch('/api/news/...') → Node.js API → PostgreSQL
```

To migrate:

1. Stand up a small API (Node/Express, or Next.js Route Handlers under
   `app/api/`) backed by PostgreSQL, exposing endpoints that mirror the
   function names in `lib/news.js` (e.g. `GET /api/news/latest`,
   `GET /api/news/:slug`, `GET /api/news/search?q=`).
2. Rewrite the body of each function in `lib/news.js` to call
   `fetch(...)` against that API instead of reading the local JSON
   array. Keep the function names and return shapes identical.
3. Nothing in `app/` or `components/` needs to change, because they
   only ever depended on the function contract, not the data source.
4. Add caching (e.g. Next.js `fetch` cache options, or Redis in front
   of the API) once traffic justifies it.

This is also the natural place to later add: RSS/news-API ingestion,
an authenticated admin dashboard, AI-assisted drafting, or a
scraping/import pipeline — all of it plugs in behind `lib/news.js`
without touching the frontend.

---

## 10. Recommended production architecture (when you're ready)

- **Frontend:** this Next.js app, deployed on Vercel (as today).
- **API layer:** Node.js (Express or Next.js Route Handlers) exposing
  a REST (or GraphQL, if preferred) API mirroring `lib/news.js`.
- **Database:** PostgreSQL for articles, categories, locations, and
  authors; consider a `translations` table or JSONB columns for
  bilingual fields to keep the same `{ en, hi }` shape.
- **Caching:** Redis in front of read-heavy endpoints (homepage,
  trending) once traffic grows.
- **Auth:** add only when you introduce a real editorial dashboard —
  not required for read-only public pages.
- **Images:** move from demo placeholder URLs to a real object store
  (S3/Cloudflare R2) + `next/image` remote patterns, same as today.

---

## 11. Accessibility & performance notes

- Semantic landmarks (`header`, `nav`, `main`, `article`, `footer`)
  throughout, with a "Skip to content" link.
- Visible focus states on every interactive element (see
  `app/globals.css`).
- The breaking-news ticker respects `prefers-reduced-motion`.
- Images use `next/image` with responsive `sizes` and a local SVG
  fallback (`components/ImageWithFallback.js`) so a broken image URL
  never breaks the layout.
- Category, location, and article pages are statically generatable via
  `generateStaticParams()`.

---

## 12. What's intentionally **not** included (by design)

Redux, Prisma, MongoDB, PostgreSQL, authentication, Redis, GraphQL,
Kubernetes, and a separate backend are all deliberately left out of
this version. The goal of this build is: **simple → fast → beautiful →
easy to update → easy to deploy.** Section 9 above is the on-ramp for
adding real infrastructure once the demo has proven itself.
