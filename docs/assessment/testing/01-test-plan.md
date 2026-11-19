# User evaluation plan

Run by Maria Glowacka. Results must come from real sessions only (CM3026 rules: no simulated users, no invented feedback).

## What we want to learn

Each question maps to a success criterion in `docs/superpowers/specs/2026-11-19-generalise-design.md`.

| # | Question | Success criterion | Measure |
|---|---|---|---|
| Q1 | Is a quote faster than before? | Ready offer in 10 minutes or less (baseline 30 minutes to 3 hours) | Minutes from pasting the message to a downloaded PDF and copied message |
| Q2 | Does the app make the price feel safer? | Price confidence goes up | Confidence 1 to 5 before and after the market range and "What you gain" section |
| Q3 | Is the offer good enough to send? | At least 2 of 3 testers would send it with minor edits | Answer: send as is / minor edits / major edits / would not send |
| Q4 | Can a new person set it up alone? | Profile and 3 prices without help | Done without help: yes / with hints / no, plus minutes |
| Q5 | How usable is it overall? | Supporting measure | System Usability Scale (SUS), 10 questions |

## Participants

| Code | Who | Why |
|---|---|---|
| P0 | Maria, on a real enquiry | Primary user; baseline comparison with her past quotes |
| P1, P2 | 1 or 2 creative freelancers (design, photography, social media, web) | The intended users |
| P3 | An electrical business | Outside the target group: shows how far the app generalises and where it stops |

Use codes, never names. P3 results are reported separately as a boundary test.

## Session (about 20 to 25 minutes)

1. Consent form (`02-consent-form-EN.md` or `-PL.md`), 2 minutes.
2. Confidence before: "How confident are you that your usual price for this kind of job is right?" 1 to 5.
3. Task A, setup: open the demo, fill in the business profile and 3 prices of their own. Start a timer.
4. Task B, quote: paste the sample enquiry for their field (`04-sample-enquiries.md`), produce the PDF and the reply message. Timer from paste to both done.
5. Confidence after: same question, 1 to 5.
6. Would you send this offer? (send as is / minor edits / major edits / would not send) and why.
7. SUS questionnaire (`03-sus-questionnaire.md`).
8. Two open questions: "What was most useful?" and "What was confusing or missing?"

Maria observes and writes what happens, especially hesitations and errors, without helping unless the participant is stuck for 2 minutes (then record "hint given").

## Setup notes

- Use the website demo https://mariaglo7.github.io/QuoteDesk/ in a fresh browser profile or private window.
- Claude features: P0 uses Maria's claude.ai version, where Claude runs on her plan. For P1 to P3 on the demo, either Maria enters an API key with a low spending limit for the session and removes it afterwards (Settings, Remove key), or the session runs without Claude (templates only) and this is reported as a limitation. Participants never type a real client's details.
- Online sessions: video call with screen sharing; the participant's screen is not recorded unless they agree.

## Data handling

- Only coded notes and numbers are kept, in `05-results.md`. No names, emails, recordings or client details in the repository.
- Consent forms are kept privately by Maria, not committed.
- Participants may withdraw at any time; their data is then deleted.
