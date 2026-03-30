# Data Handling Compliance Audit — AI Weekly Digest
**Date:** 2026-03-30
**Auditor:** Juris (AI Legal Advisor — GitHub Copilot)
**Scope:** Codebase technical audit — data collection, storage, transit, and third-party sharing

> ⚠️ **Disclaimer:** This report is AI-assisted guidance, not legal advice. Engage a licensed attorney before making compliance decisions, especially for GDPR/CCPA obligations.

---

## Executive Summary

The AI Weekly Digest codebase is relatively lean: it collects only email addresses for newsletter subscriptions, stores content in Supabase (PostgreSQL), and has no payment processing or analytics integrations. The primary data risk surface is the subscriber pipeline. Several **Critical** and **High** gaps were identified, most notably the **absence of rate limiting** on the subscribe API and a **Supabase client misconfiguration** that may cause server-side subscriber lookups to silently fail due to Row Level Security (RLS).

---

## 1. PII Storage

### Findings

| Table | PII Fields | Encryption at Rest |
|---|---|---|
| `subscribers` | `email` (text, unique) | Supabase platform-level AES-256 (default) |
| `authors` | `name`, `bio`, `avatar_url`, `social_links` | Supabase platform-level AES-256 |
| `blog_posts` | None (content only) | — |
| `digest_issues` | None | — |

- Email addresses are stored in plaintext in the `subscribers` table. Supabase encrypts the underlying disk storage by default (AES-256), but there is **no application-level encryption** of the email field.
- No passwords are stored. No financial data is stored. No IP addresses are persisted to the database.
- The `subscribers` table lacks a **data retention / expiry mechanism**. Unsubscribed records remain in the database indefinitely (`unsubscribed_at` is set but the row is deleted on unsubscribe per the service code — this is actually a delete, not a soft-delete, so retention is addressed for unsubscribes).

### Risks

| Severity | Issue |
|---|---|
| Medium | No application-level field encryption for email addresses. If Supabase is misconfigured or credentials are leaked, emails are immediately readable. |
| Medium | No data retention schedule documented — GDPR Art. 5(1)(e) requires storage limitation. |

### Remediation

1. Document the data retention policy (e.g., "subscriber emails purged 2 years after unsubscription confirmation").
2. Consider application-level hashing of emails for lookup (e.g., store SHA-256 hash alongside plaintext for indexed lookups) if threat model requires it.
3. Add a `deleted_at` column or a separate deletion log for GDPR right-to-erasure audit trails.

---

## 2. Data in Transit

### Findings

- Supabase URL in `.env.example` enforces HTTPS (`https://your-project-ref.supabase.co`). All Supabase SDK calls are HTTPS by default.
- `next.config.mjs` does **not** configure HTTP Strict Transport Security (HSTS) headers or an HTTP→HTTPS redirect. This relies entirely on the hosting platform (e.g., Vercel auto-enforces HTTPS, but this is not guaranteed for all deployment targets).
- Image remote patterns are scoped to `**.supabase.co` over HTTPS only (`protocol: 'https'`). ✅

### Risks

| Severity | Issue |
|---|---|
| High | No HSTS or HTTP→HTTPS redirect configured in `next.config.mjs`. If deployed to a non-HTTPS-enforcing host, subscriber emails could be transmitted in plaintext. |

### Remediation

```js
// next.config.mjs — add security headers
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  // ... existing config
};
```

---

## 3. Logging

### Findings

- No structured logging framework (e.g., Winston, Pino) is present in `package.json`.
- Error propagation in API routes uses `err.message` directly: `const message = err instanceof Error ? err.message : 'Unexpected error';` — this message is returned to the HTTP client.
- No `console.log` calls with PII were found in reviewed files.
- Supabase SDK may log internally depending on the environment; this is not configurable in the current codebase.
- Next.js/Vercel default access logs may capture IP addresses and request paths server-side, but this is infrastructure-level, not application-level.

### Risks

