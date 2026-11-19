// Code written with help from Claude (Anthropic)
// Writes three links for checking contact.php on the server, where PHP is available.
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { encodeOffer, signPayload, buildOfferUrl } from '../web/src/offerLink.js';

const SECRET = 'test-secret-change-me';
const BASE = 'https://example.com/oferta/';
const offer = (exp) => ({
  v: 1, id: `test-${exp}`, company: 'Test Bakery', name: 'Kasia', lang: 'pl', date: '2026-11-05', exp,
  sections: [{ t: 'Logo', k: 'services', i: [{ n: 'Logo', p: 280, f: false, m: false, r: false }] }],
});

test('test links are generated with the expected states', async () => {
  const valid = await encodeOffer(offer('2099-01-01'));
  const expired = await encodeOffer(offer('2020-01-01'));
  const validSig = await signPayload(valid, SECRET);
  const lines = [
    `Secret for config.php while testing: ${SECRET}`,
    `Valid: ${buildOfferUrl(BASE, valid, validSig)}`,
    `Edited: ${buildOfferUrl(BASE, `${valid.slice(0, -3)}AAA`, validSig)}`,
    `Expired: ${buildOfferUrl(BASE, expired, await signPayload(expired, SECRET))}`,
  ];
  writeFileSync(new URL('../hostinger/test-links.txt', import.meta.url), `${lines.join('\n')}\n`);
  assert.equal(lines.length, 4);
});
