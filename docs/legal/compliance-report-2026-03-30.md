# Compliance Report — AI Weekly Digest (2026-03-30)

**Prepared by:** Juris — AI Legal Advisor (GitHub Copilot)
**Playbook:** Legal Compliance Audit | Phase: Compliance Report | Step 1
**Scope:** Consolidated executive summary across all four audit phases

---

> ⚠️ **DISCLAIMER:** This report is AI-assisted compliance guidance. It is **not legal advice**
> and does not constitute the opinion of a licensed attorney. All Critical and High findings
> must be reviewed by qualified legal counsel before launch.

---

## Overall Risk Rating

🔴 **CRITICAL** — AI Weekly Digest has no Terms of Service, no Privacy Policy, no cookie consent
mechanism, and two code-level security vulnerabilities (RLS bypass + no rate limiting) that must
be resolved before any public launch or onboarding of real subscribers.

---

## Critical Issues (fix before launch)

These issues create immediate legal liability or security risk and **must be resolved before the
first subscriber is onboarded or the product is publicly announced.**

1. **No Terms of Service document exists.**
   Create `app/terms/page.tsx` covering acceptance, description of service, IP, disclaimers,
   liability limitation, governing law, and dispute resolution. Add `/terms` link to the Footer.
   _(Source: ToS Audit — Finding 1)_

2. **No Privacy Policy document exists.**
   Create `app/privacy/page.tsx` covering all GDPR Art. 13 requirements: controller identity,
   purpose and legal basis, retention periods, data subject rights, sub-processors, and contact
   details. Add `/privacy` link to Footer and SubscribeForm.
   _(Source: Privacy Audit — CRITICAL-01)_

3. **No legal basis or consent record for email collection (GDPR Art. 6–7).**
   Add a `consent_given_at TIMESTAMPTZ` and `consent_text TEXT` column to the `subscribers`
   table. Add an unchecked consent checkbox to `SubscribeForm` with clear opt-in language.
   Implement double opt-in (confirmation email + token flow).
   _(Source: Privacy Audit — CRITICAL-02; ToS Audit — Finding 2)_

4. **No cookie consent mechanism.**
   Implement a cookie consent banner classifying Supabase session cookies as strictly necessary
   and gating any analytics cookies behind user opt-in. Add a Cookie Policy section to the
   Privacy Policy.
   _(Source: Privacy Audit — CRITICAL-03)_

5. **No governing law or jurisdiction clause.**
   Add a governing law clause to the Terms of Service specifying the applicable jurisdiction
   and dispute resolution forum.
   _(Source: ToS Audit — Finding 3)_

6. **`subscriber.service.ts` uses the anon Supabase client for server-side operations.**
   The RLS `SELECT` policy blocks the anon key, causing the deduplication check to silently
   return `null` and allowing duplicate subscriber rows. Replace `supabase` (anon client) with
   `createServiceClient()` in all service functions.
   _(Source: Data Handling Audit — DH-01)_

7. **No rate limiting on `POST /api/subscribe` or `DELETE /api/subscribe`.**
   An attacker can spam the subscribe endpoint or mass-unsubscribe all users. Implement IP-based
   rate limiting via Vercel Edge middleware or `@upstash/ratelimit` (e.g., 5 requests/IP/minute).
   _(Source: Data Handling Audit — DH-02, DH-05)_

---

## High Priority (fix within 30 days)

