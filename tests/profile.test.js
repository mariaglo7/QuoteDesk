// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { signatureFrom, hasProfile } from '../web/src/profile.js';
import { DEFAULT_SETTINGS } from '../web/src/defaults.js';
import { TEST_SETTINGS } from './fixtures/settings.js';

test('signature is built from the profile', () => {
  assert.equal(signatureFrom(TEST_SETTINGS.profile), 'Jo Example\nNorthlight Studio\njo@example.com\nnorthlight.example');
});

test('signature skips empty fields', () => {
  assert.equal(signatureFrom({ ownerName: 'Jo', businessName: '', email: 'jo@example.com', website: '' }), 'Jo\njo@example.com');
});

test('a profile needs a business or owner name and an email', () => {
  assert.equal(hasProfile(DEFAULT_SETTINGS.profile), false);
  assert.equal(hasProfile(TEST_SETTINGS.profile), true);
  assert.equal(hasProfile({ ...TEST_SETTINGS.profile, email: '' }), false);
});
