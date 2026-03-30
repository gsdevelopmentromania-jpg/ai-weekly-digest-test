# License Compatibility Audit — AI Weekly Digest
**Date:** 2026-03-30
**Auditor:** Juris (AI Legal Advisor — GitHub Copilot)
**Playbook:** Legal Compliance Audit | Phase: Technical Compliance | Step 2

> ⚠️ **Disclaimer:** This report is AI-assisted guidance, not legal advice. It is produced by an automated agent and does not constitute the opinion of a licensed attorney. For production SaaS deployments, please engage qualified legal counsel to review open-source license obligations, particularly if the product is distributed or if patent exposure is a concern.

---

## Executive Summary

The AI Weekly Digest project has a **low license risk profile**. All runtime and development dependencies use **permissive licenses** (MIT or Apache 2.0). There are **no copyleft (GPL/AGPL) dependencies**, no commercial-use restrictions, and no license incompatibilities detected.

**Two items require attention:** (1) the project's own `package.json` does not declare a license field, and (2) Apache 2.0 dependencies impose a NOTICE/attribution obligation that must be honoured if the project is ever distributed as a binary or SaaS product bundle.

| Severity | Count | Summary |
|----------|-------|---------|
| 🔴 Critical | 0 | No AGPL SaaS-disclosure issues |
| 🟠 High | 0 | No GPL/proprietary mixing |
| 🟡 Medium | 1 | Missing project license declaration |
| 🔵 Low | 2 | Apache 2.0 attribution; patent clause awareness |

---

## 1. Dependency Inventory & License Classification

### 1.1 Runtime Dependencies

| Package | Version | License | Category |
|---------|---------|---------|---------|
| `@supabase/ssr` | ^0.5.2 | Apache 2.0 | Permissive |
| `@supabase/supabase-js` | ^2.47.0 | MIT | Permissive |
| `clsx` | ^2.1.1 | MIT | Permissive |
| `next` | 14.2.18 | MIT | Permissive |
| `react` | ^18.3.1 | MIT | Permissive |
| `react-dom` | ^18.3.1 | MIT | Permissive |
| `tailwind-merge` | ^2.5.4 | MIT | Permissive |
| `zod` | ^3.23.8 | MIT | Permissive |

### 1.2 Development Dependencies

| Package | Version | License | Category |
|---------|---------|---------|---------|
| `@types/node` | ^20.17.6 | MIT | Permissive |
| `@types/react` | ^18.3.12 | MIT | Permissive |
| `@types/react-dom` | ^18.3.1 | MIT | Permissive |
| `@vitest/coverage-v8` | ^1.6.0 | MIT | Permissive |
| `autoprefixer` | ^10.4.20 | MIT | Permissive |
| `eslint` | ^8.57.1 | MIT | Permissive |
| `eslint-config-next` | 14.2.18 | MIT | Permissive |
| `postcss` | ^8.4.49 | MIT | Permissive |
| `tailwindcss` | ^3.4.15 | MIT | Permissive |
| `typescript` | ^5.7.2 | Apache 2.0 | Permissive |
| `vite-tsconfig-paths` | ^4.3.2 | MIT | Permissive |
| `vitest` | ^1.6.0 | MIT | Permissive |

> **Note:** Development-only dependencies (`devDependencies`) are not shipped to end users and carry no distribution obligations in a SaaS model. They are included here for completeness.

---

## 2. Checklist Analysis

### 2.1 Copyleft Licenses (GPL / AGPL)
**Result: ✅ CLEAR — No Issues Found**

No dependency uses GPL-2.0, GPL-3.0, AGPL-3.0, LGPL, or any copyleft variant. The most significant copyleft risk in SaaS products is AGPL-3.0, which requires source disclosure for software *accessed over a network*. This risk does not apply here.

---

### 2.2 License Compatibility
**Result: ✅ CLEAR — All Licenses Compatible**

All licenses in use are MIT or Apache 2.0. Both are **OSI-approved permissive licenses** and are universally compatible with each other and with proprietary/commercial products:

- **MIT + MIT:** No conflict.
- **MIT + Apache 2.0:** Compatible. Apache 2.0 adds patent grant and termination clauses not present in MIT, but these do not conflict.
- **Apache 2.0 + Proprietary:** Compatible — Apache 2.0 explicitly permits use in proprietary/commercial software.

---

### 2.3 Attribution Requirements
**Result: 🔵 LOW — Action Required for Distribution**

Both MIT and Apache 2.0 have attribution obligations:

**MIT License:**
- Requires the copyright notice and permission notice to be included *in all copies or substantial portions of the Software*.
- In a pure SaaS model (no binary distribution to users), this obligation is typically not triggered.

**Apache 2.0 License (`@supabase/ssr`, `typescript`):**
- Requires reproduction of the NOTICE file (if one exists) in any distribution.
- Requires that any modified files carry prominent notices of the changes made.
- Again, in a SaaS model without binary distribution, obligations are reduced, but internal policies should be documented.

**Affected packages:** `@supabase/ssr`, `typescript`

**Remediation (Low Priority):**
- Maintain a `THIRD_PARTY_LICENSES` or `NOTICES` file in the repository listing all dependencies and their license texts. This is best practice even for pure SaaS products.
- If the project ever distributes a compiled/bundled client (e.g., Electron app, mobile wrapper, downloadable CLI), full attribution obligations activate.

