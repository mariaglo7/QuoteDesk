# Wyceny Design by Maria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (Maria chose Native) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A quoting app for Design by Maria: paste a client message, build a modular priced offer, get a client message (PL/EN), a PDF in the style of the Harbour Light Co offer and a signed online summary link with a "Chcę rozmawiać" button.

**Architecture:** A vanilla JS claude.ai Artifact (`web/index.html` plus ES modules in `web/src/`, published together via the Artifact `files` map) using the `sample`, `db`, `assets`, `user` and `downloads` capabilities. All business logic and PDF layout live in modules with no DOM access, tested with `node --test`. A separate static page plus `contact.php` on Hostinger (`designbymaria.co.uk/oferta/`) renders the offer summary from the URL fragment and emails Maria.

**Tech Stack:** Vanilla JS (ES modules), jsPDF 2.5.1 (cdnjs UMD in the browser, npm devDependency in tests), Poppins TTF embedded as base64, Node 24 `node:test`, WebCrypto HMAC SHA256, CompressionStream `deflate-raw`, PHP on Hostinger.

**Spec:** `docs/superpowers/specs/2026-10-22-wyceny-app-design.md`
**Visual reference:** `/Users/mariaglowacka/Desktop/DESIGN_BY/Oferty/reference_offer.pdf` (4 pages, A4, Poppins Light/Medium/SemiBold)

## Global Constraints

- University project (RGU): every code file (JS, PHP, CSS, HTML, tests) starts with the comment `Code written with help from Claude (Anthropic)` in that language's comment syntax.
- UI copy in Polish; code, identifiers and code comments in English.
- No em dash, en dash or spaced hyphen in any generated or UI text (`stripDashes` applied to every Claude output).
- Font: Poppins only (no Caveat). Colours: brown `#1E1613`, pink `#FF7AE5`, PDF background pure white.
- Money in whole pounds, displayed as `£1,110` (en-GB grouping), always with the £ sign.
- Prices are computed by code, never by Claude.
- Offer valid 7 days. Follow up after 3 days. 2 revision rounds included, extra round fixed £40. Rush +25%.
- Client type multipliers: sole 1.0, local 1.2, intermediary 1.2, medium 1.4, large 1.6.
- Fixed, never multiplied: post £35, website care £50/month.
- Bundle price: sum × 0.9, down to the nearest amount ending in 9.
- Hosting and domain never included in a website price.
- Contact email to `info@designbymaria.co.uk`. Signature: Maria, Design by Maria, info@designbymaria.co.uk, designbymaria.co.uk.
- PDF filename: `<slug>_oferta_<YYYYMMDD>.pdf`, slug = company lowercased, diacritics folded, all non alphanumerics removed.
- No bank details anywhere in the app, PDF, link or server files.
- Artifact CSP: scripts only from cdnjs; no fetch to other hosts; no `window.print`, `alert`, `confirm`.

## Review Focus

1. Float error in pricing: £200 × 1.2 must give £240, not £245 after rounding up to £5 (test in Task 1).
2. Claude returns an unknown service id, a non numeric qty or invalid JSON: the item becomes "Do sprawdzenia" with no price and PDF/link/message stay disabled until priced (tests in Tasks 1 and 4).
3. PDF page flow: a long card, a long company name or many sections must never clip, overlap or leave a section title alone at the page bottom (tests in Task 6).
4. Polish characters (ą ć ę ł ń ó ś ź ż) survive in the PDF text and are folded in the filename (tests in Tasks 2 and 6).
5. A link truncated or edited when pasted into Instagram must show "Ten link jest nieprawidłowy", and a Harbour Light sized offer URL must stay under 2000 characters (tests in Task 3). Double clicking "Chcę rozmawiać" sends one email (Task 10).

---

## File Structure

