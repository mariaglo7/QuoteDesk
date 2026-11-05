// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { effectiveStatus, isFollowUpDue } from '../web/src/status.js';
import { DEFAULT_SETTINGS as S } from '../web/src/defaults.js';

const now = new Date('2026-10-30T12:00:00Z');
const sentDaysAgo = (d, status = 'sent') => ({ status, sentAt: new Date(now - d * 86400000).toISOString() });

test('sent 8 days ago is expired', () => assert.equal(effectiveStatus(sentDaysAgo(8), now, S), 'expired'));
test('sent 2 days ago stays sent', () => assert.equal(effectiveStatus(sentDaysAgo(2), now, S), 'sent'));
for (const status of ['interested', 'agreed', 'deposit_paid', 'rejected']) {
  test(`${status} never expires`, () => assert.equal(effectiveStatus(sentDaysAgo(30, status), now, S), status));
}
test('draft has no expiry', () => assert.equal(effectiveStatus({ status: 'draft', sentAt: null }, now, S), 'draft'));
test('follow up due after 3 days', () => assert.equal(isFollowUpDue(sentDaysAgo(3), now, S), true));
test('follow up not due before 3 days', () => assert.equal(isFollowUpDue(sentDaysAgo(2), now, S), false));
test('follow up only when sent', () => assert.equal(isFollowUpDue(sentDaysAgo(4, 'interested'), now, S), false));
test('expired offers need no follow up', () => assert.equal(isFollowUpDue(sentDaysAgo(9), now, S), false));
