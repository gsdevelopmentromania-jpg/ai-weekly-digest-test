# Privacy Policy Audit — AI Weekly Digest
**Date:** 2026-03-30
**Auditor:** Juris (AI Legal Advisor)
**Playbook:** Legal Compliance Audit · Phase: Policy Review · Step 2

> ⚠️ **Disclaimer:** This report is AI-assisted guidance, not legal advice. It does not constitute
> the opinion of a licensed attorney. All critical and high-severity findings should be reviewed
> by qualified legal counsel before going to market.

---

## Executive Summary

AI Weekly Digest currently **has no Privacy Policy, no Cookie Notice, and no GDPR/CCPA consent
infrastructure**. The application collects email addresses from visitors without any privacy
disclosure, legal basis statement, or data subject rights mechanism. This creates critical
regulatory exposure under GDPR, CCPA, and analogous frameworks before the first subscriber is
onboarded.

| Severity | Count |
|----------|-------|
| 🔴 Critical | 4 |
| 🟠 High | 5 |
| 🟡 Medium | 4 |
| 🟢 Low | 2 |

---

## Scope

Files reviewed:
- `app/api/subscribe/route.ts` — email collection endpoint
- `components/ui/SubscribeForm.tsx` — subscription UI
- `lib/services/subscriber.service.ts` — subscriber business logic
- `supabase/migrations/0001_initial_schema.sql` — database schema
- `lib/supabase.ts` — Supabase client initialization
- `types/index.ts` — data model definitions
- `app/page.tsx` — homepage with subscription form
- `package.json` — third-party dependencies
- `.env.example` — environment variable inventory

No `/privacy`, `docs/privacy*`, or `app/privacy/` pages were found in the repository.

---

## Audit Findings

---

### 🔴 CRITICAL-01 — No Privacy Policy Exists

**Area:** Data collection disclosure
**Regulation:** GDPR Art. 13 & 14, CCPA §1798.100, ePrivacy Directive

**Finding:**
The application collects email addresses from website visitors via `SubscribeForm` and stores them
in Supabase. There is no Privacy Policy page, no privacy notice at point of collection, and no
link to any privacy disclosure anywhere in the codebase (`Header`, `Footer`, subscription form,
or confirmation emails).

Under GDPR Art. 13, controllers must provide a privacy notice **at the time** personal data is
collected. Under CCPA §1798.100, businesses must inform California residents of their data
practices at or before collection. Neither obligation is being met.

**Remediation:**
1. Create an `app/privacy/page.tsx` route with a full Privacy Policy covering all items
   in this audit.
2. Add a link to the Privacy Policy in the `Footer` component and next to the
   `SubscribeForm` (e.g., "By subscribing you agree to our [Privacy Policy]").
3. The policy must be dated and versioned.

---

### 🔴 CRITICAL-02 — No Legal Basis for Email Collection (GDPR)

**Area:** Legal basis for processing
**Regulation:** GDPR Art. 6, GDPR Art. 7

**Finding:**
The `POST /api/subscribe` endpoint inserts an email address into the `subscribers` table without
capturing any record of consent or citing any legal basis. The `subscribers` table schema has
no `consent_given_at` column, no consent text version, and no IP/timestamp log of consent.

The `confirmed` boolean exists but is set to `false` on insert with no confirmation email
flow implemented, meaning subscribers are not double-opted in. Under GDPR, consent for
marketing emails must be freely given, specific, informed, and unambiguous (Art. 7).
Processing without documented consent or another valid legal basis is unlawful.

**Remediation:**
1. Add a `consent_given_at TIMESTAMPTZ` and `consent_text TEXT` column to the `subscribers`
   table to record the exact consent moment and wording.
2. Implement double opt-in: send a confirmation email; only set `confirmed = true` after
   the user clicks the link.
3. Add a checkbox to the `SubscribeForm` (unchecked by default) with clear consent language,
   e.g., *"I agree to receive AI Weekly Digest emails. I can unsubscribe at any time."*
4. Store the consent record server-side before inserting the subscriber row.

---

### 🔴 CRITICAL-03 — No Cookie Consent Mechanism

**Area:** Cookie consent
**Regulation:** ePrivacy Directive (EU Cookie Law), GDPR Recital 30, CCPA

**Finding:**
`lib/supabase.ts` uses `@supabase/ssr` which reads and writes cookies to manage authentication
sessions. Any cookie set on an EU/UK visitor's device requires prior informed consent unless it
is strictly necessary. No cookie banner, consent manager, or cookie policy exists in the codebase.
Additionally, if analytics tools (e.g., Vercel Analytics, Google Analytics) are added in the
future without consent gating, this becomes a direct GDPR violation.

**Remediation:**
1. Implement a cookie consent banner (e.g., using a lightweight library such as
   `@consent-manager/core` or a custom implementation).