---

### 2.4 Commercial Use Restrictions
**Result: ✅ CLEAR — No Restrictions**

No dependency imposes restrictions on commercial use. Both MIT and Apache 2.0 explicitly permit commercial use without royalty or restriction. Common commercial-restricting licenses (BUSL, Commons Clause, SSPL) are **not present** in this dependency tree.

---

### 2.5 Patent Clauses
**Result: 🔵 LOW — Awareness Required**

**Apache 2.0 includes a patent grant and a patent retaliation clause:**
- **Grant:** Contributors to Apache-licensed code grant a royalty-free patent license to users of the software for any patents necessarily infringed by their contributions.
- **Retaliation clause:** If a user of the software initiates patent litigation against any contributor (alleging that the software itself infringes), their patent license from that contributor is terminated automatically.

**Affected packages:** `@supabase/ssr`, `typescript`

This is generally a *positive* clause for users — it provides patent protection from the original contributors. However:
- If AI Weekly Digest or its parent entity were to assert patents against the contributors of these packages, the company's right to use those packages could be terminated.
- This is a standard clause and is not considered a practical risk for normal SaaS operations.

**Remediation (Informational):** Ensure internal IP counsel is aware of this clause if the company pursues an aggressive patent strategy.

---

## 3. Project License Declaration

### 3.1 Missing License Field in package.json
**Severity: 🟡 MEDIUM**

The project `package.json` contains `"private": true` but does **not** declare a `"license"` field. There is also no `LICENSE` file detected in the repository root.

**Risks:**
- In the absence of an explicit license, contributors and auditors cannot determine the terms under which the project code is shared or used internally.
- If the project is ever open-sourced or shared with partners/investors, the absence of a license creates ambiguity — technically, no one is granted permission to use or modify the code.
- Some automated security/compliance scanners will flag `UNLICENSED` as a warning.

**Remediation:**
1. If proprietary: Add `"license": "UNLICENSED"` to `package.json` (explicitly signals closed-source).
2. If planning to open-source: Choose a license (MIT recommended for maximum compatibility given the dependency stack) and add a `LICENSE` file to the repo root.
3. Add a `THIRD_PARTY_LICENSES.md` file listing dependency licenses for transparency.

---

## 4. Transitive Dependencies

This audit covers only **direct dependencies** as declared in `package.json`. Transitive (indirect) dependencies may introduce additional licenses not identified here.

**Recommendation:**
Run an automated license scanner against the full `node_modules` tree before each major release. Suggested tools:
- [`license-checker`](https://www.npmjs.com/package/license-checker) — `npx license-checker --summary`
- [`licensee`](https://www.npmjs.com/package/licensee) — policy-based license gating
- GitHub's built-in dependency review action (if using GitHub Actions)

A one-time manual review of `package-lock.json` would also reveal the full transitive tree (~hundreds of packages), which is outside the scope of this static audit.

---

## 5. Summary of Findings & Remediation Plan

| # | Finding | Severity | Action | Owner |
|---|---------|----------|--------|-------|
| L-01 | No `license` field in `package.json`; no `LICENSE` file | 🟡 Medium | Add `"license": "UNLICENSED"` to `package.json` + create `LICENSE` file | Engineering |
| L-02 | Apache 2.0 attribution obligations (`@supabase/ssr`, `typescript`) | 🔵 Low | Create `THIRD_PARTY_LICENSES.md`; review if binary distribution ever occurs | Engineering / Legal |
| L-03 | Apache 2.0 patent retaliation clauses | 🔵 Low | Inform IP counsel; no action required for standard SaaS operations | Legal |
| L-04 | Transitive dependencies not audited | 🔵 Low | Run `npx license-checker --summary` before first production release | Engineering |

---

## 6. Positive Findings

- ✅ **No AGPL dependencies** — no network-triggered source disclosure obligation.
- ✅ **No GPL mixing** — no copyleft contamination of proprietary code.
- ✅ **No commercial-use-restricted licenses** — SaaS monetisation is unobstructed.
- ✅ **Highly uniform license stack** — predominantly MIT, making legal review simple.
- ✅ **No dual-licensed "open-core" traps** — no packages with a free tier / paid commercial tier structure (e.g., Commons Clause variants) that could impose fees at scale.

---

## 7. Next Steps

1. **Immediate (Engineering):** Add `"license": "UNLICENSED"` to `package.json`.
2. **Before Launch:** Run `npx license-checker --csv > docs/legal/third-party-licenses.csv` and commit the output.
3. **Before Launch:** Create a `THIRD_PARTY_LICENSES.md` listing all Apache 2.0 dependencies and their copyright notices.
4. **Ongoing:** Integrate license scanning into CI/CD pipeline (GitHub Actions dependency review recommended).
5. **If Open-Sourcing:** Engage legal counsel to select and apply an appropriate OSS license.

---

*Report generated by Juris — AI Legal Advisor (GitHub Copilot). This is AI-assisted guidance only, not legal advice. For binding legal determinations, consult a qualified attorney specialising in software and open-source licensing.*
