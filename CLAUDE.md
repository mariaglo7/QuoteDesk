# QuoteDesk

Instructions for AI coding agents working in this repository. Read this before changing anything.

## What this is

QuoteDesk helps a freelancer turn a client enquiry into a priced offer, a reply message and a PDF in a few minutes.
It started from Maria Glowacka's own quoting work (Design by Maria) and is being generalised for other creative freelancers.
University project: RGU CM3026 Autonomous Coding. The author stays responsible for every change you make.

## Stack and layout

- Vanilla JavaScript ES modules, no build step, no framework.
- `web/` is the app. `web/src/` holds logic modules that never touch the DOM; `web/src/ui/` holds the views; `web/src/pdf/` draws the PDF with jsPDF.
- `hostinger/oferta/` is the optional public offer page with `contact.php`.
- `tests/` uses `node:test`. Fixtures in `tests/fixtures/` are fictional.
- `docs/superpowers/` holds the spec and the implementation plan. The spec is the authority.

## Commands

- `npm test` runs every test. It must pass before any commit.
- `node tools/serve.mjs web 4173` serves the app locally.
- `npm run pack:hostinger` copies `web/src/offerLink.js` into the offer page.

## Rules

- Every code file starts with the comment `Code written with help from Claude (Anthropic)`.
- Prices are computed in `web/src/pricing.js`, never by Claude or in the UI.
- Claude output is untrusted: parse it strictly (`web/src/claude.js`), pass text through `stripDashes`, and insert signed links in code, never through the model.
- No em dash, en dash or spaced hyphen in any user facing text.
- All UI text goes through `t()` in `web/src/i18n.js` with an English translation; the i18n test fails otherwise.
- Render text with `textContent` or the `h()` helper, never `innerHTML`.
- Never commit secrets, API keys, link secrets, `config.php`, real client names or messages.
- Code, identifiers and comments in English.

## How to work

1. Restate the outcome and how it will be checked before writing code.
2. Write or update a failing test first, then the smallest change that passes it.
3. Run `npm test` and read the output; check UI changes in a browser at phone and desktop width.
4. Commit in small steps with a clear message, so each change can be inspected and reverted.
5. Report what you could not verify instead of claiming it works.