| Severity | Issue |
|---|---|
| Medium | Supabase `error.message` strings returned to HTTP clients may expose internal DB structure (table names, constraint names). Example: a duplicate-key violation would expose `"duplicate key value violates unique constraint 'subscribers_email_key'"`. |
| Low | No explicit logging suppression for PII — if `console.error` is added in future, emails in error context could be logged. |

### Remediation

1. Sanitize error messages before returning to clients:
   ```ts
   // Instead of: const message = err instanceof Error ? err.message : 'Unexpected error';
   const message = 'An error occurred. Please try again.'; // generic for 500s
   // Log the real error server-side only
   console.error('[subscribe] Error:', err);
   ```
2. Add a logging policy to `CONTRIBUTING.md` prohibiting logging of PII fields.

---

## 4. Third-Party Data Sharing

### Findings

**Dependencies reviewed (`package.json`):**

| Package | Purpose | Receives PII? | DPA Available? |
|---|---|---|---|
| `@supabase/supabase-js` v2.47 | Database + Auth | ✅ Email addresses | Yes — [Supabase DPA](https://supabase.com/docs/company/dpa) |
| `@supabase/ssr` v0.5.2 | SSR cookie auth | ✅ Session cookies | Same as above |
| `next` 14.2.18 | Framework | ❌ | N/A |
| `zod` | Validation | ❌ | N/A |
| `clsx`, `tailwind-merge` | UI utilities | ❌ | N/A |

**No analytics, advertising, payment processors, or third-party email delivery services** (e.g., SendGrid, Resend, Mailchimp) are installed. This is a significant data minimization positive.

### Risks

| Severity | Issue |
|---|---|
| High | No evidence of a signed Supabase DPA in the repository. GDPR Art. 28 requires a Data Processing Agreement with all processors. |
| Medium | If a third-party email delivery service is added in future (likely, since email templates exist in the schema), a DPA will be required before the first send. |

### Remediation

1. Sign the Supabase DPA at https://supabase.com/docs/company/dpa and store a copy in `docs/legal/`.
2. Before integrating any email delivery service (Resend, SendGrid, etc.), ensure DPA is signed and documented.
3. Update the Privacy Policy to list Supabase explicitly as a sub-processor.

---

## 5. Authentication & Session Security

### Findings

- The application has **no user-facing authentication** (no login/signup UI). The only user action is newsletter subscription (email only).
- `createServiceClient()` in `lib/supabase.ts` correctly sets `persistSession: false` and `autoRefreshToken: false` for server-side use. ✅
- The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-side only and documented as such. ✅
- `.env.example` correctly warns "never expose to client". ✅

### 🚨 Critical Bug — RLS + Wrong Supabase Client in Subscriber Service

`lib/services/subscriber.service.ts` imports and uses the **anon (browser) Supabase client** for server-side database operations:

```ts
// subscriber.service.ts — INCORRECT
import { supabase } from '@/lib/supabase'; // ← anon key client

export async function subscribe(email: string): Promise<Subscriber> {
  const { data: existing } = await supabase    // ← anon client SELECT
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  // ...
  const { data, error } = await supabase       // ← anon client INSERT
    .from('subscribers')
    .insert({ email, confirmed: false })
```

The RLS policy for `subscribers` only permits `INSERT` with `"Anyone can subscribe"`. There is **no SELECT policy** for subscribers. Because RLS is enabled, the anon client's `SELECT` will return `null` (silently, due to `maybeSingle()`), causing duplicate email inserts to bypass the deduplication check.

**This is simultaneously a data integrity bug and a security issue.** The fix requires using `createServiceClient()` for server-side subscriber operations.

### Risks

| Severity | Issue |
|---|---|
| Critical | `subscriber.service.ts` uses anon client for server-side DB operations. The SELECT deduplication check silently fails due to RLS, potentially allowing duplicate subscriber rows. |
| High | No CSRF protection on `POST /api/subscribe`. A malicious site could submit subscription requests on behalf of visitors. |

### Remediation

```ts
// subscriber.service.ts — CORRECTED
import { createServiceClient } from '@/lib/supabase';

export async function subscribe(email: string): Promise<Subscriber> {
  const supabase = createServiceClient(); // ← service role for server-side
  // ... rest of code unchanged
}

export async function unsubscribe(email: string): Promise<boolean> {
  const supabase = createServiceClient();
  // ...
}
```

For CSRF: add a `SameSite=Strict` cookie check or use Next.js built-in CSRF protection patterns.

---

## 6. API Security

### Findings

- Input validation via **Zod** is present on all API routes. ✅
- Email format validation (`z.string().email()`) is applied before any DB operation. ✅
- Pagination params are validated with min/max bounds (`max: 100`). ✅
- **No rate limiting** is configured on any API route.
- **No API authentication** is required for `POST /api/subscribe` or `GET /api/digests*` (public routes — acceptable for read endpoints, but subscribe should have rate limiting).
- No `Content-Type` enforcement on POST routes (any content type is accepted, though JSON parsing failure returns 400).

### Risks

| Severity | Issue |
|---|---|
| Critical | No rate limiting on `POST /api/subscribe`. An attacker can enumerate valid emails, spam inboxes, or pollute the subscriber list with automated requests. |
| High | No rate limiting on `DELETE /api/subscribe` (unsubscribe). An attacker could unsubscribe all users by brute-forcing email addresses. |
| Medium | No `Content-Security-Policy` header configured. |
| Low | No `X-Request-ID` tracing — makes incident response harder. |

### Remediation

1. **Add rate limiting** using Vercel Edge middleware or a library like `@upstash/ratelimit`:
   ```ts
   // middleware.ts
   import { Ratelimit } from '@upstash/ratelimit';
   // Limit: 5 subscribe requests per IP per minute
   ```
2. Add `Content-Security-Policy` to security headers in `next.config.mjs`.
3. Consider requiring an email confirmation token for unsubscribe (prevents malicious unsubscription of others).

---

## Summary Risk Matrix

| ID | Area | Severity | Issue | Status |
|---|---|---|---|---|
| DH-01 | Authentication | **Critical** | `subscriber.service.ts` uses anon Supabase client for server-side writes; RLS SELECT silently fails causing deduplication bypass | ❌ Open |
| DH-02 | API Security | **Critical** | No rate limiting on `POST /api/subscribe` and `DELETE /api/subscribe` | ❌ Open |
| DH-03 | Data in Transit | **High** | No HSTS or security headers in `next.config.mjs` | ❌ Open |
| DH-04 | Third-Party | **High** | No documented/signed Supabase DPA | ❌ Open |
| DH-05 | API Security | **High** | No rate limiting on unsubscribe endpoint — mass unsubscription attack possible | ❌ Open |
| DH-06 | Logging | **Medium** | DB error messages exposed to HTTP clients (information leakage) | ❌ Open |
| DH-07 | PII Storage | **Medium** | No data retention policy documented | ❌ Open |
| DH-08 | API Security | **Medium** | No Content-Security-Policy header | ❌ Open |
| DH-09 | PII Storage | **Medium** | No application-level email field encryption | ℹ️ Acceptable with DPA |
| DH-10 | Logging | **Low** | No logging policy in CONTRIBUTING.md to prevent future PII logging | ❌ Open |

---

## Positive Findings ✅

- Only email is collected — strong data minimisation
- No analytics trackers, advertising SDKs, or payment processors
- Service role key correctly restricted to server-side
- RLS enabled on all Supabase tables
- Zod validation on all API inputs
- `.gitignore` and `.env.example` properly separate secrets
- HTTPS enforced for all Supabase and image connections
- No passwords stored anywhere in the system

---

## Recommended Next Steps

1. **Immediate (this sprint):** Fix `subscriber.service.ts` to use `createServiceClient()` — this is a correctness bug with security implications (DH-01).
2. **Before launch:** Add rate limiting middleware (DH-02, DH-05).
3. **Before launch:** Add security headers to `next.config.mjs` (DH-03, DH-08).
4. **Legal:** Sign and file Supabase DPA (DH-04) — required before processing EU/CA subscriber data.
5. **Documentation:** Add data retention policy and logging policy (DH-07, DH-10).

---

*Generated by Juris — AI Legal Compliance Agent | This is AI-assisted guidance, not legal advice.*
