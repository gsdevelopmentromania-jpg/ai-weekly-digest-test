# Architecture Overview

> For the authoritative set of coding rules, see [ARCHITECTURE.md](../ARCHITECTURE.md).  
> This document explains the *why* and provides navigational context.

---

## High-Level Architecture

```
Browser
  │
  ▼
Next.js 14 App Router (Vercel / Node.js)
  ├── Server Components  ──► Supabase Postgres (RLS)
  ├── Client Components  ──► (UI state only)
  └── API Routes         ──► Supabase Postgres (service role)
```

The application is a **server-first Next.js app**. The vast majority of rendering happens on the server; React Client Components are only used for interactive widgets (e.g., the `SubscribeForm`).

---

## Request Flow

### Page request (e.g. `/digest/week-12-2026`)

1. Next.js matches `app/digest/[slug]/page.tsx` — a **Server Component**.
2. The component calls `getDigestBySlug(slug)` from `lib/services/digest.service.ts`.
3. The service queries Supabase using the **anon key** (RLS enforced).
4. Rendered HTML is streamed to the browser — no client JS required for data fetching.

### API request (e.g. `GET /api/digests`)

1. Next.js routes to `app/api/digests/route.ts`.
2. Query params are validated with `paginationSchema` from `lib/validators.ts`.
3. `getDigests()` in `lib/services/digest.service.ts` queries Supabase.
4. Response is returned as `{ data, error, status }`.

### Subscribe flow (`POST /api/subscribe`)

1. `SubscribeForm` (Client Component) `POST`s `{ email }` to `/api/subscribe`.
2. `app/api/subscribe/route.ts` validates the body with `subscribeSchema`.
3. `subscribe(email)` in `lib/services/subscriber.service.ts` upserts into the `subscribers` table.
4. Returns `201` with the new subscriber record.

---

## Key Modules

### `lib/supabase.ts`

Exports two Supabase clients:

- **`supabaseAnon`** — uses the public anon key; safe for server components and client-side reads.
- **`supabaseAdmin`** — uses the service role key; used only in API route handlers for privileged writes.

### `lib/services/digest.service.ts`

Data-access layer for digest issues and items:

- `getDigests(params)` — paginated list of issues
- `getDigestBySlug(slug)` — single issue with items

### `lib/services/subscriber.service.ts`

- `subscribe(email)` — insert or re-activate a subscriber
- `unsubscribe(email)` — set `unsubscribed_at` on an existing subscriber

### `lib/validators.ts`

Lightweight Zod schemas used directly in route handlers:

- `paginationSchema` — validates `page` and `perPage` query params
- `subscribeSchema` — validates `{ email }` request body

### `lib/schemas.ts`

Full entity-level Zod schemas that mirror every TypeScript interface in `types/index.ts`. Used for form validation, server actions, and data import pipelines.

### `types/index.ts`

Single source of truth for all TypeScript interfaces. Import from here — never redefine types elsewhere.

---

## Database Schema

See [`supabase/migrations/0001_initial_schema.sql`](../supabase/migrations/0001_initial_schema.sql) for the full DDL.

### Entity Relationship (simplified)

```
authors ──< blog_posts
digest_issues ──< digest_items
digest_issues ──< social_posts (optional)
blog_posts    ──< social_posts (optional)
subscribers (standalone)
email_templates (standalone)
```

### Row Level Security

All tables have RLS enabled. Default policies:

| Table | Policy |
|---|---|
| `digest_issues` | Public `SELECT` |
| `digest_items` | Public `SELECT` |
| `authors` | Public `SELECT` |
| `blog_posts` | Public `SELECT` where `status = 'published'` |
| `subscribers` | Public `INSERT` (anonymous sign-up); no public `SELECT` |
| `email_templates` | No public access |
| `social_posts` | No public access |

---

## Component Architecture

```
app/layout.tsx              ← Root layout: Header + Footer
  app/page.tsx              ← Home (Server Component, fetches latest issues)
  app/digest/page.tsx       ← Archive (Server Component, paginated)
  app/digest/[slug]/page.tsx ← Detail (Server Component, full issue)
  app/not-found.tsx         ← 404 page

components/
  layout/
    Header.tsx              ← Site nav (Server Component)
    Footer.tsx              ← Site footer (Server Component)
  ui/
    Card.tsx                ← Generic card container
    Badge.tsx               ← Category / tag badge
    Button.tsx              ← Styled button (polymorphic)
    SubscribeForm.tsx       ← Newsletter sign-up form ('use client')
  DigestCard.tsx            ← Issue preview card
  DigestItemCard.tsx        ← Individual article card within an issue
```

Only `SubscribeForm.tsx` is a Client Component — it manages the form submission state.

---

## Styling System

Tailwind CSS is configured in `tailwind.config.ts`. Custom design tokens (colours, fonts) live under `theme.extend`. The `cn()` helper (`lib/utils.ts`) merges `clsx` and `tailwind-merge` to handle conditional class composition safely.
