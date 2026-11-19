// Code written with help from Claude (Anthropic)
// Prompts for Claude and strict parsing of its answers. Claude never sets a price.
import { stripDashes, addDays } from './text.js';
import { newId, emptyItem, itemFromService, offerLines } from './quote.js';
import { signatureFrom } from './profile.js';

function voice(profile) {
  const who = [profile.ownerName, profile.businessName && `who runs ${profile.businessName}`].filter(Boolean).join(', ') || 'a freelancer';
  return `You write for ${who}, a creative freelancer.
Their voice: polite, concrete, warm, short sentences, no filler, no sales clichés.
Never use an em dash, an en dash or a spaced hyphen. Use a comma or a colon instead.`;
}

const languageName = (lang) => (lang === 'en' ? 'English' : 'Polish');

function addressRule(quote) {
  if (quote.lang === 'en') return 'Address the client as "you".';
  return quote.address === 'wy'
    ? 'Address the client in the plural Polish form (wy: Was, Wasi, możecie).'
    : 'Address the client in the informal Polish form (ty: Ciebie, Twoja, możesz).';
}

export function buildExtractPrompt(message, settings, today) {
  const services = settings.priceList
    .map((p) => `${p.id}: ${p.namePl} / ${p.nameEn} (${p.category}, unit ${p.unit})`)
    .join('\n');
  const types = settings.clientTypes.map((c) => `${c.id}: ${c.labelEn}`).join('\n');
  return `Read this enquiry sent to a creative freelancer and extract what the client wants. Today is ${today}.

Price list ids:
${services}

Client types:
${types}

Reply only with JSON, no other text, matching:
{
  "name": "client first and last name or empty",
  "company": "company name or empty",
  "lang": "pl or en, the language of the enquiry",
  "address": "ty for a person writing informally, wy for a company or team",
  "clientTypeId": "best guess from the client types",
  "deadline": "YYYY-MM-DD or null",
  "budget": "as written, or null",
  "missing": ["short questions Maria should ask, in the language of the enquiry"],
  "highlights": ["exact fragments of the enquiry that show a need"],
  "sections": [{
    "type": "services for things the client needs, options for 2 or 3 alternatives of the same need",
    "recommended": 1,
    "items": [{ "serviceId": "id from the list, or null when nothing fits", "name": "short name", "qty": 1, "sourceQuote": "exact fragment of the enquiry" }]
  }]
}

Enquiry:
${message}`;
}

const emptyExtraction = () => ({
  name: '', company: '', lang: 'en', address: 'ty', clientTypeId: 'sole',
  sections: [], deadline: null, rush: false, budget: null, missing: [], highlights: [],
});

const strings = (v) => (Array.isArray(v) ? v.filter((s) => typeof s === 'string' && s.trim()) : []);
const validDate = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : null);

function parseItem(raw, settings, lang) {
  const service = settings.priceList.find((p) => p.id === raw?.serviceId);
  const given = raw?.qty ?? null;
  const parsed = Number(given);
  const validQty = Number.isInteger(parsed) && parsed > 0;
  const qty = given !== null && validQty ? parsed : 1;
  const flag = given !== null && !validQty ? { needsCheck: true } : {};
  const sourceQuote = typeof raw?.sourceQuote === 'string' ? raw.sourceQuote : null;
  if (service) return { ...itemFromService(service, lang, qty), sourceQuote, ...flag };
  const name = typeof raw?.name === 'string' && raw.name ? raw.name : sourceQuote ?? '';
  return emptyItem({ name, qty, sourceQuote, ...flag });
}

function parseSection(raw, settings, lang) {
  const items = (Array.isArray(raw?.items) ? raw.items : []).map((i) => parseItem(i, settings, lang));
  if (items.length === 0) return null;
  const base = { id: newId(), eyebrow: '', title: '', intro: '', note: '' };
  if (raw.type === 'options' && items.length >= 2) {
    const kept = items.slice(0, 3);
    const index = Number.isInteger(raw.recommended) && kept[raw.recommended] ? raw.recommended : 1;
    return { ...base, type: 'options', recommendedId: kept[index].id, items: kept };
  }
  return { ...base, type: 'services', items };
}

export function parseExtraction(raw, settings, today) {
  const empty = emptyExtraction();
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return empty;
  const lang = raw.lang === 'pl' || raw.lang === 'en' ? raw.lang : 'en';
  const deadline = validDate(raw.deadline);
  return {
    ...empty,
    name: typeof raw.name === 'string' ? raw.name : '',
    company: typeof raw.company === 'string' ? raw.company : '',
    lang,
    address: raw.address === 'wy' ? 'wy' : 'ty',
    clientTypeId: settings.clientTypes.some((c) => c.id === raw.clientTypeId) ? raw.clientTypeId : 'sole',
    sections: (Array.isArray(raw.sections) ? raw.sections : []).map((s) => parseSection(s, settings, lang)).filter(Boolean),
    deadline,
    rush: deadline !== null && deadline >= today && deadline < addDays(today, 7),
    budget: typeof raw.budget === 'string' ? raw.budget : null,
    missing: strings(raw.missing),
    highlights: strings(raw.highlights),
  };
}

