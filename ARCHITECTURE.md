# AI Weekly Digest — Architecture

## 1. Router
**Next.js App Router ONLY — do NOT create a `pages/` directory.**
All routes live under `app/`. File-based routing uses `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts` conventions.

## 2. TypeScript
**Strict mode enabled — all types must be explicit, no implicit `any`.**
- `strict: true` in `tsconfig.json`
- No `any` unless explicitly cast with a comment justification
- All function parameters and return types must be typed
- Use `unknown` instead of `any` when the type is truly unknown

## 3. Folder Structure
```
/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx          # Root layout (metadata, fonts, global providers)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles with Tailwind directives
│   └── api/                # API route handlers
│       └── [route]/
│           └── route.ts    # API handler (GET, POST, etc.)
├── components/             # Reusable UI components
│   ├── ui/                 # Primitive UI components (buttons, cards, etc.)
│   └── layout/             # Layout components (Header, Footer, Nav)
├── lib/                    # Shared utilities and service clients
│   ├── utils.ts            # General utility functions (cn, formatDate, etc.)
│   └── supabase.ts         # Supabase client initialisation
├── types/                  # Shared TypeScript type definitions
│   └── index.ts            # All exported types and interfaces
├── public/                 # Static assets (images, fonts, icons)
├── ARCHITECTURE.md
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── .env.example
└── .gitignore
```

## 4. Component Rules
- **All components using hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `useContext`, etc.) MUST have `'use client'` as the very first line of the file.**
- Server Components are the default — only opt into client rendering when necessary.
- Components that only render static markup or use `async` data fetching stay as Server Components (no directive needed).
- Keep `'use client'` boundaries as deep in the tree as possible to maximise server rendering.

## 5. Config Files
Exact filenames — do not deviate:
| File | Notes |
|---|---|
| `next.config.mjs` | **NOT** `.ts` — Next.js 14 requires `.mjs` or `.js` |
| `tailwind.config.ts` | TypeScript config for Tailwind |
| `postcss.config.mjs` | PostCSS with Tailwind and Autoprefixer plugins |
| `tsconfig.json` | TypeScript compiler config |
| `package.json` | Dependencies and scripts |
| `.env.example` | Template for required environment variables |
| `.gitignore` | Standard Next.js gitignore |

## 6. Styling
- **Tailwind CSS** is the primary styling approach — utility classes only, no CSS modules.
- Global styles and Tailwind directives live in `app/globals.css`.
- Custom design tokens (colours, fonts, spacing) are defined in `tailwind.config.ts` under `theme.extend`.
- `cn()` helper in `lib/utils.ts` combines `clsx` and `tailwind-merge` for conditional class merging.
- No inline `style` props unless absolutely required for dynamic values not achievable with Tailwind.

## 7. Data Layer
- **Supabase** is the primary data backend.
- Client initialisation lives in `lib/supabase.ts`.
- Use `@supabase/supabase-js` for direct queries and `@supabase/ssr` for server-side / cookie-based auth.
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Type generation: run `supabase gen types typescript --project-id <id> > types/supabase.ts` to keep DB types in sync.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client — use it only in API routes or Server Actions.

## 8. API Routes
- All API routes follow the pattern `app/api/<resource>/route.ts`.
- Each `route.ts` exports named HTTP method handlers: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Use `NextRequest` and `NextResponse` from `next/server`.
- Return consistent JSON shape: `{ data, error, status }`.
- Validate request bodies with `zod` before processing.

```ts
// Example: app/api/digest/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ data: [], error: null, status: 200 });
}
```
