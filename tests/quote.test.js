// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { itemFromService } from '../web/src/quote.js';

test('english quote falls back to the polish name and text', () => {
  const item = itemFromService({ id: 'a', namePl: 'Logo', nameEn: '', descPl: 'Opis', descEn: '', bulletsPl: ['Punkt'], bulletsEn: [] }, 'en');
  assert.equal(item.name, 'Logo');
  assert.equal(item.description, 'Opis');
  assert.deepEqual(item.bullets, ['Punkt']);
});