```
App/
  package.json                 type: module; scripts: test, pack:hostinger
  web/
    index.html                 artifact page: <title>, styles, jsPDF script, module entry
    styles.css                 tokens + layout (desktop two columns, phone tabs)
    fonts/poppins-{light,medium,semibold}.txt   base64 TTF
    assets/logo-dark.txt, assets/logo-white.txt base64 PNG from DESIGN_BY/Logo
    src/defaults.js            DEFAULT_SETTINGS
    src/pricing.js             priceItem, calcQuote, roundUp5, bundlePrice
    src/text.js                stripDashes, slugify, offerFileName, formatMoney, addDays, toISODate
    src/offerLink.js           makeOfferPayload, encodeOffer, decodeOffer, signPayload, verifyPayload, buildOfferUrl, parseOfferUrl
    src/claude.js              buildExtractPrompt, parseExtraction, buildCopyPrompt, parseCopy, buildMessagePrompt, buildFollowUpPrompt
    src/templates.js           fallbackMessage, fallbackFollowUp
    src/status.js              effectiveStatus, isFollowUpDue
    src/pdf/theme.js           tokens (sizes, colours, margins)
    src/pdf/layout.js          createFlow: cursor, measure, page breaks, header
    src/pdf/blocks.js          drawCover, drawSectionHead, drawOptionCards, drawServiceRows, drawBundleRows, drawBundleBanner, drawInfoCards, drawNote, drawTerms, drawHostingerPage
    src/pdf/render.js          renderOfferPdf
    src/store.js               createStore
    src/ui/app.js              boot, router, banners
    src/ui/inbox.js            paste view
    src/ui/desk.js             desk shell + Message/PDF/Link tabs
    src/ui/sections.js         section editors (options, services, bundles)
    src/ui/quotes.js           quotes list
    src/ui/settings.js         settings view
  hostinger/oferta/
    index.html, offer-page.js, offer.js (copied from web/src/offerLink.js by pack:hostinger)
    contact.php, config.sample.php, INSTRUKCJA.md
  tests/
    pricing, text, offerLink, claude, templates, status, pdf-layout, pdf-render (*.test.js), fixtures/reference.js
```

Shared data shapes (used by every task):

```js
// Settings (db doc data/users/<uid>/settings)
{ clientTypes: [{ id: 'sole'|'local'|'intermediary'|'medium'|'large', labelPl, labelEn, multiplier }],
  rushRate: 0.25, extraRoundPrice: 40, bundleDiscount: 0.1, depositRate: 0.5, validityDays: 7, followUpDays: 3,
  priceList: [{ id, namePl, nameEn, descPl, descEn, bulletsPl: [], bulletsEn: [], price, priceFrom: false,
                unit: 'item'|'page'|'month', category: 'branding'|'print'|'website'|'social'|'care'|'other', applyMultiplier }],
  terms: { pl: [{ key, bold, text }], en: [...] },   // keys: payment, revisions, rights, print, hosting
  infoCards: { pl: { included, files }, en: {...} }, hostingerPl, hostingerEn, signature,
  offerBaseUrl: 'https://designbymaria.co.uk/oferta/', linkSecret: '' }

// Priced item: used inside services sections and as options
Item = { id, serviceId: string|null, name, subtitle: '', description: '', bullets: [], qty: 1,
         unitPriceOverride: number|null, priceFrom: false, subNote: '', sourceQuote: string|null }

// Quote (db doc data/users/<uid>/q_<id>, field kind: 'quote')
{ id, kind: 'quote', createdAt, sentAt: null|ISO,
  status: 'draft'|'sent'|'interested'|'agreed'|'deposit_paid'|'rejected',
  client: { name, company, email }, lang: 'pl'|'en', address: 'wy'|'ty', clientTypeId, rush: false, deadline: null|ISO date,
  needs: [{ label, text }], coverAssetId: null, time: '',
  sections: [
    { id, type: 'options', eyebrow, title, intro, note, recommendedId, items: [Item] },   // 2 or 3 items
    { id, type: 'services', eyebrow, title, intro, note, items: [Item] },
    { id, type: 'bundles', eyebrow, title, intro, note, style: 'rows'|'banner',
      bundles: [{ id, name, itemIds: [Item.id], priceOverride: number|null, caption: '' }] } ],
  sourceMessage: '', missing: [], message: '' }

// Totals (calcQuote result)
{ items: { [itemId]: { unitPrice: number|null, lineTotal: number|null, monthly, priceFrom, needsPrice } },
  bundles: { [bundleId]: { fullPrice, price } },
  estimate: { oneOff, monthly },   // recommended options + services
  needsPrice: boolean, hasWebsite: boolean, hasPrint: boolean }
```

