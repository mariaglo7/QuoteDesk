// Code written with help from Claude (Anthropic)
// One interface for Claude: the claude.ai artifact `sample`, or the Anthropic SDK with the user's own key.

export const MODEL = 'claude-opus-5-5';
export const API_KEY_STORAGE = 'quotedesk.anthropicKey';
const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.5.0/+esm';

const loadDefaultSdk = () => import(SDK_URL).then((m) => m.default);

/** Pulls the JSON object out of a text answer, also from inside a code fence. */
export function parseJsonText(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw Object.assign(new Error('invalid_json'), { code: 'invalid_json' });
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw Object.assign(new Error('invalid_json'), { code: 'invalid_json' });
  }
}

function errorCode(error, Anthropic) {
  if (error instanceof Anthropic.RateLimitError) return 'rate_limited';
  if (error instanceof Anthropic.AuthenticationError) return 'bad_key';
  return 'unavailable';
}

export function readStoredKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function storeKey(key) {
  try {
    if (key) localStorage.setItem(API_KEY_STORAGE, key);
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // Blocked storage: the key lasts only for this page load.
  }
}

/** Returns `ask(prompt, { onText })` with `ask.json(prompt)`, or null when no Claude is available. */
export function createAi({ sample, apiKey, loadSdk = loadDefaultSdk }) {
  if (sample) return sample;
  if (!apiKey) return null;
  let client = null;
  let Anthropic = null;

  async function ask(prompt, { onText } = {}) {
    Anthropic ??= await loadSdk();
    client ??= new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    let text = '';
    try {
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        messages: [{ role: 'user', content: prompt }],
      });
      stream.on('text', (delta) => {
        text += delta;
        onText?.({ text, delta });
      });
      const message = await stream.finalMessage();
      if (message.stop_reason === 'refusal') throw Object.assign(new Error('refused'), { code: 'refused' });
      text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
      return { text, truncated: message.stop_reason === 'max_tokens' };
    } catch (error) {
      if (error.code) throw error;
      throw Object.assign(new Error(error.message), { code: errorCode(error, Anthropic) });
    }
  }

  ask.json = async (prompt) => parseJsonText((await ask(prompt)).text);
  return ask;
}
