// Code written with help from Claude (Anthropic)
// Backup of settings and offers for the website version, where data lives only in the browser.

const SECRET_KEYS = ['linkSecret', 'apiKey'];

export function makeBackup(settings, quotes, now) {
  const clean = Object.fromEntries(Object.entries(settings).filter(([key]) => !SECRET_KEYS.includes(key)));
  return JSON.stringify({ app: 'QuoteDesk', version: 1, exportedAt: now.toISOString(), settings: clean, quotes }, null, 2);
}

export function readBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('invalid');
  }
  const ok = data?.app === 'QuoteDesk'
    && data.settings && typeof data.settings === 'object' && data.settings.profile && Array.isArray(data.settings.priceList)
    && Array.isArray(data.quotes) && data.quotes.every((q) => q && typeof q.id === 'string' && q.kind === 'quote');
  if (!ok) throw new Error('invalid');
  for (const key of SECRET_KEYS) delete data.settings[key];
  return { settings: data.settings, quotes: data.quotes };
}