---

### Task 1: Project setup, defaults and pricing

**Files:**
- Create: `package.json`, `.gitignore` (`node_modules/`, `hostinger/oferta/config.php`), `web/src/defaults.js`, `web/src/pricing.js`
- Test: `tests/pricing.test.js`

**Interfaces:**
- Produces: `DEFAULT_SETTINGS` (shape above; priceList holds post and care; terms text per spec section 5 and the reference offer page 4: "Płatność przelewem: 50% przed startem, 50% przy przekazaniu plików, termin 7 dni.", "Poprawki: dwie rundy w cenie, każda kolejna £40.", "Prawa do projektów przechodzą na Was po pełnej płatności.", "Druk zamawiacie w wybranej drukarni. Przygotuję pliki pod jej wymagania.", plus EN versions and a hosting line); `roundUp5(x): number`; `bundlePrice(full, settings): number`; `priceItem(item, quote, settings)`; `calcQuote(quote, settings): Totals`.

- [ ] **Step 1:** `git init`, create `package.json` with `"type": "module"`, scripts `"test": "node --test tests/"` and `"pack:hostinger": "cp web/src/offerLink.js hostinger/oferta/offer.js"`; `npm i -D jspdf@2.5.1`.
- [ ] **Step 2: Write failing tests** in `tests/pricing.test.js`:

```js
test('roundUp5 ignores float noise', () => { assert.equal(roundUp5(200 * 1.2), 240); assert.equal(roundUp5(241), 245); });
test('multiplier by client type', ...);        // 200, 'large' -> 320
test('fixed items ignore multiplier and rush', ...); // post x4, 'large', rush -> 140
test('rush adds 25% then rounds', ...);        // 200, 'local', rush -> 300
test('override wins and is not multiplied', ...); // 99, 'large' -> 99
test('unit month is monthly', ...);
test('page unit multiplies by qty', ...);      // 120 x5 -> 600
test('priceFrom flows from service to totals', ...);
test('unknown service needs price', ...);      // serviceId null, no override -> needsPrice true
test('bundle prices match the Harbour Light offer', () => { assert.equal(bundlePrice(355, S), 319); assert.equal(bundlePrice(455, S), 409); assert.equal(bundlePrice(834, S), 749); });
test('bundle override wins', ...);
test('estimate uses recommended option and services', ...);
test('hasWebsite only for category website, hasPrint for print', ...); // care alone -> false
```

- [ ] **Step 3:** Run `npm test`. Expected: FAIL, module not found.
- [ ] **Step 4: Implement.** `roundUp5` = `Math.ceil(Math.round(x * 100) / 100 / 5) * 5`. `bundlePrice`: `t = Math.floor(full * (1 - bundleDiscount)); return t - ((t - 9) % 10 + 10) % 10`. Item unit price = override ?? (applyMultiplier ? roundUp5(price × multiplier × (rush ? 1 + rushRate : 1)) : price).
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit `feat: pricing engine and default settings`.

### Task 2: Text helpers

**Files:**
- Create: `web/src/text.js`
- Test: `tests/text.test.js`

**Interfaces:**
- Produces: `stripDashes(s)`, `slugify(s)`, `offerFileName(company, date)`, `formatMoney(n)`, `toISODate(d)`, `addDays(iso, n)`.

- [ ] **Step 1: Write failing tests:**

```js
assert.equal(stripDashes('Cześć — oto oferta – razem £970'), 'Cześć, oto oferta, razem £970');
assert.equal(stripDashes('Logo - 3 koncepcje'), 'Logo, 3 koncepcje');
assert.equal(stripDashes('e-mail i follow-up'), 'e-mail i follow-up');
assert.equal(slugify("Pots 'n Pans"), 'potsnpans');
assert.equal(slugify('Łódź Żabka Bakery'), 'lodzzabkabakery');
assert.equal(offerFileName('Bakehouse Aberdeen', new Date('2026-10-22')), 'bakehouseaberdeen_oferta_20261022.pdf');
assert.equal(offerFileName('', new Date('2026-10-22')), 'klient_oferta_20261022.pdf');
assert.equal(formatMoney(1110), '£1,110');
assert.equal(addDays('2026-10-22', 7), '2026-10-29');
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.** `slugify`: map `ł→l, Ł→l`, `normalize('NFD')`, strip combining marks, lowercase, remove `[^a-z0-9]`. `stripDashes`: replace `\s*[—–]\s*` and ` - ` with `, `, collapse doubles. Dates in UTC.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: text helpers`.

