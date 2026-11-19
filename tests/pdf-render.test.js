// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderOfferPdf } from '../web/src/pdf/render.js';
import { calcQuote } from '../web/src/pricing.js';
import { TEST_SETTINGS as S } from './fixtures/settings.js';
import { THEME } from '../web/src/pdf/theme.js';
import { REFERENCE } from './fixtures/reference.js';
import { FONTS, recordingPdf } from './fixtures/pdf.js';

function render(quote = REFERENCE, settings = S, extra = {}) {
  const { RecordingPdf, texts, calls } = recordingPdf();
  const totals = extra.totals ?? calcQuote(quote, settings);
  const report = {};
  const doc = renderOfferPdf({
    jsPDF: RecordingPdf, fonts: FONTS, coverImage: null, quote, totals, settings,
    offerUrl: 'https://northlight.example/offer/#a.b', today: '2026-10-22', report, ...extra,
  });
  return { doc, all: texts.join(' | '), texts, calls, report };
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
  assert.ok(render(simple()).all.includes('northlight.example/offer'));
  assert.ok(!render(simple(), S, { offerUrl: '' }).all.includes('northlight.example/offer'));
});

test('banner lists item names when it has no labels', () => {
  const q = simple();
  q.sections = [...q.sections, { id: 'b', type: 'bundles', style: 'banner', bundles: [{ id: 'b1', name: 'Pakiet', itemIds: ['a'], priceOverride: null, caption: '' }] }];
  const { texts } = render(q);
  assert.ok(texts.lastIndexOf('Logo') > texts.indexOf('Pakiet'));
});

test('empty sections are skipped', () => {
  const q = simple();
  q.sections = [...q.sections, { id: 'e1', type: 'options', eyebrow: 'E', title: 'Pusta', intro: '', note: '', recommendedId: null, items: [] }, { id: 'e2', type: 'services', eyebrow: '', title: 'Pusta2', intro: '', note: '', items: [] }];
  const { all } = render(q);
  assert.ok(!all.includes('Pusta'));
});

const svc = (id, extra = {}) => ({ id, serviceId: null, name: id, subtitle: '', description: '', bullets: [], qty: 1, unitPriceOverride: 100, priceFrom: false, subNote: '', ...extra });
const long = (n) => 'Długi tekst oferty z wieloma słowami, który zawija się na kolejne linijki. '.repeat(n);

test('a card taller than a page is trimmed and reported', () => {
  const bullets = Array.from({ length: 40 }, () => 'Punkt oferty z dłuższym opisem, który zawija się do drugiej linijki');
  const section = { id: 'o', type: 'options', eyebrow: 'E', title: 'T', intro: '', note: '', recommendedId: 'a', items: [svc('a', { bullets }), svc('b', { bullets })] };
  const { report } = render(simple({ sections: [section] }));
  assert.ok(report.cardRows[0].bottom <= THEME.bottom, `bottom ${report.cardRows[0].bottom}`);
  assert.ok(report.overflow.length > 0);
});

test('a very long service description stays on the page', () => {
  const section = { id: 's', type: 'services', eyebrow: '', title: 'T', intro: '', note: '', items: [svc('a', { description: long(100) })] };
  const { calls, report } = render(simple({ sections: [section] }));
  for (const c of calls) assert.ok(c.y <= THEME.bottom + 40, `y ${c.y}`);
  assert.ok(report.overflow.length > 0);
});

test('head stays with six bundle rows', () => {
  const filler = { id: 'f', type: 'services', eyebrow: '', title: '', intro: '', note: '', items: Array.from({ length: 6 }, (_, i) => svc(`f${i}`, { description: long(2) })) };
  const rows = { id: 'b', type: 'bundles', style: 'rows', eyebrow: 'E', title: 'Pakiety', intro: '', note: '', bundles: Array.from({ length: 6 }, (_, i) => ({ id: `b${i}`, name: `Pakiet ${i}`, itemIds: ['f0'], priceOverride: null, caption: '' })) };
  const { report } = render(simple({ sections: [filler, rows] }));
  for (const head of report.heads) assert.equal(head.page, head.nextBlockPage);
});

test('head stays with a banner of eight labels', () => {
  const filler = { id: 'f', type: 'services', eyebrow: '', title: '', intro: '', note: '', items: Array.from({ length: 7 }, (_, i) => svc(`f${i}`, { description: long(2) })) };
  const banner = { id: 'b', type: 'bundles', style: 'banner', eyebrow: 'E', title: 'Pakiet', intro: '', note: '', bundles: [{ id: 'b0', name: 'Pakiet', itemIds: ['f0'], priceOverride: null, caption: '', labels: Array.from({ length: 8 }, (_, i) => `Etykieta ${i}`) }] };
  const { report } = render(simple({ sections: [filler, banner] }));
  for (const head of report.heads) assert.equal(head.page, head.nextBlockPage);
});

