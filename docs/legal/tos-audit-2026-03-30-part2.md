### Finding 4 — No Age Restrictions / COPPA Compliance
**Severity: 🟠 High**

**Evidence:** The subscribe form (`components/ui/SubscribeForm.tsx`, `app/page.tsx`) has no age gate, minimum age declaration, or COPPA disclosure. The `subscribers` table schema stores no date-of-birth or age-verification field.

**Risk:** COPPA (Children's Online Privacy Protection Act) applies to US operators collecting personal information (including email addresses) from children under 13. GDPR Article 8 sets the digital consent age at 16 (member states may lower to 13). Without an age restriction, the service may inadvertently collect data from minors, creating regulatory liability.

**Remediation:** Add a minimum age clause to the Terms of Service and a notice at the subscription form:

```
This service is intended for users aged 16 and older (or 13+ in jurisdictions
where a lower age applies). By subscribing, you confirm that you meet the
minimum age requirement.
```

If children under 13 are not a target audience, state this explicitly in the ToS and consider adding a year-of-birth field to the subscription form as a lightweight gate.

---

### Finding 5 — Intellectual Property Risk: AI-Curated Summaries
**Severity: 🟠 High**

**Evidence:** The service curates AI news by republishing summaries of third-party articles (see `digest_items` table: `title`, `url`, `source`, `summary` fields). The Product Hunt listing confirms: *"I'm not trying to be comprehensive. I'm trying to be useful."* — implying editorial summarisation. The `digest_items.summary` field (up to 1,000 characters) likely contains paraphrased or AI-generated summaries of third-party content.

**Risk:**
- **Copyright infringement**: Reproducing substantial portions of third-party articles, even in summary form, may constitute infringement under the reproduction and derivative work rights of copyright owners. While brief summaries with attribution are generally protected under fair use (US) / fair dealing (UK/EU), the threshold is fact-specific.
- **AI-generated content**: If AI tools are used to generate summaries, the output may reproduce training-data content verbatim in edge cases.
- **Trade mark**: Reproducing publication names as sources is generally acceptable, but should not imply endorsement or affiliation.

**Remediation — Suggested ToS Language:**

```
Intellectual Property of Third Parties. AI Weekly Digest links to and
provides brief editorial summaries of publicly available third-party
content. All original content, trademarks, and intellectual property
rights remain with their respective owners. Our summaries constitute
fair use/fair dealing commentary and are not a substitute for the original
source. If you are a content owner and believe your rights have been
infringed, please contact us at [contact email].
```

Also add a DMCA / copyright takedown contact address.

---

### Finding 6 — CAN-SPAM / GDPR: No Confirmed Unsubscribe Mechanism in Emails
**Severity: 🟠 High**

**Evidence:** The `subscribers` table has an `unsubscribed_at` field and `DELETE /api/subscribe` exists, confirming unsubscribe capability exists server-side. However:
- No email templates are visible in the frontend codebase.
- There is no `/unsubscribe` page in `app/`.
- The `confirmed` column defaults to `false` with no visible confirmation email flow in `lib/services/subscriber.service.ts`.

**Risk:**
- **CAN-SPAM (US)**: Every commercial email must include a functional unsubscribe mechanism that is honoured within 10 business days. Absence of an unsubscribe link in emails violates this requirement (penalty: up to $53,088 per email).
- **GDPR**: Email marketing requires a clear, easy withdrawal of consent. "Unsubscribe at any time" on the homepage is insufficient — every email must contain a one-click unsubscribe link.

**Remediation:**
1. Add a `/unsubscribe?email=[encoded_email]&token=[hmac_token]` route that renders an unsubscribe confirmation page.
2. Include a one-click unsubscribe link in every outgoing email template.
3. Implement the double opt-in flow: upon POST /api/subscribe, send a confirmation email; only set `confirmed = true` after the user clicks the link.

---

### Finding 7 — No Disclaimer of Liability for Content Accuracy
**Severity: 🟠 High**

**Evidence:** The service describes itself as curating "the most impactful developments in artificial intelligence." There are no disclaimers on the site or in the codebase disclaiming liability for the accuracy, completeness, or timeliness of curated content.

**Risk:** If a subscriber makes a business or investment decision based on inaccurate or outdated information in the digest, the operator could face negligence claims without adequate disclaimers. AI-generated summaries increase this risk as they may introduce errors or hallucinations.

**Remediation — Suggested ToS Language:**

```
Disclaimer of Warranties. The Service and all content are provided "as is"
and "as available" without warranties of any kind, express or implied.
AI Weekly Digest does not warrant the accuracy, completeness, reliability,
or timeliness of any information in the digest. Content is for informational
purposes only and does not constitute financial, investment, legal, or
professional advice. You rely on the Service at your own risk.

Limitation of Liability. To the maximum extent permitted by applicable law,
AI Weekly Digest and its operators shall not be liable for any indirect,
incidental, special, consequential, or punitive damages arising out of or
in connection with your use of the Service or reliance on its content,
even if advised of the possibility of such damages.
```

---

### Finding 8 — No Data Retention Policy
**Severity: 🟡 Medium**

**Evidence:** The `subscribers` table retains records indefinitely. The `unsubscribed_at` field is set on deletion via `DELETE /api/subscribe`, but the record may be hard-deleted (the service code calls `.delete()`, not a soft update). No retention schedule is defined in any document.

**Risk:** GDPR Article 5(1)(e) requires personal data be kept in a form that permits identification of data subjects for no longer than necessary ("storage limitation" principle). Retaining unsubscribed email addresses indefinitely without a suppression-list justification may violate GDPR.

**Remediation:**
- Define a data retention schedule: e.g., active subscriber data retained until unsubscription + 30 days; suppression list (email hashed) retained for up to 2 years to prevent accidental re-subscription.
- Document this in both the Privacy Policy and Terms of Service.
- Consider changing the unsubscribe flow to a **soft delete** (set `unsubscribed_at`, keep row for suppression) rather than a hard delete, and purge after the stated retention window.

---