### Task 3: Signed offer links

**Files:**
- Create: `web/src/offerLink.js`, `tests/fixtures/reference.js` (the reference offer as a Quote with its real text and prices, used by Tasks 3 and 6)
- Test: `tests/offerLink.test.js`

**Interfaces:**
- Consumes: Totals, `addDays`.
- Produces: `makeOfferPayload(quote, totals, settings, today): OfferPayload` where `OfferPayload = { v: 1, id, company, name, lang, date, exp, sections: [{ t: title, k: type, i: [{ n: name, p: price, f: priceFrom, m: monthly, r: recommended }] }] }` (names and prices only, no descriptions); `encodeOffer(p): Promise<string>`; `decodeOffer(s): Promise<OfferPayload>` throwing `Error('invalid')`; `signPayload(encoded, secret): Promise<string>` hex; `verifyPayload(encoded, sig, secret): Promise<boolean>`; `buildOfferUrl(baseUrl, encoded, sig)` = `${baseUrl}#${encoded}.${sig}`; `parseOfferUrl(hash): { encoded, sig } | null`. Only `globalThis.crypto.subtle`, `CompressionStream`, `TextEncoder`, so it runs unchanged in browsers and Node.

- [ ] **Step 1: Write failing tests:**

```js
test('round trip', ...);
test('valid signature verifies', ...);
test('edited payload fails', ...);
test('truncated link is rejected', ...);  // parseOfferUrl null, decodeOffer rejects
test('exp is date + 7 days', ...);
test('reference sized offer url under 2000 chars', ...);
test('payload has no descriptions, source message or bank data', ...);
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.** JSON, deflate-raw, base64url; 64 char hex signature; `parseOfferUrl` requires exactly one `.`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: signed offer links`.

### Task 4: Claude prompts, fallback templates and status rules

**Files:**
- Create: `web/src/claude.js`, `web/src/templates.js`, `web/src/status.js`
- Test: `tests/claude.test.js`, `tests/templates.test.js`, `tests/status.test.js`

**Interfaces:**
- Consumes: Settings, Quote, Totals, `stripDashes`, `formatMoney`.
- Produces:
  - `buildExtractPrompt(message, settings, today)`; `parseExtraction(raw, settings, today): Extraction` where `Extraction = { name, company, lang, address, clientTypeId, sections: Quote['sections'], deadline, rush, budget, missing: [], highlights: [] }`.
  - `buildCopyPrompt({ quote, settings })`; `parseCopy(raw, quote): Quote` merging `needs`, section `eyebrow/title/intro/note`, item `description/subtitle/bullets`, all through `stripDashes`; never touches prices or ids.
  - `buildMessagePrompt({ quote, totals, settings, offerUrl, tone: 'default'|'shorter'|'warmer' })`, `buildFollowUpPrompt({ quote, totals, settings, offerUrl })`.
  - `fallbackMessage(...)`, `fallbackFollowUp(...)`: PL and EN by `quote.lang`.
  - `effectiveStatus(quote, now, settings)` adding `'expired'`; `isFollowUpDue(quote, now, settings)`.

- [ ] **Step 1: Write failing tests:**