test('a wrapped section title does not touch the intro', () => {
  const section = { id: 's', type: 'services', eyebrow: 'E', title: long(2), intro: 'Unikalny wstęp sekcji.', note: '', items: [svc('a')] };
  const { calls } = render(simple({ sections: [section] }));
  const title = calls.filter((c) => c.value.startsWith('Długi') || c.value.includes('oferty z wieloma') || c.value.includes('linijki')).filter((c) => c.page === 2);
  const intro = calls.find((c) => c.value === 'Unikalny wstęp sekcji.');
  assert.ok(intro.y > Math.max(...title.map((c) => c.y)) + 10);
});

test('a long service name wraps clear of the price', () => {
  const section = { id: 's', type: 'services', eyebrow: '', title: 'T', intro: '', note: '', items: [svc('a', { name: long(2) })] };
  const { calls } = render(simple({ sections: [section] }));
  const lines = calls.filter((c) => c.page === 2 && c.x === THEME.margin && String(c.value).length > 5 && !c.align && c.y < 300);
  assert.ok(lines.length >= 2);
  for (const c of lines) assert.ok(c.x + c.width < THEME.margin + 420, `right edge ${c.x + c.width}`);
});

test('long bundle names stay clear of the prices', () => {
  const q = simple();
  q.sections = [...q.sections, { id: 'b', type: 'bundles', style: 'rows', bundles: [{ id: 'b1', name: long(1), itemIds: ['a'], priceOverride: null, caption: '' }] }];
  const { calls } = render(q);
  for (const c of calls.filter((x) => x.value.startsWith('Długi') || x.value.includes('oferty z'))) assert.ok(c.x + c.width < THEME.margin + 370, `right edge ${c.x + c.width}`);
});

test('many needs rows stay on the cover', () => {
  const needs = Array.from({ length: 6 }, () => ({ label: 'Etykieta', text: long(1) }));
  const { calls, report } = render(simple({ needs, client: { name: 'A', company: 'Highland Premium Skylight And Roof Window Engineering Company Limited', email: '' } }));
  for (const c of calls.filter((x) => x.page === 1)) assert.ok(c.y <= 825, `y ${c.y}`);
  assert.ok(report.cover);
});

test('a long client name stays out of the dark panel', () => {
  const { calls } = render(simple({ client: { name: long(1), company: 'Firma', email: '' } }));
  const line = calls.find((c) => c.page === 1 && String(c.value).startsWith('Dla:'));
  assert.ok(line.x + line.width <= THEME.panelX - 10, `right edge ${line.x + line.width}`);
});

test('an intro without a title is kept, an eyebrow alone draws no title', () => {
  const section = { id: 's', type: 'services', eyebrow: '', title: '', intro: 'Sam wstęp.', note: '', items: [svc('a')] };
  assert.ok(render(simple({ sections: [section] })).all.includes('Sam wstęp.'));
});

test('without logos the business name is drawn on the cover, panel and header', () => {
  const noLogo = { ...S, profile: { ...S.profile, logoLight: null, logoDark: null } };
  const { texts } = render(simple(), noLogo);
  assert.ok(texts.filter((t) => t.startsWith('Northlight')).length >= 3);
});

test('profile colours are used for the dark panel and accents', () => {
  const { report } = render();
  assert.deepEqual(report.theme, { dark: '#22303C', accent: '#E0457B' });
});

test('the theme is restored after rendering', async () => {
  const { THEME } = await import('../web/src/pdf/theme.js');
  render();
  assert.equal(THEME.pink, '#FF7AE5');
});

test('euro offer prints euro amounts', () => {
  const eur = { ...S, profile: { ...S.profile, currency: 'EUR' } };
  const { all } = render(simple(), eur);
  assert.ok(all.includes('280 €'), all.slice(0, 300));
  assert.ok(!all.includes('£'));
});

test('value section draws its title and every point', () => {
  const q = simple();
  q.sections = [...q.sections, { id: 'v', type: 'value', eyebrow: '', title: 'Co zyskujecie', intro: '', note: '', points: ['Spójna marka we wszystkich kanałach', 'Pliki gotowe do druku', 'Wsparcie po oddaniu projektu'] }];
  const { all } = render(q);
  assert.ok(all.includes('Co zyskujecie'));
  assert.ok(all.includes('Pliki gotowe do druku'));
});

test('no bank details', () => {
  assert.doesNotMatch(render().all, /sort code|account number|numer konta/i);
});