8. **No HSTS or security headers in `next.config.mjs`.**
   Add `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, and
   `Referrer-Policy` headers. Without HSTS, subscriber emails could be transmitted in plaintext
   on non-HTTPS-enforcing deployments.
   _(Source: Data Handling Audit — DH-03)_

9. **No Supabase Data Processing Agreement (DPA) executed.**
   Download and sign the Supabase DPA at https://supabase.com/legal/dpa. Store a copy in
   `docs/legal/`. Without a signed DPA, processing EU/CA subscriber data is a breach of
   GDPR Art. 28.
   _(Source: Privacy Audit — HIGH-02; Data Handling Audit — DH-04)_

10. **No unsubscribe mechanism in outgoing emails (CAN-SPAM / GDPR Art. 21).**
    Every email must include a one-click unsubscribe link using a signed token. Create an
    `/unsubscribe?token=...` route. CAN-SPAM penalty: up to $53,088 per email.
    _(Source: ToS Audit — Finding 6; Privacy Audit — HIGH-04)_

11. **No data subject rights mechanism (GDPR Art. 15–22 / CCPA).**
    Create a self-service rights request flow or `privacy@[domain]` email. Implement a data
    export endpoint. Secure the unsubscribe endpoint with signed tokens to prevent
    unauthenticated deletion of any email.
    _(Source: Privacy Audit — HIGH-01)_

12. **No age restriction or COPPA compliance.**
    Add a minimum age clause (16 for GDPR; 13 for COPPA/US) to the Terms of Service and a
    notice at the SubscribeForm. Without this, the service may inadvertently collect data
    from minors.
    _(Source: ToS Audit — Finding 4)_

13. **No disclaimer of liability for content accuracy.**
    Add warranty disclaimer and limitation of liability clauses to the Terms of Service.
    AI-generated summaries that cause business decisions carry heightened negligence risk without
    explicit disclaimers.
    _(Source: ToS Audit — Finding 7)_

14. **No IP disclaimer for AI-curated third-party content.**
    Add a third-party IP disclaimer and DMCA takedown contact to the Terms of Service addressing
    the `digest_items.summary` content.
    _(Source: ToS Audit — Finding 5)_

15. **No data breach notification procedure.**
    Document an internal incident response plan: who is notified, within what timeframe (72h
    for GDPR supervisory authority), and what constitutes a reportable breach. Add a
    `security.txt` to `public/` and reference the process in the Privacy Policy.
    _(Source: Privacy Audit — HIGH-05)_

16. **International data transfer disclosure missing.**
    Document all countries where data is processed (Supabase region, Vercel edge). Add an
    "International Transfers" section to the Privacy Policy citing applicable transfer mechanisms
    (SCCs or adequacy decisions).
    _(Source: Privacy Audit — HIGH-03)_

17. **DB error messages exposed to HTTP clients (information leakage).**
    Replace raw `err.message` returned in API responses with a generic error string. Log real
    errors server-side only.
    _(Source: Data Handling Audit — DH-06)_

---

## Medium Priority (fix within 90 days)

18. **No data retention policy defined or enforced.**
    Define a retention schedule (e.g., active subscribers: while subscribed; unsubscribed:
    purged after 30 days). Implement a scheduled cleanup job or Supabase Edge Function.
    Document in the Privacy Policy. _(Source: Privacy Audit — CRITICAL-04; ToS Audit — Finding 8)_

19. **No double opt-in / consent record implemented.**
    Add `confirmation_token` and `confirmation_sent_at` columns to `subscribers`. Send a
    confirmation email on subscribe. Only include `confirmed = true` records in email sends.
    _(Source: ToS Audit — Finding 9; Privacy Audit — LOW-02)_

20. **Privacy notice insufficient at point of collection.**
    Add below the subscribe button: *"By subscribing you agree to our [Terms of Service] and
    [Privacy Policy]. You can unsubscribe at any time."* with linked anchors.
    _(Source: Privacy Audit — MEDIUM-01)_

21. **No Content-Security-Policy header.**
    Add a `Content-Security-Policy` header to `next.config.mjs` security headers block.
    _(Source: Data Handling Audit — DH-08)_

22. **RLS policies on `subscribers` table incomplete.**
    Add a `SELECT` policy restricting reads to service-role only. Add a `DELETE` policy
    requiring a signed token. Confirm the anon key cannot enumerate subscribers via the
    Supabase REST API.
    _(Source: Privacy Audit — MEDIUM-02)_

23. **No service modification or termination clause in Terms of Service.**
    Add a clause stating the operator's right to modify/discontinue the service with reasonable
    notice (≥ 30 days for material changes) and data handling upon termination.
    _(Source: ToS Audit — Finding 10)_

24. **No `license` field in `package.json`; no `LICENSE` file in repo.**
    Add `"license": "UNLICENSED"` to `package.json` if the project is proprietary.
    _(Source: License Audit — L-01)_

25. **No privacy contact email or controller identity disclosed.**
    Create `privacy@[domain]` and include the controller's full legal name, address, and
    privacy contact in the Privacy Policy.
    _(Source: Privacy Audit — MEDIUM-04)_

26. **No Privacy by Design documentation (GDPR Art. 25).**
    Document a lightweight DPIA in `docs/legal/`. Add a Privacy & Security section to
    `ARCHITECTURE.md` covering data minimisation rationale.
    _(Source: Privacy Audit — MEDIUM-03)_

---

## Low Priority (best practices)

27. **EU AI Act transparency disclosure missing.**
    Add a disclosure to the Terms of Service and/or About page that content summaries may be
    AI-assisted and all content is reviewed before publication.
    _(Source: ToS Audit — Finding 12)_

28. **Apache 2.0 attribution obligations not documented.**
    Create a `THIRD_PARTY_LICENSES.md` listing `@supabase/ssr` and `typescript` copyright
    notices. Run `npx license-checker --csv > docs/legal/third-party-licenses.csv` before launch.
    _(Source: License Audit — L-02)_

29. **Transitive dependencies not audited for license compliance.**
    Run `npx license-checker --summary` against the full `node_modules` tree before first
    production release and integrate license scanning into CI/CD.
    _(Source: License Audit — L-04)_

30. **`CONTRIBUTING.md` lacks security and privacy guidelines.**
    Add a Security & Privacy section: never commit real emails in test fixtures, use synthetic
    data, and report vulnerabilities via the security contact rather than public issues.
    _(Source: Privacy Audit — LOW-01)_

31. **Pre-emptive: Auto-renewal disclosures (if paid tier is introduced).**
    Before launching any paid subscription: comply with California ARL, FTC Click-to-Cancel
    rule (2026), and EU Consumer Rights Directive (clear pricing, cancellation, confirmation email).
    _(Source: ToS Audit — Finding 13)_

---

## Compliance Checklist

| Item | Status |
|------|--------|
| ☐ ToS reviewed and published | ❌ Does not exist |
| ☐ Privacy Policy GDPR/CCPA-compliant | ❌ Does not exist |
| ☐ Cookie consent implemented | ❌ Not implemented |
| ☐ Consent checkbox + double opt-in at subscription | ❌ Not implemented |
| ☐ Data retention schedule defined and enforced | ❌ Not defined |
| ☐ Data subject rights mechanism (access/delete/export) | ❌ Not implemented |
| ☐ Unsubscribe link in all outgoing emails | ⚠️ Email service not yet integrated |
| ☐ Rate limiting on subscribe/unsubscribe endpoints | ❌ Not implemented |
| ☐ Security headers (HSTS, CSP, X-Frame) in next.config | ❌ Not configured |
| ☐ Supabase anon/service client bug fixed in subscriber.service | ❌ Open bug |
| ☐ Data encryption verified (platform-level AES-256 via Supabase) | ✅ Platform-enforced |
| ☐ License compatibility confirmed (all MIT/Apache 2.0) | ✅ Confirmed — no copyleft risk |
| ☐ Supabase DPA executed and filed | ❌ Not verified |
| ☐ Vercel DPA executed and filed | ⚠️ Assumed via platform ToS — verify |
| ☐ Email sub-processor DPA (Resend/SendGrid/etc.) | ⚠️ No email provider integrated yet |
| ☐ Governing law clause in ToS | ❌ Missing |
| ☐ Age restriction clause | ❌ Missing |
| ☐ IP disclaimer and DMCA contact | ❌ Missing |
| ☐ Breach notification procedure documented | ❌ Missing |
| ☐ project `package.json` license field set | ❌ Missing |

---

## Audit Sources

| Document | Date | Critical | High | Medium | Low |
|----------|------|----------|------|--------|-----|
| `tos-audit-2026-03-30.md` | 2026-03-30 | 3 | 4 | 3 | 2 |
| `privacy-audit-2026-03-30.md` | 2026-03-30 | 4 | 5 | 4 | 2 |
| `data-handling-audit-2026-03-30.md` | 2026-03-30 | 2 | 3 | 3 | 2 |
| `license-audit-2026-03-30.md` | 2026-03-30 | 0 | 0 | 1 | 3 |
| **Consolidated (de-duplicated)** | | **7** | **10** | **10** | **5** |

---

## Positive Findings (Strengths)

- ✅ **Strong data minimisation** — only email addresses collected; no passwords, payment data, or tracking pixels
- ✅ **No copyleft dependency risk** — all dependencies MIT or Apache 2.0; no AGPL/GPL exposure
- ✅ **No commercial-use restrictions** — full monetisation freedom
- ✅ **Service role key correctly server-side only** — not exposed to client
- ✅ **Zod input validation on all API routes** — prevents malformed data
- ✅ **RLS enabled on all Supabase tables** — baseline row-level access control in place
- ✅ **`.env.example` properly separates secrets from config** — no credentials committed
- ✅ **Free service, no auto-renewal risk currently** — consumer protection billing obligations not yet triggered
- ✅ **No analytics SDKs, ad networks, or data brokers** — minimal third-party data sharing surface

---

## Recommended Launch Readiness Checklist

Before any public launch or marketing campaign, the following **minimum** gates must be cleared:

- [ ] Terms of Service page live at `/terms`
- [ ] Privacy Policy page live at `/privacy`
- [ ] Consent checkbox + Privacy/ToS link in SubscribeForm
- [ ] Cookie consent banner deployed
- [ ] Rate limiting on API routes
- [ ] `subscriber.service.ts` bug fixed (service client)
- [ ] Supabase DPA signed
- [ ] Unsubscribe route created and linked in email templates
- [ ] Security headers added to `next.config.mjs`

---

## Disclaimer

This report is AI-assisted compliance guidance produced by Juris (AI Legal Advisor). It is **not legal advice** and does not create an attorney-client relationship. The findings and remediation steps represent best-practice analysis informed by publicly available regulatory frameworks (GDPR, CCPA, CAN-SPAM, COPPA, EU AI Act, California ARL). **Consult a licensed attorney** for binding legal opinions, jurisdiction-specific requirements, and before publishing any Terms of Service or Privacy Policy.

---

*Report generated: 2026-03-30 | Juris — AI Legal Advisor | AI Weekly Digest Compliance Audit Series*
*Next recommended review: 2026-06-30 or prior to any major feature launch*