export function buildCopyPrompt({ quote, settings }) {
  const outline = quote.sections.filter((s) => s.type !== 'info').map((s) => ({
    id: s.id, type: s.type, eyebrow: s.eyebrow, title: s.title, intro: s.intro,
    items: (s.items ?? []).map((i) => ({ id: i.id, name: i.name, subtitle: i.subtitle, description: i.description, bullets: i.bullets })),
  }));
  return `${voice(settings.profile)}

Write the text of an offer PDF in ${languageName(quote.lang)} for ${quote.client.company || quote.client.name || 'the client'}.
${addressRule(quote)} The form of address code is "${quote.address}".
Speak about benefits for this client, not about the freelancer. Never mention prices. Keep existing good text.
needs: 2 to 4 rows naming what the client needs, label is one word, text is one or two sentences.
eyebrow: 1 to 3 words. title: a short heading without a final full stop. intro: at most 2 sentences.
Options: subtitle is a few words, bullets are 3 to 5 short points. Services: description is at most 2 sentences.

Client enquiry:
${quote.sourceMessage || '(none)'}

Offer outline:
${JSON.stringify(outline)}

Reply only with JSON, no other text, matching:
{ "needs": [{ "label": "", "text": "" }],
  "sections": [{ "id": "same id", "eyebrow": "", "title": "", "intro": "", "note": "",
    "items": [{ "id": "same id", "subtitle": "", "description": "", "bullets": [""] }] }] }`;
}

const clean = (v) => stripDashes(v).trim();
const cleanTitle = (v) => clean(v).replace(/\.+$/, '');

function mergeItem(item, raw) {
  if (!raw) return item;
  const merged = { ...item };
  for (const key of ['subtitle', 'description']) if (typeof raw[key] === 'string') merged[key] = clean(raw[key]);
  if (Array.isArray(raw.bullets)) merged.bullets = strings(raw.bullets).map(clean);
  return merged;
}

function mergeSection(section, raw) {
  if (!raw) return section;
  const merged = { ...section };
  for (const key of ['eyebrow', 'intro', 'note']) if (typeof raw[key] === 'string') merged[key] = clean(raw[key]);
  if (typeof raw.title === 'string') merged.title = cleanTitle(raw.title);
  if (section.items) {
    const rawItems = Array.isArray(raw.items) ? raw.items : [];
    merged.items = section.items.map((item) => mergeItem(item, rawItems.find((r) => r?.id === item.id)));
  }
  return merged;
}

export function parseCopy(raw, quote) {
  if (raw === null || typeof raw !== 'object') return quote;
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
  const needs = Array.isArray(raw.needs)
    ? raw.needs.filter((n) => typeof n?.label === 'string' && typeof n?.text === 'string').map((n) => ({ label: clean(n.label), text: clean(n.text) }))
    : [];
  return {
    ...quote,
    needs: needs.length ? needs : quote.needs,
    sections: quote.sections.map((s) => mergeSection(s, rawSections.find((r) => r?.id === s.id))),
  };
}

const TONES = {
  default: 'Keep it short and friendly.',
  shorter: 'Make it as short as possible, a few lines.',
  warmer: 'Make it noticeably warmer and more personal, still concise.',
};

/** The signed link never passes through Claude: one wrong character would break it. */
export function insertLink(text, url) {
  if (!url) return text.replaceAll('{{LINK}}', '').trim();
  return text.includes('{{LINK}}') ? text.replaceAll('{{LINK}}', url) : `${text}\n\n${url}`;
}

function offerFacts({ quote, totals, settings, offerUrl }) {
  return `Client: ${quote.client.name || 'unknown'}, ${quote.client.company || 'no company'}
Prices, never change them and never add new ones:
${offerLines(quote, totals).join('\n')}
Online offer link: ${offerUrl ? 'write exactly {{LINK}} where the link belongs' : '(not available, leave it out)'}
Signature, use exactly:
${signatureFrom(settings.profile)}`;
}

export function buildMessagePrompt({ quote, totals, settings, offerUrl, tone = 'default' }) {
  const hosting = totals.hasWebsite ? 'Mention that hosting and the domain are bought by the client on their own account.' : '';
  const missing = quote.missing.length ? `Ask these questions at the end:\n${quote.missing.join('\n')}` : '';
  return `${voice(settings.profile)}

Write a reply to a client in ${languageName(quote.lang)}, ready to paste into a DM or an email. ${addressRule(quote)}
Thank them, summarise the offer with its key prices, mention ${settings.profile.includedRounds} revision rounds are included and that work starts after a 50% deposit by bank transfer, say the PDF offer is attached and give the online link. ${hosting}
${TONES[tone] ?? TONES.default}
${missing}

Client enquiry:
${quote.sourceMessage || '(none)'}

${offerFacts({ quote, totals, settings, offerUrl })}

Reply only with the message text.`;
}

export function buildFollowUpPrompt({ quote, totals, settings, offerUrl }) {
  return `${voice(settings.profile)}

Write a short, polite follow up in ${languageName(quote.lang)} to a client who has not replied to an offer sent a few days ago. ${addressRule(quote)}
No pressure. Ask if they have questions and mention the offer is valid for ${settings.validityDays} days.

${offerFacts({ quote, totals, settings, offerUrl })}

Reply only with the message text.`;
}
