# Contributing to AI Weekly Digest

Thank you for your interest in contributing! Please read this guide before opening a pull request.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Project Conventions](#project-conventions)

---

## Development Setup

1. Fork and clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` → `.env.local` and fill in the Supabase credentials.
4. Run the database migration (see [README — Database Setup](./README.md#database-setup)).
5. Start the dev server: `npm run dev`

Before submitting a PR, make sure the following pass locally:

```bash
npm run type-check   # TypeScript — no implicit any, no unresolved imports
npm run lint         # ESLint via next lint
npm run build        # Production build must succeed
```

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `feat/<short-description>` | New features |
| `fix/<short-description>` | Bug fixes |
| `chore/<short-description>` | Tooling, deps, refactors |
| `docs/<short-description>` | Documentation only |

Branch off `main`, keep branches short-lived, and open a PR when ready.

---

## Coding Standards

### TypeScript

- `strict: true` is enabled — **no implicit `any`** is allowed.
- All function parameters and return types must be explicitly typed.
- Use `unknown` (not `any`) when the type is genuinely unknown.
- Import shared types from `types/index.ts` — do **not** redefine interfaces that already exist there.
- Import Zod schemas from `lib/schemas.ts` or `lib/validators.ts` — do **not** duplicate validation logic.

### React / Next.js

- **App Router only** — never create a `pages/` directory.
- Server Components are the default; add `'use client'` only when hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `useContext`, etc.) are required.
- `'use client'` must be the **very first line** of the file — before any imports.
- Keep client boundaries as deep in the component tree as possible.

### Styling

- **Tailwind CSS utility classes only** — no CSS modules, no inline `style` props (except for dynamic values unreachable via Tailwind).
- Use the `cn()` helper from `lib/utils.ts` to merge conditional classes.

### API Routes

- All routes live under `app/api/<resource>/route.ts`.
- Export named HTTP method handlers: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Validate every request body / query string with Zod **before** any DB call.
- Return the standard envelope: `{ data, error, status }`.

### File naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `DigestCard.tsx` |
| Utility / service files | camelCase | `digest.service.ts` |
| Route handlers | lowercase `route.ts` | `route.ts` |
| Config files | exact names per ARCHITECTURE.md | `next.config.mjs` |

---

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`.

Examples:

```
feat(api): add GET /api/digests pagination
fix(subscribe): return 404 when email not found
docs(readme): add database setup section
chore(deps): upgrade zod to 3.23.8
```

---

## Pull Request Process

1. Open a PR against `main`.
2. Fill in the PR description — explain *what* changed and *why*.
3. Ensure `type-check`, `lint`, and `build` all pass (CI will check).
4. Request a review from a maintainer.
5. Squash-merge once approved.

---

## Project Conventions

### Adding a new API endpoint

1. Create `app/api/<resource>/route.ts`.
2. Add a Zod schema in `lib/validators.ts` (lightweight) or `lib/schemas.ts` (full entity schema).
3. Add a service function in `lib/services/<resource>.service.ts`.
4. Document the endpoint in `docs/api.md`.

### Adding a new UI component

1. Primitive / reusable → `components/ui/`
2. Layout (header, footer, nav) → `components/layout/`
3. Feature-specific → `components/`

### Adding a database table

1. Create a new migration file: `supabase/migrations/<number>_<description>.sql`.
2. Add the corresponding TypeScript interface to `types/index.ts`.
3. Add the Zod schema to `lib/schemas.ts`.
4. Enable RLS and add appropriate policies in the migration.
