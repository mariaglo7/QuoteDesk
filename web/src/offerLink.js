// Code written with help from Claude (Anthropic)
// Signed offer links. Runs unchanged in browsers and Node; shipped to Hostinger as offer.js.

function toBase64Url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  const binary = atob(s.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function pipeBytes(bytes, transform) {
  const stream = new Blob([bytes]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function summarizeSection(section, totals) {
  if (section.type === 'bundles') {
    return {
      t: section.title, k: 'bundles',
      i: section.bundles.map((b) => ({ n: b.name, p: totals.bundles[b.id].price, o: totals.bundles[b.id].fullPrice })),
    };
  }
  return {
    t: section.title, k: section.type,
    i: section.items.map((item) => {
      const priced = totals.items[item.id];
      return { n: item.name, p: priced.lineTotal, f: priced.priceFrom, m: priced.monthly, r: item.id === section.recommendedId };
    }),
  };
}

export function makeOfferPayload(quote, totals, settings, today) {
  const exp = new Date(`${today}T00:00:00Z`);
  exp.setUTCDate(exp.getUTCDate() + settings.validityDays);
  return {
    v: 1,
    id: quote.id,
    company: quote.client.company,
    name: quote.client.name,
    lang: quote.lang,
    date: today,
    exp: exp.toISOString().slice(0, 10),
    sections: quote.sections.filter((s) => s.type !== 'info' && s.type !== 'value').map((s) => summarizeSection(s, totals)),
  };
}

export async function encodeOffer(payload) {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  return toBase64Url(await pipeBytes(json, new CompressionStream('deflate-raw')));
}

export async function decodeOffer(encoded) {
  try {
    const bytes = await pipeBytes(fromBase64Url(encoded), new DecompressionStream('deflate-raw'));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('invalid');
  }
}

export async function signPayload(encoded, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(encoded)));
  return Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPayload(encoded, sig, secret) {
  return (await signPayload(encoded, secret)) === sig;
}

export function buildOfferUrl(baseUrl, encoded, sig) {
  return `${baseUrl}#${encoded}.${sig}`;
}

export function parseOfferUrl(hash) {
  const parts = hash.replace(/^#/, '').split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(encoded) || !/^[0-9a-f]{64}$/.test(sig)) return null;
  return { encoded, sig };
}
