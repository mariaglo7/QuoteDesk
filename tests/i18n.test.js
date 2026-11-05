// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { EN, t, setUiLang } from '../web/src/i18n.js';

const dir = new URL('../web/src/ui/', import.meta.url);
const sources = readdirSync(dir).map((f) => readFileSync(new URL(f, dir), 'utf8'));

test('t returns polish by default and english after the switch', () => {
  setUiLang('pl');
  assert.equal(t('Oferty'), 'Oferty');
  setUiLang('en');
  assert.equal(t('Oferty'), 'Offers');
  assert.equal(t('Strona {n}', { n: 2 }), 'Page 2');
  setUiLang('pl');
});

test('every t() literal in the UI has an english translation', () => {
  const used = sources.flatMap((s) => [...s.matchAll(/\bt\('((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]));
  assert.ok(used.length > 100);
  for (const key of used) assert.ok(key in EN, key);
});

test('no polish text is left outside t() in the UI', () => {
  for (const source of sources) {
    const code = source.replace(/\bt\('(?:[^'\\]|\\.)*'/g, '').replace(/^.*(?:const (?:VIEWS|UNITS|CATEGORIES|STATUSES|TYPE_LABELS)|const tabs|selectFor\(').*$/gm, '').replace(/^\s*\/\/.*$/gm, '');
    const left = code.match(/'[^'\n]*[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ][^'\n]*'/g);
    assert.equal(left, null, String(left));
  }
});

test('translations have no dashes', () => {
  for (const value of Object.values(EN)) assert.ok(!/[—–]| - /.test(value), value);
});
