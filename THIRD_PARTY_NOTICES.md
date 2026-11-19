# Third party components

| Component | Used for | How it is included | Licence |
|---|---|---|---|
| Poppins (Indian Type Foundry, Jonny Pinhorn) | Fonts in the app and PDF | Base64 font files in `web/fonts/` | SIL Open Font License 1.1, see `web/fonts/OFL.txt` |
| jsPDF 2.5.1 | Drawing the PDF | Loaded from cdnjs at runtime; npm dev dependency for tests | MIT |
| pdf.js 3.11.174 (Mozilla) | PDF preview on the Desk | Loaded from cdnjs when the PDF tab opens | Apache 2.0 |
| Anthropic TypeScript SDK 1.5.0 | Calling Claude in the website version | Loaded from jsDelivr when a user saves an API key | MIT |

QuoteDesk's own code is under the MIT licence in `LICENSE`. The app has no bundled images or brand assets; users upload their own logos.
