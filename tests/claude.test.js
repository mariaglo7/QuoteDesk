// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExtractPrompt, parseExtraction, buildCopyPrompt, parseCopy, buildMessagePrompt, buildFollowUpPrompt } from '../web/src/claude.js';
import { calcQuote } from '../web/src/pricing.js';
import { DEFAULT_SETTINGS as S } from '../web/src/defaults.js';
import { REFERENCE } from './fixtures/reference.js';

const TODAY = '2026-10-22';
const svc = (serviceId, extra = {}) => ({ serviceId, name: 'x', qty: 1, sourceQuote: null, ...extra });
const raw = (extra = {}) => ({ name: 'Kasia', company: 'Bakehouse', lang: 'pl', address: 'ty', clientTypeId: 'local', sections: [], ...extra });

test('extract prompt lists every price list id', () => {
  const p = buildExtractPrompt('Hej', S, TODAY);
  for (const service of S.priceList) assert.ok(p.includes(service.id));
});

test('extract prompt includes the message and asks for JSON only', () => {
  const p = buildExtractPrompt('Potrzebuję logo', S, TODAY);
  assert.ok(p.includes('Potrzebuję logo'));
  assert.match(p, /only with JSON/i);
});

test('known service takes its name and text from the price list', () => {
  const e = parseExtraction(raw({ sections: [{ type: 'services', items: [svc('post', { qty: 4 })] }] }), S, TODAY);
  const item = e.sections[0].items[0];
  assert.equal(item.name, 'Post w social media');
  assert.equal(item.qty, 4);
  assert.ok(item.description.length > 0);
});

test('english client gets english service names', () => {
  const e = parseExtraction(raw({ lang: 'en', sections: [{ type: 'services', items: [svc('post')] }] }), S, TODAY);
  assert.equal(e.sections[0].items[0].name, 'Social media post');
});

test('unknown serviceId becomes null with sourceQuote kept', () => {
  const e = parseExtraction(raw({ sections: [{ type: 'services', items: [svc('nope', { name: 'Neon', sourceQuote: 'chcę neon' })] }] }), S, TODAY);
  const item = e.sections[0].items[0];
  assert.equal(item.serviceId, null);
  assert.equal(item.name, 'Neon');
  assert.equal(item.sourceQuote, 'chcę neon');
});

for (const qty of ['dwa', 0, -3, null]) {
  test(`qty ${qty} becomes 1`, () => {
    const e = parseExtraction(raw({ sections: [{ type: 'services', items: [svc('post', { qty })] }] }), S, TODAY);
    assert.equal(e.sections[0].items[0].qty, 1);
  });
}

test('invalid lang defaults to en', () => {
  assert.equal(parseExtraction(raw({ lang: 'de' }), S, TODAY).lang, 'en');
});

test('invalid client type defaults to sole', () => {
  assert.equal(parseExtraction(raw({ clientTypeId: 'x' }), S, TODAY).clientTypeId, 'sole');
});

test('deadline under 7 days sets rush', () => {
  assert.equal(parseExtraction(raw({ deadline: '2026-10-27' }), S, TODAY).rush, true);
  assert.equal(parseExtraction(raw({ deadline: '2026-11-20' }), S, TODAY).rush, false);
});

test('invalid deadline is dropped', () => {
  const e = parseExtraction(raw({ deadline: 'przed świętami' }), S, TODAY);
  assert.equal(e.deadline, null);
  assert.equal(e.rush, false);
});

for (const bad of [null, 'text', 42, []]) {
  test(`raw ${JSON.stringify(bad)} returns an empty extraction`, () => {
    const e = parseExtraction(bad, S, TODAY);
    assert.deepEqual(e.sections, []);
    assert.deepEqual(e.missing, []);
  });
}

test('options section with fewer than 2 items becomes services', () => {
  const e = parseExtraction(raw({ sections: [{ type: 'options', items: [svc('post')] }] }), S, TODAY);
  assert.equal(e.sections[0].type, 'services');
});

test('options section is capped at 3 and gets a recommended item', () => {
  const e = parseExtraction(raw({ sections: [{ type: 'options', items: [svc('post'), svc('care'), svc('post'), svc('care')] }] }), S, TODAY);
  assert.equal(e.sections[0].items.length, 3);
  assert.equal(e.sections[0].recommendedId, e.sections[0].items[1].id);
});

test('copy prompt carries the source message and form of address', () => {
  const p = buildCopyPrompt({ quote: { ...REFERENCE, sourceMessage: 'Hej, potrzebuję katalogu' }, settings: S });
  assert.ok(p.includes('Hej, potrzebuję katalogu'));
  assert.match(p, /wy/);
});

test('parseCopy strips dashes and trailing title dots', () => {
  const q = parseCopy({ needs: [{ label: 'Logo', text: 'Znak — prosty' }], sections: [{ id: 's1', title: 'Nowy tytuł.', intro: 'A – B' }] }, REFERENCE);
  assert.equal(q.needs[0].text, 'Znak, prosty');
  assert.equal(q.sections[0].title, 'Nowy tytuł');
  assert.equal(q.sections[0].intro, 'A, B');
});

test('parseCopy cannot change prices or add items', () => {
  const q = parseCopy({ sections: [{ id: 's1', items: [{ id: 'k1', unitPriceOverride: 1, bullets: ['Nowy'] }, { id: 'zzz', name: 'Extra' }] }] }, REFERENCE);
  const items = q.sections[0].items;
  assert.equal(items.length, 2);
  assert.equal(items[0].unitPriceOverride, 280);
  assert.deepEqual(items[0].bullets, ['Nowy']);
});

test('parseCopy keeps the quote on bad input', () => {
  assert.deepEqual(parseCopy('oops', REFERENCE), REFERENCE);
});

test('message prompt has everything Maria requires', () => {
  const totals = calcQuote(REFERENCE, S);
  const p = buildMessagePrompt({ quote: { ...REFERENCE, missing: ['czy ma domenę?'] }, totals, settings: S, offerUrl: 'https://x.test/#a.b', tone: 'default' });
  assert.ok(p.includes('£380'));
  assert.ok(p.includes('https://x.test/#a.b'));
  assert.ok(p.includes('info@designbymaria.co.uk'));
  assert.ok(p.includes('czy ma domenę?'));
  assert.match(p, /2 (revision )?rounds/);
  assert.match(p, /em dash/);
  assert.match(p, /never change/i);
  assert.match(p, /Polish/);
});

test('tone changes the prompt', () => {
  const totals = calcQuote(REFERENCE, S);
  const a = { quote: REFERENCE, totals, settings: S, offerUrl: 'u' };
  assert.notEqual(buildMessagePrompt({ ...a, tone: 'shorter' }), buildMessagePrompt({ ...a, tone: 'warmer' }));
});

test('follow up prompt is polite and has the link', () => {
  const p = buildFollowUpPrompt({ quote: REFERENCE, totals: calcQuote(REFERENCE, S), settings: S, offerUrl: 'https://x.test/' });
  assert.ok(p.includes('https://x.test/'));
  assert.match(p, /polite/i);
});
