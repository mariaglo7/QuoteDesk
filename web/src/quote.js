// Code written with help from Claude (Anthropic)
// Quote building blocks shared by the Claude parsers, templates and the Desk.
import { formatMoney } from './text.js';

export function newId() {
  return crypto.randomUUID().slice(0, 8);
}

export function newQuote(now = new Date()) {
  return {
    id: newId(), kind: 'quote', createdAt: now.toISOString(), sentAt: null, status: 'draft',
    client: { name: '', company: '', email: '' }, lang: 'pl', address: 'ty',
    clientTypeId: 'sole', rush: false, deadline: null,
    needs: [], coverAssetId: null, sections: [], sourceMessage: '', missing: [], message: '',
  };
}

export function emptyItem(extra = {}) {
  return {
    id: newId(), serviceId: null, name: '', subtitle: '', description: '', bullets: [], qty: 1,
    unitPriceOverride: null, priceFrom: false, subNote: '', sourceQuote: null, ...extra,
  };
}

export function itemFromService(service, lang, qty = 1) {
  const en = lang === 'en';
  return emptyItem({
    serviceId: service.id,
    name: en ? service.nameEn : service.namePl,
    description: (en ? service.descEn : service.descPl) ?? '',
    bullets: [...((en ? service.bulletsEn : service.bulletsPl) ?? [])],
    qty,
  });
}

/** Short "name: price" lines for messages. */
export function offerLines(quote, totals) {
  const en = quote.lang === 'en';
  const from = en ? 'from ' : 'od ';
  const perMonth = en ? '/month' : '/mies.';
  const lines = [];
  for (const section of quote.sections) {
    for (const item of section.items ?? []) {
      const priced = totals.items[item.id];
      if (priced.lineTotal === null) continue;
      lines.push(`${item.name}: ${priced.priceFrom ? from : ''}${formatMoney(priced.lineTotal)}${priced.monthly ? perMonth : ''}`);
    }
    for (const bundle of section.bundles ?? []) {
      lines.push(`${bundle.name}: ${formatMoney(totals.bundles[bundle.id].price)}`);
    }
  }
  return lines;
}
