// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackMessage, fallbackFollowUp } from '../web/src/templates.js';
import { calcQuote } from '../web/src/pricing.js';
import { DEFAULT_SETTINGS as S } from '../web/src/defaults.js';
import { REFERENCE } from './fixtures/reference.js';

const T = calcQuote(REFERENCE, S);
const args = (q = REFERENCE, totals = T) => ({ quote: q, totals, settings: S, offerUrl: 'https://x.test/#a.b' });
const noDashes = (s) => assert.ok(!/[—–]| - /.test(s), s);

test('fallback PL has prices, link, signature and no dashes', () => {
  const m = fallbackMessage(args());
  assert.ok(m.includes('£380'));
  assert.ok(m.includes('https://x.test/#a.b'));
  assert.ok(m.includes('info@designbymaria.co.uk'));
  assert.ok(m.includes('2 rundy poprawek'));
  noDashes(m);
});

test('fallback greets by first name', () => {
  assert.ok(fallbackMessage(args({ ...REFERENCE, address: 'ty' })).startsWith('Cześć Alex'));
});

test('fallback EN is in English', () => {
  const m = fallbackMessage(args({ ...REFERENCE, lang: 'en' }));
  assert.ok(m.startsWith('Hi Alex'));
  assert.ok(m.includes('2 rounds of revisions'));
  noDashes(m);
});

test('website quotes say hosting is bought by the client', () => {
  assert.match(fallbackMessage(args(REFERENCE, { ...T, hasWebsite: true })), /[Hh]osting/);
  assert.doesNotMatch(fallbackMessage(args()), /[Hh]osting/);
});

test('missing questions are included', () => {
  assert.ok(fallbackMessage(args({ ...REFERENCE, missing: ['Czy masz domenę?'] })).includes('Czy masz domenę?'));
});

test('fallback follow up in both languages', () => {
  assert.ok(fallbackFollowUp(args()).includes('https://x.test/#a.b'));
  assert.ok(fallbackFollowUp(args({ ...REFERENCE, lang: 'en' })).includes('offer'));
  noDashes(fallbackFollowUp(args()));
});
