// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderOfferPdf } from '../web/src/pdf/render.js';
import { calcQuote } from '../web/src/pricing.js';
import { DEFAULT_SETTINGS as S } from '../web/src/defaults.js';
import { THEME } from '../web/src/pdf/theme.js';
import { REFERENCE } from './fixtures/reference.js';
import { FONTS, LOGOS, recordingPdf } from './fixtures/pdf.js';

function render(quote = REFERENCE, settings = S, extra = {}) {
  const { RecordingPdf, texts } = recordingPdf();
  const totals = extra.totals ?? calcQuote(quote, settings);
  const report = {};
  const doc = renderOfferPdf({
    jsPDF: RecordingPdf, fonts: FONTS, logos: LOGOS, coverImage: null, quote, totals, settings,
    offerUrl: 'https://designbymaria.co.uk/oferta/#a.b', today: '2026-10-22', report, ...extra,
  });
  return { doc, all: texts.join(' | '), texts, report };
}

const simple = (over = {}) => ({
  ...REFERENCE,
  client: { name: 'Kasia', company: 'Bakehouse', email: '' },
  needs: [{ label: 'Logo', text: 'Prosty znak.' }],
  sections: [{ id: 's', type: 'services', eyebrow: 'Oferta', title: 'Logo', intro: '', note: '', items: [
    { id: 'a', serviceId: null, name: 'Logo', description: 'Opis', bullets: [], qty: 1, unitPriceOverride: 280, priceFrom: false, subNote: '', subtitle: '' },
  ] }],
  ...over,
});

test('reference fixture renders 4 pages', () => {
  assert.equal(render().doc.getNumberOfPages(), 4);
});

test('cover has company, client name, needs rows and valid until date', () => {
  const { all } = render();
  assert.ok(all.includes('Harbour Light'));
  assert.ok(all.includes('Dla: Alex Morgan'));
  assert.ok(all.includes('Marketing'));
  assert.ok(all.includes('29.10.2026'));
});

test('reference terms sit on the last page with the print term', () => {
  const { all, report } = render();
  assert.ok(all.includes('Druk'));
  assert.equal(report.termsPage, 4);
});

test('terms start with the bold word then the rest of the sentence', () => {
  const { texts } = render(simple());
  assert.ok(texts.includes('Płatność'));
  assert.ok(texts.some((t) => t.startsWith('przelewem')));
});

test('prices from the reference appear', () => {
  const { all } = render();
  for (const price of ['£280', '£380', '£75', '£319', '£409', '£199', '£329', '£479', 'od £250', '£749', '£834']) assert.ok(all.includes(price), price);
});

test('polish characters kept', () => {
  assert.ok(render(simple({ client: { name: 'Żaneta', company: 'Łódź Piekarnia', email: '' } })).all.includes('Łódź'));
});

test('cards in a row share one height', () => {
  const { report } = render();
  assert.ok(report.cardRows.length >= 2);
  for (const row of report.cardRows) assert.equal(new Set(row.heights).size, 1);
});

test('long company name wraps and fits the left column', () => {
  const { report } = render(simple({ client: { name: 'A', company: 'Highland Premium Skylight And Roof Window Engineering Company Limited', email: '' } }));
  assert.ok(report.cover.titleMaxWidth <= THEME.panelX - THEME.margin - 20);
  assert.ok(report.cover.titleBottom < report.cover.needsTop);
});

test('section head moves with its first block, never alone at page bottom', () => {
  const many = Array.from({ length: 12 }, (_, i) => ({
    id: `s${i}`, type: 'services', eyebrow: 'Sekcja', title: `Tytuł ${i}`, intro: 'Wstęp do sekcji.', note: '',
    items: [{ id: `i${i}`, serviceId: null, name: 'Usługa', description: 'Opis usługi w dwóch linijkach. '.repeat(4), bullets: [], qty: 1, unitPriceOverride: 100, priceFrom: false, subNote: '', subtitle: '' }],
  }));
  const { report } = render(simple({ sections: many }));
  for (const head of report.heads) assert.equal(head.page, head.nextBlockPage);
});

test('card taller than remaining space moves to the next page', () => {
  const bullets = Array.from({ length: 8 }, () => 'Punkt oferty z dłuższym opisem, który zawija się do drugiej linijki');
  const opt = (id) => ({ id, serviceId: null, name: id, subtitle: 'x', description: '', bullets, qty: 1, unitPriceOverride: 100, priceFrom: false, subNote: '' });
  const section = (n) => ({ id: `o${n}`, type: 'options', eyebrow: 'E', title: `T${n}`, intro: '', note: '', recommendedId: `a${n}`, items: [opt(`a${n}`), opt(`b${n}`)] });
  const { report } = render(simple({ sections: [section(1), section(2), section(3)] }));
  for (const row of report.cardRows) assert.ok(row.bottom <= THEME.bottom, `bottom ${row.bottom}`);
});

test('terms hide print and hosting when not relevant', () => {
  const { all } = render(simple());
  assert.ok(all.includes('Płatność'));
  assert.ok(!all.includes('Druk'));
  assert.ok(!all.includes('Hosting'));
});

test('terms use the configured extra round price', () => {
  assert.ok(render(simple(), { ...S, extraRoundPrice: 55 }).all.includes('£55'));
});

test('print offer shows the print term', () => {
  const totals = { ...calcQuote(simple(), S), hasPrint: true };
  assert.ok(render(simple(), S, { totals }).all.includes('Druk'));
});

test('website offer adds the hostinger page', () => {
  const q = simple();
  const totals = { ...calcQuote(q, S), hasWebsite: true };
  const { doc, all } = render(q, S, { totals });
  assert.equal(doc.getNumberOfPages(), 3);
  assert.ok(all.includes('hostinger.com'));
});

test('EN quote uses English labels', () => {
  const { all } = render({ ...REFERENCE, lang: 'en' });
  assert.ok(all.includes('Offer for'));
  assert.ok(all.includes('Recommended'));
  assert.ok(all.includes('/ month'));
  assert.ok(!all.includes('Polecam'));
});

test('one service quote renders cover and one page', () => {
  assert.equal(render(simple()).doc.getNumberOfPages(), 2);
});

test('online link line appears when a link exists', () => {
  assert.ok(render(simple()).all.includes('designbymaria.co.uk/oferta'));
  assert.ok(!render(simple(), S, { offerUrl: '' }).all.includes('designbymaria.co.uk/oferta'));
});

test('banner lists item names when it has no labels', () => {
  const q = simple();
  q.sections = [...q.sections, { id: 'b', type: 'bundles', style: 'banner', bundles: [{ id: 'b1', name: 'Pakiet', itemIds: ['a'], priceOverride: null, caption: '' }] }];
  const { texts } = render(q);
  assert.ok(texts.lastIndexOf('Logo') > texts.indexOf('Pakiet'));
});

test('no bank details', () => {
  assert.doesNotMatch(render().all, /sort code|account number|numer konta/i);
});
