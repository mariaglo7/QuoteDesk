// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAi, parseJsonText, MODEL } from '../web/src/ai.js';

function fakeSdk(reply, calls) {
  class RateLimitError extends Error {}
  class AuthenticationError extends Error {}
  function Anthropic(options) {
    calls.options = options;
    this.beta = {
      messages: {
        stream: (body) => {
          calls.body = body;
          const handlers = {};
          return {
            on(event, fn) { handlers[event] = fn; return this; },
            async finalMessage() {
              if (reply instanceof Error) throw reply;
              handlers.text?.(reply.text);
              return { stop_reason: reply.stop ?? 'end_turn', content: [{ type: 'text', text: reply.text }] };
            },
          };
        },
      },
    };
  }
  Anthropic.RateLimitError = RateLimitError;
  Anthropic.AuthenticationError = AuthenticationError;
  return Anthropic;
}

test('no sample and no key means no AI', () => {
  assert.equal(createAi({ sample: null, apiKey: '' }), null);
});

test('the artifact sample is used as it is', () => {
  const sample = () => {};
  assert.equal(createAi({ sample, apiKey: 'x' }), sample);
});

test('with a key the SDK is called with the default model, fallbacks and browser access', async () => {
  const calls = {};
  const ai = createAi({ sample: null, apiKey: 'test-key', loadSdk: async () => fakeSdk({ text: 'Cześć' }, calls) });
  const { text, truncated } = await ai('Hello');
  assert.equal(text, 'Cześć');
  assert.equal(truncated, false);
  assert.equal(calls.body.model, MODEL);
  assert.equal(MODEL, 'claude-opus-5-5');
  assert.equal(calls.body.fallbacks, 'default');
  assert.deepEqual(calls.body.betas, ['server-side-fallback-2026-07-01']);
  assert.equal(calls.options.apiKey, 'test-key');
  assert.equal(calls.options.dangerouslyAllowBrowser, true);
});

test('json answers are parsed even inside a code fence', async () => {
  const ai = createAi({ sample: null, apiKey: 'k', loadSdk: async () => fakeSdk({ text: '```json\n{"a":1}\n```' }, {}) });
  assert.deepEqual(await ai.json('x'), { a: 1 });
});

test('max_tokens marks the answer as truncated', async () => {
  const ai = createAi({ sample: null, apiKey: 'k', loadSdk: async () => fakeSdk({ text: 'cut', stop: 'max_tokens' }, {}) });
  assert.equal((await ai('x')).truncated, true);
});

test('refusal and rate limits become error codes', async () => {
  const refusing = createAi({ sample: null, apiKey: 'k', loadSdk: async () => fakeSdk({ text: '', stop: 'refusal' }, {}) });
  await assert.rejects(refusing('x'), (e) => e.code === 'refused');
  const Sdk = fakeSdk(null, {});
  const limited = createAi({ sample: null, apiKey: 'k', loadSdk: async () => { const S = fakeSdk(new Sdk.RateLimitError('slow'), {}); S.RateLimitError = Sdk.RateLimitError; return S; } });
  await assert.rejects(limited('x'), (e) => e.code === 'rate_limited');
});

test('parseJsonText finds the object and rejects garbage', () => {
  assert.deepEqual(parseJsonText('Here: {"b":2} done'), { b: 2 });
  assert.throws(() => parseJsonText('no json'), /invalid_json/);
});