2. Categorise cookies: *Strictly Necessary* (Supabase session) vs. *Analytics/Marketing*
   (opt-in required for EU visitors).
3. Add a Cookie Policy page or section within the Privacy Policy.
4. Gate any non-essential cookie writes behind user consent.

---

### 🔴 CRITICAL-04 — No Data Retention Policy or Enforcement

**Area:** Data retention
**Regulation:** GDPR Art. 5(1)(e), CCPA §1798.100(e)

**Finding:**
The database schema contains no `retention_expires_at` column, no automated deletion trigger,
and no row-level or table-level retention schedule. Subscriber records (including unsubscribed
ones) are stored indefinitely. `unsubscribed_at` is logged but no automated deletion occurs
post-unsubscription. GDPR's storage-limitation principle requires data to be kept no longer than
necessary for its purpose.

**Remediation:**
1. Define retention periods in a documented data retention schedule (e.g., active
   subscribers: while subscribed + 12 months; unsubscribed: deleted after 30 days).
2. Implement a scheduled Supabase Edge Function or cron job to delete/anonymise
   unsubscribed or inactive records past their retention window.
3. Document the retention schedule in the Privacy Policy.

---

### 🟠 HIGH-01 — No Data Subject Rights Mechanism

**Area:** User rights
**Regulation:** GDPR Art. 15–22, CCPA §1798.110–§1798.125

**Finding:**
Users have no mechanism to exercise their GDPR rights (access, rectification, erasure,
portability, restriction, objection) or CCPA rights (know, delete, opt-out, non-discrimination).
Although a `DELETE /api/subscribe` endpoint exists, it:
- Is not surfaced anywhere in the UI
- Only removes the record by email (no authenticated user session required — any email can
  delete any subscription)
- Does not provide a data export (portability) function

**Remediation:**
1. Create a self-service rights request form at `/privacy/rights` or via a mailto link
   to a dedicated privacy contact email.
2. Implement a data export endpoint that returns the subscriber's data as JSON/CSV.
3. Secure the unsubscribe endpoint (require a signed token in the unsubscribe link, not
   just an unauthenticated email parameter).
4. Document the rights request process and response timelines (max 30 days under GDPR)
   in the Privacy Policy.

---

### 🟠 HIGH-02 — Sub-Processor (Supabase) Not Disclosed — No DPA Verified

**Area:** Data processor agreements
**Regulation:** GDPR Art. 28, GDPR Art. 46

