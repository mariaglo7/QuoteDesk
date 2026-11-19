# QuoteDesk Generalisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Native). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make QuoteDesk usable by any creative freelancer, add the market range and "What you gain" features, and ship it as a public GitHub repository with a GitHub Pages demo.

**Architecture:** Same vanilla ES module app. A `profile` object in Settings replaces every Design by Maria constant. A small Claude client adapter gives the same `ask(prompt)` / `askJson(prompt)` interface over the artifact `sample` capability or the Anthropic SDK with the user's key.

**Tech Stack:** as before, plus `@anthropic-ai/sdk` 1.5.0 (jsDelivr ESM) in website mode only.

**Spec:** `docs/superpowers/specs/2026-11-19-generalise-design.md` (with `2026-10-22-wyceny-app-design.md`).

## Global Constraints

- Everything in `CLAUDE.md` applies.
- No Design by Maria name, logo, email or prices in code or defaults. The only exception is the author credit "QuoteDesk, made by Design by Maria" in the app footer and README (Maria, 19 Nov 2026).
- The API key is stored only in localStorage under its own key, never in settings, db or exports.
- Example services ship with `price: null`.
- Neutral default colours: dark `#2B211D`, accent `#2F6FDE`. App interface: brown, grey and white with a blue main accent and a small pink second accent.

## Review Focus

1. A fresh user with no profile and no prices: the app guides to Settings and the PDF stays blocked, no crash.
2. Switching currency changes every amount in UI, PDF, message, link and offer page.
3. Import of a broken or foreign JSON file: clear error, nothing overwritten.
4. A Claude value text that contains a number or guarantee is still shown for review (we never auto send), and the prompt forbids it.
5. Website mode without a key never calls the network for Claude.

---

### Task 1: Profile, currency and generic defaults
**Files:** `web/src/defaults.js`, `web/src/text.js` (`formatMoney(n, currency)`), `web/src/profile.js` (new: `signatureFrom(profile)`, `hasProfile(profile)`), `web/src/pdf/theme.js` (`themeFrom(profile)`), `web/src/pdf/*`, `web/src/claude.js`, `web/src/templates.js`, `web/src/offerLink.js`, tests.
- [ ] Failing tests: `formatMoney(1110, 'GBP') === '£1,110'`, EUR and PLN forms; defaults contain no "Maria" and every example service has `price: null`; signature built from profile; PDF uses profile colours and business name; prompts name the profile owner, not Maria; terms fill `{rounds}`.
- [ ] Implement; remove `web/assets/logo-*.txt` from defaults, logos come from the profile (data URL or asset id).
- [ ] `npm test` passes; commit.

### Task 2: Market range
**Files:** `web/src/pricing.js` (`marketPosition(unitPrice, market) -> 'below'|'within'|'above'|null`), settings and sections UI, i18n, tests.
- [ ] Failing tests for the four outcomes and missing or invalid ranges.
- [ ] Settings fields per service (min, max, source, date); Desk pill per item.
- [ ] Tests pass; browser check; commit.

### Task 3: "What you gain" section
**Files:** `web/src/claude.js` (`buildValuePrompt`, `parseValue`), `web/src/quote.js`, `web/src/pdf/blocks.js` (`drawValue`), `web/src/templates.js`, sections UI, tests.
- [ ] Failing tests: prompt forbids numbers, guarantees and invented facts and covers the AI alternative; `parseValue` keeps 3 to 5 points, strips dashes; PDF draws the section; message includes it.
- [ ] Implement; tests pass; commit.

### Task 4: Website runtime
**Files:** `web/src/ai.js` (new adapter), `web/src/store.js` (export, import), `web/src/ui/settings.js`, `web/src/ui/onboarding.js` (first run), `web/index.html`, tests.
- [ ] Failing tests: export excludes `linkSecret` and the API key; import rejects wrong shape; adapter with no key returns null; adapter builds the SDK request with `claude-opus-5-5` and fallbacks (tested with an injected fake client).
- [ ] Implement; browser check in website mode with and without a key; commit.

### Task 5: Generic offer page
**Files:** `web/src/offerLink.js`, `hostinger/oferta/*`, tests.
- [ ] Payload carries `brand: { name, accent, currency }`; page renders it; PHP mail names the business. Tests and a real PHP run.
- [ ] Commit.

### Task 6: Repository and demo
**Files:** `README.md`, `LICENSE` (MIT for the code), `THIRD_PARTY_NOTICES.md` (Poppins OFL, jsPDF MIT, pdf.js Apache 2.0, Anthropic SDK MIT), `.github/workflows/pages.yml`.
- [ ] Merge `feature/wyceny-app` into `main`, push the public repository, enable Pages, open the demo and check it.
- [ ] Invite j.mcdonald3@rgu.ac.uk (Maria confirms).

### Task 7: Assessment documents (English)
**Files:** `docs/assessment/` with requirements and vocabulary, design decisions and alternatives, AI working log with corrections, testing and evaluation plan with consent form and result tables, responsible practice review, known limitations, video outline.
- [ ] Draft only what is true and verifiable from the repository and this project; mark every place where Maria's real data is needed.

### Task 8: Final review and fixes
- [ ] Fresh reviewer on the whole change, one fix pass with tests, republish artifact and Pages.