```js
test('extract prompt lists every price list id and asks for JSON only', ...);
test('unknown serviceId becomes null with sourceQuote kept', ...);
test('qty "dwa" or 0 becomes 1', ...);
test('invalid lang defaults to en, invalid client type to sole', ...);
test('deadline under 7 days sets rush true', ...);
test('non object raw returns empty extraction, does not throw', ...);
test('options section with fewer than 2 items becomes services', ...);
test('parseCopy strips dashes and cannot change prices or add items', ...);
test('message prompt has prices, 2 revision rounds, offerUrl, signature, no dashes rule, do not change prices', ...);
test('fallback PL/EN contain price range, link, signature, no dashes', ...);
test('sent 8 days ago is expired; interested and agreed never expire', ...);
test('follow up due after 3 days only when sent', ...);
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.** Prompts carry Maria's voice (polite, concrete, no filler), the reference copy style (short sentences, benefits for this client), the `wy`/`ty` form, the no dash rule and "reply only with JSON matching this schema" or "reply only with the message text".
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: claude prompts, fallback templates, status rules`.

### Task 5: PDF layout engine

**Files:**
- Create: `web/fonts/poppins-light.txt`, `poppins-medium.txt`, `poppins-semibold.txt`, `web/assets/logo-dark.txt`, `logo-white.txt`, `web/src/pdf/theme.js`, `web/src/pdf/layout.js`
- Test: `tests/pdf-layout.test.js`

**Interfaces:**
- Produces: `THEME` (A4 pt; margin 57; content width 481; cover panel x 419; colours ink `#1E1613`, muted `#6F625C`, line `#E8E3E0`, pink `#FF7AE5`; sizes coverTitle 34, sectionTitle 23, intro 12, body 9.5, eyebrow 7.5 with charSpace 2, cardRadius 12); `createFlow({ doc, header })` returning `{ y, ensure(height), newPage(), wrap(text, font, size, width): string[], textHeight(lines, size, leading), pageCount }`. `ensure` starts a new page when the block does not fit; `newPage` draws the header (small logo, "Oferta dla X", "Strona N", hairline).

- [ ] **Step 1:** Download Poppins Light, Medium and SemiBold TTF from `https://github.com/google/fonts/raw/main/ofl/poppins/`, save base64 with `base64 -i` into `web/fonts/`. Export `DESIGN_BY/Logo/LOGOd.png` and `LOGO_white.png` (check which is dark and which is white by viewing them) at 600px wide with `sips`, base64 into `web/assets/`.
- [ ] **Step 2: Write failing tests:**

```js
test('ensure keeps cursor when block fits', ...);
test('ensure starts a new page and draws the header when block does not fit', ...);
test('wrap respects width with polish text', ...);
test('page numbers in header are sequential from 2', ...);
```

- [ ] **Step 3:** Run `npm test`. Expected: FAIL.
- [ ] **Step 4: Implement** with jsPDF `splitTextToSize` and `getTextDimensions`.
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit `feat: pdf layout engine`.

### Task 6: PDF blocks and full render

**Files:**
- Create: `web/src/pdf/blocks.js`, `web/src/pdf/render.js`
- Test: `tests/pdf-render.test.js`

**Interfaces:**
- Consumes: `createFlow`, `THEME`, Quote, Totals, Settings, `formatMoney`, `addDays`, `tests/fixtures/reference.js`.
- Produces: `renderOfferPdf({ jsPDF, fonts: { light, medium, semibold }, logos: { dark, white }, coverImage: dataUrl|null, quote, totals, settings, offerUrl, today, compress = true }): doc`. PL/EN labels ("Polecam", "/ mies.", "od", "jednorazowo", "W cenie", "Pliki", "Czas", "Warunki", "Czego potrzebujecie", "Strona", "Oferta dla", "Dla:") in a dictionary in `blocks.js`.

- [ ] **Step 1: Write failing tests** (`compress: false` so text is searchable in `doc.output()`):

