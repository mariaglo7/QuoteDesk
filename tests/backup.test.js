// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBackup, readBackup } from '../web/src/backup.js';
import { TEST_SETTINGS } from './fixtures/settings.js';
import { REFERENCE } from './fixtures/reference.js';

const settings = { ...TEST_SETTINGS, linkSecret: 'a'.repeat(64), apiKey: 'sk-ant-should-not-be-here' };

test('backup holds settings and quotes but no secrets', () => {
  const text = makeBackup(settings, [REFERENCE], new Date('2026-11-19T10:00:00Z'));
  assert.ok(!text.includes('a'.repeat(64)));
  assert.ok(!text.includes('sk-ant'));
  const data = JSON.parse(text);
  assert.equal(data.app, 'QuoteDesk');
  assert.equal(data.quotes.length, 1);
  assert.equal(data.settings.profile.businessName, 'Northlight Studio');
});

test('a backup reads back', () => {
  const back = readBackup(makeBackup(settings, [REFERENCE], new Date()));
  assert.equal(back.quotes[0].id, REFERENCE.id);
  assert.equal(back.settings.linkSecret, undefined);
});

for (const [name, text] of [
  ['not JSON', 'hello'],
  ['another app', JSON.stringify({ app: 'Other', settings: {}, quotes: [] })],
  ['quotes not a list', JSON.stringify({ app: 'QuoteDesk', version: 1, settings: { profile: {} }, quotes: {} })],
  ['missing settings', JSON.stringify({ app: 'QuoteDesk', version: 1, quotes: [] })],
  ['quote without id', JSON.stringify({ app: 'QuoteDesk', version: 1, settings: { profile: {}, priceList: [] }, quotes: [{ kind: 'quote' }] })],
]) {
  test(`readBackup rejects ${name}`, () => {
    assert.throws(() => readBackup(text), /invalid/);
  });
}