**Finding:**
Supabase acts as a data processor — it stores, hosts, and processes all subscriber email
addresses. Under GDPR Art. 28, the controller (AI Weekly Digest) must execute a Data
Processing Agreement (DPA) with Supabase. Supabase provides a standard DPA
(https://supabase.com/legal/dpa), but no evidence of execution, acknowledgment, or
documentation exists in this repository.

Additionally, the Supabase project region is not documented. If the project is hosted in a
non-EEA region (e.g., US-East), international transfer mechanisms (SCCs) must be in place
and disclosed.

**Remediation:**
1. Execute Supabase's DPA and retain a signed copy.
2. Document Supabase as a sub-processor in the Privacy Policy including: name, country of
   processing, purpose, and link to their privacy policy.
3. Confirm the Supabase project region and, if outside EEA, document the transfer
   mechanism (Standard Contractual Clauses or adequacy decision).

---

### 🟠 HIGH-03 — International Data Transfer Disclosure Missing

**Area:** International transfers
**Regulation:** GDPR Chapter V (Art. 44–49)

**Finding:**
The application's infrastructure (Supabase, Next.js hosting — likely Vercel) may process data
outside the EU/EEA. No disclosure of international data transfers exists, and no transfer impact
assessment (TIA) has been documented. The EU AI Act (in force as of 2026) adds additional
transparency obligations for AI-adjacent services processing EU resident data.

**Remediation:**
1. Document all countries where data may be processed (Supabase region, Vercel edge
   network regions).
2. Include an "International Transfers" section in the Privacy Policy citing the applicable
   transfer mechanism (SCCs with Supabase/Vercel, adequacy decisions, etc.).
3. Conduct a Transfer Impact Assessment if processing occurs in high-risk third countries.

---

### 🟠 HIGH-04 — No Unsubscribe Link in Transactional/Marketing Emails

**Area:** Email compliance
**Regulation:** CAN-SPAM Act (US), GDPR Art. 21(3), CASL (Canada)

**Finding:**
No email sending infrastructure is implemented yet, but the `email_templates` table and
`EmailTemplateType` enum (`welcome`, `digest`, `announcement`, `reengagement`) indicate
marketing emails are planned. Under CAN-SPAM, every commercial email must include:
- A clear unsubscribe mechanism
- The sender's physical postal address
- No deceptive subject lines

Under GDPR Art. 21(3), every marketing email must include a direct opt-out link.

**Remediation:**
1. Ensure every email template includes a one-click unsubscribe link using a signed token
   (not plain email, to prevent CSRF-style abuse).
2. Include the operator's physical mailing address in each email footer.
3. Honour unsubscribe requests within 10 business days (CAN-SPAM requirement).
4. Implement list suppression so unsubscribed emails are never re-added automatically.

---

### 🟠 HIGH-05 — No Data Breach Notification Process

**Area:** Breach notification
**Regulation:** GDPR Art. 33–34, CCPA §1798.150

**Finding:**
No incident response plan, breach notification procedure, or security contact information
exists in the repository. GDPR requires notification to the supervisory authority within 72
hours of becoming aware of a breach likely to result in risk to individuals. High-risk breaches
also require direct notification to affected data subjects.

**Remediation:**
1. Document a breach notification procedure internally (who is notified, within what
   timeframe, what information is reported).
2. Identify the applicable supervisory authority (based on the controller's EU establishment
   or, if none, the member state of most affected users).
3. Add a `security.txt` or `SECURITY.md` file with a disclosure contact.
4. Reference the breach response commitment in the Privacy Policy.

---

### 🟡 MEDIUM-01 — Subscription Form Lacks Privacy Notice at Point of Collection

**Area:** Transparency at collection
**Regulation:** GDPR Art. 13(1), CCPA §1798.100(b)

**Finding:**
The `SubscribeForm` component currently shows only "No spam. Unsubscribe at any time." This is
insufficient as a privacy notice. GDPR Art. 13 requires disclosure of the controller's identity,
the purpose and legal basis for processing, retention periods, and user rights — either inline
or via a clearly linked policy.

**Remediation:**
Add below the subscribe button:
> "By subscribing you agree to receive weekly emails from AI Weekly Digest. Your email is stored
> securely and never sold. See our [Privacy Policy] for details."

Link `[Privacy Policy]` to `/privacy`.

---

### 🟡 MEDIUM-02 — Row Level Security (RLS) on `subscribers` Table Is Incomplete

**Area:** Data security
**Regulation:** GDPR Art. 32 (security of processing)

**Finding:**
The migration enables RLS on the `subscribers` table and adds a policy allowing anonymous
`INSERT`. However, there is no `SELECT` policy for the subscriber themselves, no `DELETE`
policy for authenticated users, and no `UPDATE` policy. This means:
- An authenticated admin can query all subscribers via the anon key in certain configurations.
- There is no authenticated user flow to enforce ownership of subscription records.

**Remediation:**
1. Add a SELECT policy restricting row access to service-role only (no public/anon reads).
2. Add a DELETE policy that requires a valid signed token or authenticated session.
3. Confirm that the anon key cannot be used to enumerate the subscriber list via
   the Supabase REST API.

---

### 🟡 MEDIUM-03 — No Privacy by Design Documentation

**Area:** Privacy by design
**Regulation:** GDPR Art. 25

**Finding:**
GDPR Art. 25 requires Data Protection by Design and by Default. While some positive signals exist
(RLS enabled, service role key kept server-side, no plaintext secrets committed), there is no
Privacy Impact Assessment (PIA/DPIA), no documented data minimisation rationale, and no record
of privacy considerations in architectural decisions.

**Remediation:**
1. Document a lightweight DPIA covering: data flows, risks, and mitigations.
2. Add a "Privacy & Security" section to `ARCHITECTURE.md` explaining the data minimisation
   approach (only email collected, no tracking, etc.).

---

### 🟡 MEDIUM-04 — No Contact Information for Privacy Enquiries

**Area:** Controller transparency
**Regulation:** GDPR Art. 13(1)(a), CCPA §1798.130

**Finding:**
There is no privacy contact email, Data Protection Officer (DPO) designation, or company/
controller identity disclosed anywhere in the application. GDPR requires the controller's
identity and contact details to be provided in the privacy notice.

**Remediation:**
1. Create a `privacy@[domain]` email address and reference it in the Privacy Policy.
2. If processing large volumes of EU personal data or special category data, assess whether
   a DPO is required (GDPR Art. 37).
3. Include the controller's full legal name and registered address in the Privacy Policy.

---

### 🟢 LOW-01 — `CONTRIBUTING.md` Has No Privacy/Security Contribution Guidelines

**Area:** Operational governance
**Regulation:** GDPR Art. 32 (organisational measures)

**Finding:**
`CONTRIBUTING.md` does not include any guidance about not committing personal data, handling
test data containing real emails, or responsible disclosure of security vulnerabilities.

**Remediation:**
Add a "Security & Privacy" section to `CONTRIBUTING.md` instructing contributors to:
- Never commit real user email addresses or personal data in test fixtures.
- Use anonymised/synthetic data in all test files.
- Report security vulnerabilities via the security contact rather than public issues.

---

### 🟢 LOW-02 — `confirmed` Field Not Enforced by Application Logic

**Area:** Consent integrity
**Regulation:** GDPR Art. 7 (conditions for consent)

**Finding:**
The `Subscriber` type and database schema include a `confirmed: boolean` field, but the current
API returns and processes unconfirmed subscribers identically to confirmed ones. There is no
email-confirmation flow, meaning a third party could subscribe any email address without the
owner's knowledge.

**Remediation:**
1. Implement a confirmation email flow before treating a subscriber as active.
2. Filter out `confirmed = false` records from all email send operations.
3. Set an expiry on unconfirmed records (e.g., delete after 72 hours if not confirmed).

---

## Compliance Checklist Summary

| # | Requirement | Status | Severity |
|---|-------------|--------|----------|
| 1 | Privacy Policy published | ❌ Missing | 🔴 Critical |
| 2 | Legal basis documented for email collection | ❌ Missing | 🔴 Critical |
| 3 | Cookie consent banner | ❌ Missing | 🔴 Critical |
| 4 | Data retention schedule defined and enforced | ❌ Missing | 🔴 Critical |
| 5 | Data subject rights mechanism (access/delete/export) | ❌ Missing | 🟠 High |
| 6 | Supabase DPA executed and documented | ⚠️ Not verified | 🟠 High |
| 7 | International transfer disclosure | ❌ Missing | 🟠 High |
| 8 | CAN-SPAM/GDPR unsubscribe in emails | ⚠️ Not yet implemented | 🟠 High |
| 9 | Breach notification procedure | ❌ Missing | 🟠 High |
| 10 | Privacy notice at point of collection | ❌ Insufficient | 🟡 Medium |
| 11 | RLS policies complete on subscribers table | ⚠️ Partial | 🟡 Medium |
| 12 | DPIA / Privacy by Design documentation | ❌ Missing | 🟡 Medium |
| 13 | Privacy contact / controller identity | ❌ Missing | 🟡 Medium |
| 14 | Contributor guidelines on data handling | ❌ Missing | 🟢 Low |
| 15 | Double opt-in confirmation enforced | ❌ Not enforced | 🟢 Low |

---

## Recommended Remediation Priority

### Phase 1 — Pre-Launch Blockers (Critical / High)
1. **Draft and publish a Privacy Policy** at `/privacy` — covers all GDPR Art. 13 requirements.
2. **Add consent checkbox** to `SubscribeForm` + store `consent_given_at` in the database.
3. **Implement double opt-in** — send confirmation email, gate `confirmed = true`.
4. **Add cookie consent banner** — classify Supabase session cookies as strictly necessary;
   gate any analytics cookies behind opt-in.
5. **Execute Supabase DPA** — download from `https://supabase.com/legal/dpa`, sign, and file.
6. **Define retention schedule** — automated deletion of unsubscribed records after 30 days.
7. **Document breach notification procedure** internally and in the Privacy Policy.

### Phase 2 — Shortly After Launch (High / Medium)
8. Add international transfer section to Privacy Policy.
9. Create self-service rights request page or email.
10. Add privacy notice copy to `SubscribeForm`.
11. Tighten RLS policies on `subscribers` table.
12. Add security/privacy section to `CONTRIBUTING.md`.

### Phase 3 — Ongoing (Low / Governance)
13. Draft a lightweight DPIA and store it in `docs/legal/`.
14. Conduct quarterly privacy review as the product scales.
15. Add `security.txt` to the `public/` directory.

---

## Third-Party Data Processors Identified

| Processor | Purpose | DPA Available | Transfer Region |
|-----------|---------|---------------|-----------------|
| **Supabase** | Database & API hosting | Yes — https://supabase.com/legal/dpa | Configurable (EEA/US) |
| **Vercel** (likely) | Next.js hosting & edge | Yes — https://vercel.com/legal/dpa | Global edge network |

*Note: No email sending service (e.g., Resend, SendGrid, Postmark) is currently integrated,
but one will be required to deliver the newsletter. A DPA must be executed with that provider
before sending any emails.*

---

## EU AI Act Considerations (2026)

As of 2026, the EU AI Act is in its enforcement phase. AI Weekly Digest's primary function is
content curation (newsletter) rather than automated decision-making about individuals. However:

- If AI is used to personalise content, rank articles, or make decisions affecting individual
  subscribers, this may qualify as a **limited-risk AI system** requiring transparency disclosures
  under EU AI Act Art. 52.
- Disclose any AI-assisted content curation or personalisation in the Privacy Policy and, if
  applicable, per-interaction as required by Art. 52.
- Current codebase shows no AI inference endpoints — this finding is **pre-emptive** for when
  AI features are added.

---

*Report generated: 2026-03-30*
*Next review recommended: 2026-06-30 or before any significant feature launch*