```js
test('reference fixture renders 4 pages', ...);
test('cover has company, client name, needs rows, valid until date', ...);
test('polish characters kept', ...);
test('cards in a row share one height', ...);       // drawOptionCards returns heights
test('long company name wraps and fits the left column', ...);
test('section head moves with its first block, never alone at page bottom', ...);
test('card taller than remaining space moves to next page', ...);
test('terms hide print and hosting when not relevant', ...);
test('website offer adds hostinger page', ...);
test('EN quote uses English labels', ...);
test('one service quote renders cover + 1 page', ...);
test('no bank details', ...);
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** every block per spec section 5, matching the reference: pink dot after titles, pink bullet dots in cards, hairlines between bullets and rows, dark recommended card with pink "Polecam" pill overlapping its top edge, strikethrough via a drawn line, bundle banner with two column check list, three info cards, two column Warunki. Cover image fits the dark panel preserving aspect ratio; panel lists section titles at the bottom.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5: Compare with the reference.** Write `reference_preview.pdf` from the fixture into the scratchpad, render with `swift` PDFKit (`render.swift`, as used for the reference), view every page next to the reference PNGs, fix spacing and sizes until they match closely.
- [ ] **Step 6:** Commit `feat: pdf offer in reference style`.

### Task 7: Store, app shell and Settings

**Files:**
- Create: `web/index.html`, `web/styles.css`, `web/src/store.js`, `web/src/ui/app.js`, `web/src/ui/settings.js`

**Interfaces:**
- Consumes: `DEFAULT_SETTINGS`.
- Produces: `createStore(): Promise<Store>` with `{ mode: 'db'|'local', getSettings(), saveSettings(s), listQuotes(), saveQuote(q), deleteQuote(id), uploadCover(blob): id, coverDataUrl(id) }`. In `db` mode paths are `data/users/${uid}/settings` and `data/users/${uid}/q_${id}` (query `where('kind','==','quote')`), covers through `assets`. When `window.claude` is absent or `use('db')` resolves `null`, use `localStorage` (every access in try/catch) and `mode: 'local'`, covers as downscaled data URLs. On first run with no `linkSecret`, generate 32 random bytes hex and save.
- Router in `app.js`: views `inbox`, `desk`, `quotes`, `settings`; banner "Zapis tylko na tym urządzeniu" in local mode; empty price list banner linking to Settings.

- [ ] **Step 1:** Read `db.d.ts`, `user.d.ts`, `sample.d.ts`, `downloads.d.ts`, `assets.d.ts` in `/private/tmp/claude-501/bundled-skills/2.1.299/636500f95faf8264e486df4b498ba859/artifact-capabilities/0.2.89/` (if the path is gone, reload the `artifact-capabilities` skill) and follow them exactly.
- [ ] **Step 2: Implement** `index.html` (`<title>Wyceny Design by Maria</title>`, Poppins from Google Fonts, `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`, module entry), `styles.css` (tokens with light and dark blocks per the artifact contract, 16px safe area gutters, two columns from 860px, tabs below), `store.js`, `app.js`, `settings.js` (price list rows with descriptions and bullets, multipliers, rush, extra round, bundle discount, terms, info cards, Hostinger guide, signature, offer base URL, link secret with Copy).
- [ ] **Step 3: Verify** by serving `web/` locally in the browser pane: local mode banner, add a price list item, reload, it persists. Check 375px and 1280px.
- [ ] **Step 4:** Commit `feat: app shell, store and settings`.

### Task 8: Inbox and Desk

**Files:**
- Create: `web/src/ui/inbox.js`, `web/src/ui/desk.js`, `web/src/ui/sections.js`

**Interfaces:**
- Consumes: everything in `claude.js`, `templates.js`, `pricing.js`, `pdf/render.js`, `offerLink.js`, `offerFileName`, Store.
- Produces: `renderInbox(root, ctx)`, `renderDesk(root, ctx, quoteId)`, `renderSections(root, quote, ctx, onChange)` where `ctx = { store, settings, sample: fn|null, downloads: obj|null, navigate(view, id) }`.

- [ ] **Step 1: Implement Inbox:** **Przeczytaj** calls `sample.json(buildExtractPrompt(...))` on click only; success creates a draft Quote and opens Desk with highlighted fragments above the form; `not_granted` or null sample shows "Claude niedostępny, uzupełnij ofertę ręcznie" and opens an empty Desk; `rate_limited` shows "Spróbuj za chwilę". **Zacznij od zera** opens an empty Desk.
- [ ] **Step 2: Implement Desk and sections editor** per spec 4.2: add, remove and reorder sections (buttons up and down, no drag library); item picker from the price list prefills name, description and bullets; **Napisz teksty** via `buildCopyPrompt`/`parseCopy`; "Do sprawdzenia" items with a price input; needs rows; cover upload; Message tab (tones, PL/EN, Copy with select fallback, `stripDashes`, fallback template); PDF tab (`doc.output('bloburl')` in an `<iframe>`, **Pobierz PDF** via `downloads.save`); Link tab; PDF, Link and Message disabled while `totals.needsPrice`; **Oznacz jako wysłaną**. Autosave debounced 800 ms. Regenerate the preview debounced 800 ms, only while the PDF tab is open.
- [ ] **Step 3: Verify** in the browser pane (local mode): rebuild the first two Harbour Light sections by hand, preview shows the same layout, link copies, status changes. Check 375px and 1280px.
- [ ] **Step 4:** Commit `feat: inbox and desk`.

### Task 9: Quotes list

**Files:**
- Create: `web/src/ui/quotes.js`

**Interfaces:**
- Consumes: Store, `effectiveStatus`, `isFollowUpDue`, `buildFollowUpPrompt`, `fallbackFollowUp`, `calcQuote`, `formatMoney`.
- Produces: `renderQuotes(root, ctx)`.

- [ ] **Step 1: Implement:** newest first, company, estimate (`£749 + £199/mies.`), status pill, status menu; "3 dni bez odpowiedzi" flag with **Napisz follow up** and Copy; row opens Desk; empty state "Brak ofert. Wklej pierwszą wiadomość od klienta."
- [ ] **Step 2: Verify** in the browser pane with two quotes, one with `sentAt` 4 days back: flag and follow up appear.
- [ ] **Step 3:** Commit `feat: quotes list with follow ups`.

### Task 10: Hostinger offer page

**Files:**
- Create: `hostinger/oferta/index.html`, `offer-page.js`, `contact.php`, `config.sample.php`, `INSTRUKCJA.md`
- Generated: `hostinger/oferta/offer.js` via `npm run pack:hostinger`
- Test: `tests/contact-vectors.test.js`

**Interfaces:**
- Consumes: `parseOfferUrl`, `decodeOffer`.
- Produces: `POST contact.php` with JSON `{ p, s }` returning `{ ok: true }` or `{ ok: false, error: 'invalid'|'expired' }`.

- [ ] **Step 1:** Implement page: decode hash, render summary in the PDF style (PL/EN), **Chcę rozmawiać** disabled after first click, then thank you text; invalid hash shows "Ten link jest nieprawidłowy" / "This link is invalid"; past `exp` shows the expired message and no button.
- [ ] **Step 2:** Implement `contact.php`: `hash_hmac('sha256', $p, SECRET)` + `hash_equals`; `gzinflate` of base64url; reject past `exp`; dedupe via `sent/<id>.json` (dir with `.htaccess` deny) and skip mail if present; `mail(MAIL_TO, "<company> chce porozmawiać o ofercie", body, "From: info@designbymaria.co.uk")`. `config.sample.php` defines `SECRET` and `MAIL_TO = 'info@designbymaria.co.uk'`.
- [ ] **Step 3:** `tests/contact-vectors.test.js` generates a valid, an edited and an expired link into `hostinger/test-links.txt` (no PHP locally, so these are checked on the server).
- [ ] **Step 4:** Write `INSTRUKCJA.md` in Polish: create `config.php`, paste the secret from Settings, upload to `public_html/oferta/` in Hostinger File Manager, open the three test links, confirm one email for a double click.
- [ ] **Step 5: Verify** locally with `npx serve hostinger`: valid renders, edited shows invalid, expired shows expired.
- [ ] **Step 6:** Commit `feat: hostinger offer page`.

### Task 11: Publish and final check

- [ ] **Step 1:** Run `npm test`. Expected: all PASS.
- [ ] **Step 2:** Publish `web/index.html` as an Artifact with `files` mapping `styles.css`, `src/**`, `fonts/*.txt`, `assets/*.txt`, `capabilities: { sample: {}, db: {}, assets: {}, user: {}, downloads: true }`, icon `invoice`.
- [ ] **Step 3:** Functional pass: save settings in the published app, one `ArtifactData list`, report what could and could not be read.
- [ ] **Step 4:** Request a whole project review, then ask Maria to try 3 real messages and the Hostinger test links; fix what she reports.
- [ ] **Step 5:** Commit `chore: publish v1`.
