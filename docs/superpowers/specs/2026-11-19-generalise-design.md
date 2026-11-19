# QuoteDesk for other freelancers: design addendum

Date: 19 November 2026. Extends `2026-10-22-wyceny-app-design.md`; where they differ, this file wins.
Approved by Maria in conversation on 19 November 2026.

## Why

- Pitch feedback (15 October 2026): the app works, but it must help other people, not only Maria.
- Maria's own account (`docs/evidence/01-problem-evidence-TEMPLATE.md`): the hardest parts are deciding a price without overcharging, losing clients who think "AI will do it", the time spent on market research, and turning everything into words.

## Intended users

Creative freelancers who quote custom work: graphic designers, web designers, photographers, social media managers. Maria is the first user.

## Scope

### 1. Business profile (new Settings section and a first run screen)

- Business name, owner name, email, website. The signature is built from these.
- Logo for light backgrounds and an optional logo for dark backgrounds. Without the dark logo, the dark cover panel shows the business name in white.
- PDF colours: a dark colour and an accent colour. Defaults are neutral (charcoal and teal); Maria sets her brown and pink in her own Settings.
- Currency: GBP, EUR or PLN, formatted with `Intl.NumberFormat` (`£1,110`, `1110 €`, `1110 zł`).
- Revision rounds included and the price of an extra round.
- Offer page address. Empty means the Link tab is hidden; PDF and message still work.
- Nothing about Design by Maria remains in code: no logo, name, email or prices.

### 2. Start for a new person

- Example services for creative freelancers (logo, social media post, website page, flyer, photo session, monthly social media care) with **no prices**. Until a price is entered they show "To check" and block the PDF.
- Generic terms using `{rounds}`, `{extraRound}` and the business name.
- Claude prompts use the profile (business and owner name), never "Maria".

### 3. Market range per service (answers "I never want to overcharge")

- In the price list each service can store a market range found by the user: minimum, maximum, source and date.
- On the Desk each priced item shows where the price sits: below, within or above the range, or nothing when no range exists.
- The app and Claude never invent market prices.

### 4. "What you gain" section (answers "AI will make my website")

- New offer section type `value`: a short title and 3 to 5 points about what this client gains, written by Claude from the enquiry, client type and services, and editable.
- The prompt asks Claude to explain the value of human work (fit to the brand and goals, strategy, responsibility, revisions, support) without attacking AI tools.
- Claude must not promise numbers or results (no "30% more sales") and must not invent facts about the client.
- The section is drawn in the PDF and summarised in the message.

### 5. Two ways to run, one code base

- **On claude.ai** (Maria): unchanged, Claude through `sample`, data in the private `db`.
- **Website** (GitHub Pages, for anyone): data in the browser's localStorage, with **Export** and **Import** of a JSON backup in Settings. Claude through the user's own Anthropic API key, entered in Settings, kept only in that browser, never exported or saved to `db`. Without a key the app uses the fixed templates. Calls use the official SDK `@anthropic-ai/sdk` 1.5.0 from jsDelivr with `dangerouslyAllowBrowser: true`, model `claude-opus-5-5`, and server side refusal fallbacks (`fallbacks: "default"`).

### 6. Offer page

- The link payload carries the business name, accent colour and currency, so one generic page serves any user who hosts it.
- `config.php` holds the secret and the email to notify; the page text no longer names Design by Maria.

## Success criteria (to be measured by Maria with real people)

1. Time from enquiry to a ready offer (PDF and message): baseline from Maria's past quotes, target 10 minutes or less with QuoteDesk.
2. Price confidence on a 1 to 5 scale, before and after using the market range and value section.
3. At least 2 of 3 freelance testers would send the generated offer with only minor edits.
4. Testers complete setup (profile and 3 prices) without help.

## Out of scope

Accounts or a shared server for many users, payments, invoices, choosing a variant in the link, automatic market price research.

## Risks

- API key in the browser: acceptable for a personal tool, documented in README; a stolen key costs money.
- Browser storage can be cleared: mitigated by Export.
- Client messages go to Anthropic: README and Settings say so; users should remove sensitive data.
- Value text can over-promise: prompt rules plus the user's review before sending.
