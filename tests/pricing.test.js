// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { roundUp5, bundlePrice, priceItem, calcQuote, freezePrices } from '../web/src/pricing.js';
import { DEFAULT_SETTINGS } from '../web/src/defaults.js';
import { TEST_SETTINGS } from './fixtures/settings.js';

const S = {
  ...TEST_SETTINGS,
  priceList: [
    ...TEST_SETTINGS.priceList,
    { id: 'logo', namePl: 'Logo', nameEn: 'Logo', price: 200, priceFrom: false, unit: 'item', category: 'branding', applyMultiplier: true },
    { id: 'flyer', namePl: 'Ulotka', nameEn: 'Flyer', price: 75, priceFrom: false, unit: 'item', category: 'print', applyMultiplier: true },
    { id: 'page', namePl: 'Podstrona', nameEn: 'Page', price: 120, priceFrom: false, unit: 'page', category: 'website', applyMultiplier: false },
    { id: 'refresh', namePl: 'Odświeżenie', nameEn: 'Refresh', price: 250, priceFrom: true, unit: 'item', category: 'other', applyMultiplier: false },
    { id: 'social', namePl: 'Start', nameEn: 'Start', price: 199, priceFrom: false, unit: 'month', category: 'social', applyMultiplier: false },
  ],
};
const item = (serviceId, extra = {}) => ({ id: `i_${serviceId}`, serviceId, name: serviceId, qty: 1, unitPriceOverride: null, ...extra });
const quote = (extra = {}) => ({ clientTypeId: 'sole', rush: false, sections: [], ...extra });
const servicesQuote = (items, extra) => quote({ sections: [{ id: 's1', type: 'services', items }], ...extra });

test('roundUp5 ignores float noise', () => {
  assert.equal(roundUp5(200 * 1.2), 240);
  assert.equal(roundUp5(241), 245);
});

test('multiplier by client type', () => {
  assert.equal(priceItem(item('logo'), quote({ clientTypeId: 'large' }), S).unitPrice, 320);
});

test('intermediary multiplier is 1.2', () => {
  assert.equal(priceItem(item('logo'), quote({ clientTypeId: 'intermediary' }), S).unitPrice, 240);
});

test('fixed items ignore multiplier and rush', () => {
  const p = priceItem(item('post', { qty: 4 }), quote({ clientTypeId: 'large', rush: true }), S);
  assert.equal(p.lineTotal, 140);
});

test('rush adds 25% then rounds', () => {
  assert.equal(priceItem(item('logo'), quote({ clientTypeId: 'local', rush: true }), S).unitPrice, 300);
});

test('override wins and is not multiplied', () => {
  const p = priceItem(item('logo', { unitPriceOverride: 99 }), quote({ clientTypeId: 'large' }), S);
  assert.equal(p.unitPrice, 99);
});

test('unit month is monthly', () => {
  assert.equal(priceItem(item('care'), quote(), S).monthly, true);
  assert.equal(priceItem(item('logo'), quote(), S).monthly, false);
});

test('page unit multiplies by qty', () => {
  assert.equal(priceItem(item('page', { qty: 5 }), quote(), S).lineTotal, 600);
});

test('priceFrom flows from service to totals', () => {
  const t = calcQuote(servicesQuote([item('refresh')]), S);
  assert.equal(t.items.i_refresh.priceFrom, true);
});

test('unknown service needs price', () => {
  const t = calcQuote(servicesQuote([item(null, { id: 'x' })]), S);
  assert.equal(t.items.x.needsPrice, true);
  assert.equal(t.items.x.unitPrice, null);
  assert.equal(t.needsPrice, true);
  assert.equal(t.estimate.oneOff, 0);
});

test('unknown service with override is priced', () => {
  const t = calcQuote(servicesQuote([item(null, { id: 'x', unitPriceOverride: 50 })]), S);
  assert.equal(t.needsPrice, false);
  assert.equal(t.estimate.oneOff, 50);
});

test('bundle prices match the Harbour Light offer', () => {
  assert.equal(bundlePrice(355, S), 319);
  assert.equal(bundlePrice(455, S), 409);
  assert.equal(bundlePrice(834, S), 749);
});

test('empty bundle costs nothing', () => {
  assert.equal(bundlePrice(0, S), 0);
});

