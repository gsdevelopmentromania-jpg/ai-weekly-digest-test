# AI Weekly Digest

A weekly newsletter and web app covering the latest AI developments. Built with **Next.js 14 App Router**, **Supabase**, and **Tailwind CSS**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Overview](#api-overview)
- [Architecture](#architecture)
- [Contributing](#contributing)

---

## Features

- 📰 Browsable archive of weekly AI digest issues
- 📬 Newsletter subscription / unsubscription via API
- 🔍 Per-issue detail pages with categorised article items
- 🗄️ Supabase Postgres backend with Row Level Security
- ✅ Zod-validated API request bodies and query parameters
- 🎨 Fully responsive UI with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Database | Supabase (Postgres + RLS) |
| Styling | Tailwind CSS 3 |
| Validation | Zod |
| Utilities | clsx, tailwind-merge |

---

## Project Structure

```
/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Home page — latest digest issues
│   ├── not-found.tsx           # 404 page
│   ├── globals.css             # Tailwind directives + global styles
│   ├── digest/
│   │   ├── page.tsx            # Full digest archive listing
│   │   └── [slug]/page.tsx     # Individual digest issue detail
│   └── api/
│       ├── digests/
│       │   ├── route.ts        # GET /api/digests
│       │   └── [slug]/route.ts # GET /api/digests/:slug
│       └── subscribe/
│           └── route.ts        # POST / DELETE /api/subscribe
├── components/
│   ├── ui/                     # Primitive components (Button, Card, Badge, SubscribeForm)
│   └── layout/                 # Header, Footer
├── lib/
│   ├── supabase.ts             # Supabase client initialisation
│   ├── schemas.ts              # Full Zod entity schemas
│   ├── validators.ts           # Lightweight API request validators
│   ├── utils.ts                # cn() helper + formatDate
│   └── services/
│       ├── digest.service.ts   # Digest data-access functions
│       └── subscriber.service.ts # Subscribe / unsubscribe logic
├── types/
│   └── index.ts                # All TypeScript interfaces and types
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── .env.example
├── ARCHITECTURE.md
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier is fine)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gsdevelopmentromania-jpg/ai-weekly-digest-test.git
cd ai-weekly-digest-test

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local — see Environment Variables section below

# 4. Apply the database migration (see Database Setup)

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript type-check (no emit) |

---

## Environment Variables

Copy `.env.example` to `.env.local` and set the following:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key — server-side only, never exposed to the browser |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Base URL of the site (e.g. `http://localhost:3000` in dev) |

> ⚠️ Never commit `.env.local` or any file containing real secrets.

---

## Database Setup

The schema lives in `supabase/migrations/0001_initial_schema.sql`. Run it once against your Supabase project:

**Option A — Supabase CLI**

```bash
supabase db push
```

**Option B — Supabase Dashboard**

1. Open your project → **SQL Editor**
2. Paste the contents of `supabase/migrations/0001_initial_schema.sql`
3. Click **Run**

### Tables created

| Table | Description |
|---|---|
| `authors` | Content authors |
| `digest_issues` | Weekly digest editions |
| `digest_items` | Individual articles within an issue |
| `blog_posts` | Long-form blog articles |
| `subscribers` | Newsletter subscriber list |
| `email_templates` | Reusable email templates |
| `social_posts` | Scheduled/published social media posts |

Row Level Security (RLS) is enabled on all tables. Public read access is granted to published content; subscriber inserts are open to anonymous users.

### Regenerating TypeScript types from the DB

```bash
supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
```

---

## API Overview

All endpoints return a consistent JSON envelope:

```json
{
  "data": <payload or null>,
  "error": <error message or null>,
  "status": <HTTP status code>
}
```

### `GET /api/digests`

Returns a paginated list of published digest issues.

**Query parameters**

| Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | integer | `1` | — | Page number |
| `perPage` | integer | `10` | `100` | Items per page |

**Response `200`**

```json
{
  "data": {
    "items": [ /* DigestIssue[] */ ],
    "total": 42,
    "page": 1,
    "perPage": 10,
    "totalPages": 5
  },
  "error": null,
  "status": 200
}
```

---

### `GET /api/digests/:slug`

Returns a single digest issue with all its items.

**Path parameter:** `slug` — URL-friendly identifier (e.g. `week-12-2026`)

**Response `200`**

```json
{
  "data": {
    "id": "uuid",
    "slug": "week-12-2026",
    "title": "AI Weekly — Week 12, 2026",
    "weekLabel": "Week 12, 2026",
    "publishedAt": "2026-03-24T00:00:00Z",
    "summary": "...",
    "items": [ /* DigestItem[] */ ],
    "tags": ["llm", "policy"],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "error": null,
  "status": 200
}
```

**Response `404`** — digest not found.

---

### `POST /api/subscribe`

Subscribe an email address to the newsletter.

**Request body**

```json
{ "email": "reader@example.com" }
```

**Response `201`**

```json
{
  "data": { /* Subscriber */ },
  "error": null,
  "status": 201
}
```

---

### `DELETE /api/subscribe`

Unsubscribe an email address.

**Request body**

```json
{ "email": "reader@example.com" }
```

**Response `200`**

```json
{
  "data": { "email": "reader@example.com" },
  "error": null,
  "status": 200
}
```

**Response `404`** — email not found in subscriber list.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full architecture reference and coding rules.

Key points:

- **App Router only** — no `pages/` directory.
- **Server Components by default** — `'use client'` only where hooks are needed.
- **Supabase** for all data persistence; service role key stays server-side.
- **Zod** for all request/body validation before any DB interaction.
- **Tailwind CSS** only — no CSS modules or inline styles.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
