// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeOfferPayload, encodeOffer, decodeOffer, signPayload, verifyPayload, buildOfferUrl, parseOfferUrl } from '../web/src/offerLink.js';
import { calcQuote } from '../web/src/pricing.js';
import { TEST_SETTINGS as S } from './fixtures/settings.js';
import { REFERENCE } from './fixtures/reference.js';

const K = 'a'.repeat(64);
const T = calcQuote(REFERENCE, S);
const P = makeOfferPayload(REFERENCE, T, S, '2026-10-22');

test('reference totals match the reference offer', () => {
  assert.deepEqual(T.bundles.b1, { fullPrice: 355, price: 319 });
  assert.deepEqual(T.bundles.b2, { fullPrice: 455, price: 409 });
  assert.deepEqual(T.bundles.b3, { fullPrice: 834, price: 749 });
});

test('round trip keeps polish text', async () => {
  assert.deepEqual(await decodeOffer(await encodeOffer(P)), P);
});

test('valid signature verifies', async () => {
  const e = await encodeOffer(P);
  assert.equal(await verifyPayload(e, await signPayload(e, K), K), true);
});

test('edited payload fails verification', async () => {
  const e = await encodeOffer(P);
  const sig = await signPayload(e, K);
  assert.equal(await verifyPayload(`${e.slice(0, -2)}AA`, sig, K), false);
});

test('wrong secret fails verification', async () => {
  const e = await encodeOffer(P);
  assert.equal(await verifyPayload(e, await signPayload(e, K), 'b'.repeat(64)), false);
});

test('truncated link is rejected', async () => {
  const e = await encodeOffer(P);
  const sig = await signPayload(e, K);
  assert.equal(parseOfferUrl(`#${e.slice(0, 20)}`), null);
  assert.equal(parseOfferUrl(`#${e}.${sig.slice(0, 20)}`), null);
  await assert.rejects(decodeOffer(e.slice(0, 20)), /invalid/);
});

test('garbage payload is rejected', async () => {
  await assert.rejects(decodeOffer('!!!not-base64'), /invalid/);
});

test('url parses back', async () => {
  const e = await encodeOffer(P);
  const sig = await signPayload(e, K);
  const url = buildOfferUrl('https://designbymaria.co.uk/oferta/', e, sig);
  assert.deepEqual(parseOfferUrl(new URL(url).hash), { encoded: e, sig });
});

test('exp is date + 7 days', () => {
  assert.equal(P.exp, '2026-10-29');
});

test('reference sized offer url under 2000 chars', async () => {
  const e = await encodeOffer(P);
  const url = buildOfferUrl(S.offerBaseUrl, e, await signPayload(e, K));
  assert.ok(url.length < 2000, `url length ${url.length}`);
});

test('payload has names and prices but no descriptions', () => {
  const json = JSON.stringify(P);
  assert.ok(json.includes('Katalog z nowymi zdjęciami'));
  assert.ok(json.includes('749'));
  assert.ok(!json.includes('Nowy układ wszystkich stron'));
  assert.ok(!json.includes('Założenie i pełne'));
});

test('payload leaves out the source message', () => {
  const p = makeOfferPayload({ ...REFERENCE, sourceMessage: 'SECRET NOTE' }, T, S, '2026-10-22');
  assert.ok(!JSON.stringify(p).includes('SECRET NOTE'));
});

test('payload carries the brand name, accent and currency', () => {
  assert.deepEqual(P.brand, { name: 'Northlight Studio', accent: '#E0457B', currency: 'GBP' });
});

test('offer page money follows the currency', async () => {
  const { formatOfferMoney } = await import('../web/src/offerLink.js');
  assert.equal(formatOfferMoney(1110, 'GBP'), '£1,110');
  assert.equal(formatOfferMoney(1110, 'EUR'), '1110 €');
  assert.equal(formatOfferMoney(12500, 'PLN'), '12 500 zł');
  assert.equal(formatOfferMoney(35, undefined), '£35');
});
