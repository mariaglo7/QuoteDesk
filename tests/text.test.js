// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { stripDashes, slugify, offerFileName, formatMoney, addDays, toISODate, setCurrency } from '../web/src/text.js';

test('stripDashes replaces em and en dashes', () => {
  assert.equal(stripDashes('Cześć — oto oferta – razem £970'), 'Cześć, oto oferta, razem £970');
});
test('stripDashes replaces spaced hyphen', () => {
  assert.equal(stripDashes('Logo - 3 koncepcje'), 'Logo, 3 koncepcje');
});
test('stripDashes keeps in-word hyphens', () => {
  assert.equal(stripDashes('e-mail i follow-up'), 'e-mail i follow-up');
});
test('stripDashes keeps line breaks', () => {
  assert.equal(stripDashes('Maria\nDesign by Maria'), 'Maria\nDesign by Maria');
});
test('stripDashes handles a dash at line start without leaving a comma', () => {
  assert.equal(stripDashes('Punkty:\n— logo\n— strona'), 'Punkty:\nlogo\nstrona');
});
test('slugify removes apostrophes and spaces', () => {
  assert.equal(slugify("Pots 'n Pans"), 'potsnpans');
});
test('slugify folds polish letters', () => {
  assert.equal(slugify('Łódź Żabka Bakery'), 'lodzzabkabakery');
});
test('offerFileName follows the naming rule', () => {
  assert.equal(offerFileName('Bakehouse Aberdeen', new Date('2026-10-22')), 'bakehouseaberdeen_oferta_20261022.pdf');
});
test('offerFileName falls back to klient', () => {
  assert.equal(offerFileName('', new Date('2026-10-22')), 'klient_oferta_20261022.pdf');
});
test('formatMoney groups thousands with the pound sign', () => {
  assert.equal(formatMoney(1110), '£1,110');
  assert.equal(formatMoney(35), '£35');
});
test('formatMoney supports euro and zloty with plain spaces', () => {
  assert.equal(formatMoney(1110, 'EUR'), '1110 €');
  assert.equal(formatMoney(12500, 'PLN'), '12 500 zł');
  assert.equal(formatMoney(35, 'GBP'), '£35');
});
test('setCurrency changes the default', () => {
  setCurrency('PLN');
  assert.equal(formatMoney(280), '280 zł');
  setCurrency('GBP');
});
test('addDays crosses month ends', () => {
  assert.equal(addDays('2026-10-22', 7), '2026-10-29');
  assert.equal(addDays('2026-10-28', 7), '2026-11-04');
});
test('toISODate returns the date part', () => {
  assert.equal(toISODate(new Date('2026-10-22T15:00:00Z')), '2026-10-22');
});