test('bundle totals use item prices and override wins', () => {
  const q = quote({ sections: [
    { id: 's1', type: 'services', items: [item('logo'), item('flyer')] },
    { id: 's2', type: 'bundles', bundles: [
      { id: 'b1', name: 'A', itemIds: ['i_logo', 'i_flyer'], priceOverride: null },
      { id: 'b2', name: 'B', itemIds: ['i_logo', 'i_flyer'], priceOverride: 250 },
    ] },
  ] });
  const t = calcQuote(q, S);
  assert.deepEqual(t.bundles.b1, { fullPrice: 275, price: 239 });
  assert.deepEqual(t.bundles.b2, { fullPrice: 275, price: 250 });
});

test('estimate uses recommended option and services', () => {
  const q = quote({ sections: [
    { id: 's1', type: 'options', recommendedId: 'i_social', items: [item('care'), item('social')] },
    { id: 's2', type: 'services', items: [item('logo')] },
  ] });
  assert.deepEqual(calcQuote(q, S).estimate, { oneOff: 200, monthly: 199 });
});

test('estimate falls back to the first option', () => {
  const q = quote({ sections: [{ id: 's1', type: 'options', recommendedId: null, items: [item('logo'), item('flyer')] }] });
  assert.equal(calcQuote(q, S).estimate.oneOff, 200);
});

test('hasWebsite is only for category website', () => {
  assert.equal(calcQuote(servicesQuote([item('care')]), S).hasWebsite, false);
  assert.equal(calcQuote(servicesQuote([item('page')]), S).hasWebsite, true);
});

test('hasPrint is only for category print', () => {
  assert.equal(calcQuote(servicesQuote([item('logo')]), S).hasPrint, false);
  assert.equal(calcQuote(servicesQuote([item('flyer')]), S).hasPrint, true);
});

test('custom item category counts for hasPrint', () => {
  const t = calcQuote(servicesQuote([item(null, { id: 'x', unitPriceOverride: 75, category: 'print' })]), S);
  assert.equal(t.hasPrint, true);
});

test('needsCheck item needs price even with a known service', () => {
  assert.equal(priceItem(item('post', { needsCheck: true }), quote(), S).needsPrice, true);
});

test('a service without a price needs price', () => {
  const free = { ...S, priceList: [{ id: 'x', price: 0, unit: 'item', category: 'other', applyMultiplier: true }, { id: 'y', price: null, unit: 'item', category: 'other', applyMultiplier: false }] };
  assert.equal(priceItem(item('x'), quote(), free).needsPrice, true);
  assert.equal(priceItem(item('y'), quote(), free).needsPrice, true);
});

test('freezePrices keeps prices when the price list changes', () => {
  const q = quote({ clientTypeId: 'local', sections: [
    { id: 's', type: 'services', items: [item('logo')] },
    { id: 'b', type: 'bundles', bundles: [{ id: 'b1', name: 'A', itemIds: ['i_logo'], priceOverride: null }] },
  ] });
  const frozen = { ...q, sections: freezePrices(q, calcQuote(q, S)) };
  const dearer = { ...S, priceList: S.priceList.map((p) => (p.id === 'logo' ? { ...p, price: 999 } : p)) };
  const t = calcQuote(frozen, dearer);
  assert.equal(t.items.i_logo.unitPrice, 240);
  assert.equal(t.bundles.b1.price, calcQuote(q, S).bundles.b1.price);
});

test('default settings match the agreed values', () => {
  const m = Object.fromEntries(DEFAULT_SETTINGS.clientTypes.map((c) => [c.id, c.multiplier]));
  assert.deepEqual(m, { sole: 1, local: 1.2, intermediary: 1.2, medium: 1.4, large: 1.6 });
  assert.equal(DEFAULT_SETTINGS.extraRoundPrice, 40);
  assert.equal(DEFAULT_SETTINGS.rushRate, 0.25);
  assert.equal(DEFAULT_SETTINGS.validityDays, 7);
});

test('example services ship without prices', () => {
  assert.ok(DEFAULT_SETTINGS.priceList.length >= 5);
  for (const service of DEFAULT_SETTINGS.priceList) assert.equal(service.price, null, service.id);
});

test('defaults name nobody', () => {
  const text = JSON.stringify(DEFAULT_SETTINGS);
  assert.doesNotMatch(text, /Maria|designbymaria/i);
  assert.equal(DEFAULT_SETTINGS.profile.businessName, '');
  assert.equal(DEFAULT_SETTINGS.profile.dark, '#1F2933');
  assert.equal(DEFAULT_SETTINGS.profile.accent, '#2BB3A3');
  assert.equal(DEFAULT_SETTINGS.profile.currency, 'GBP');
  assert.equal(DEFAULT_SETTINGS.offerBaseUrl, '');
});
