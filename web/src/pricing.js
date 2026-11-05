// Code written with help from Claude (Anthropic)
// All prices are computed here, never by Claude.

/** Rounds up to a full £5, removing float noise first (200 * 1.2 must stay 240). */
export function roundUp5(x) {
  return Math.ceil(Math.round(x * 100) / 100 / 5) * 5;
}

/** Sum minus the bundle discount, down to the nearest amount ending in 9. */
export function bundlePrice(full, settings) {
  const t = Math.floor(Math.round(full * (1 - settings.bundleDiscount) * 100) / 100);
  return Math.max(0, t - (((t - 9) % 10) + 10) % 10);
}

function findService(item, settings) {
  return settings.priceList.find((p) => p.id === item.serviceId) ?? null;
}

function basePrice(service, quote, settings) {
  if (!service.applyMultiplier) return service.price;
  const type = settings.clientTypes.find((c) => c.id === quote.clientTypeId);
  const rush = quote.rush ? 1 + settings.rushRate : 1;
  return roundUp5(service.price * (type?.multiplier ?? 1) * rush);
}

export function priceItem(item, quote, settings) {
  const service = findService(item, settings);
  const qty = item.qty ?? 1;
  const unitPrice = item.unitPriceOverride ?? (service ? basePrice(service, quote, settings) : null);
  return {
    unitPrice,
    lineTotal: unitPrice === null ? null : unitPrice * qty,
    monthly: service ? service.unit === 'month' : Boolean(item.monthly),
    priceFrom: Boolean(item.priceFrom || service?.priceFrom),
    needsPrice: unitPrice === null,
  };
}

function estimatedItems(section) {
  if (section.type === 'services') return section.items;
  if (section.type === 'options') {
    const chosen = section.items.find((i) => i.id === section.recommendedId) ?? section.items[0];
    return chosen ? [chosen] : [];
  }
  return [];
}

export function calcQuote(quote, settings) {
  const items = {};
  const categories = new Set();
  for (const section of quote.sections) {
    for (const item of section.items ?? []) {
      items[item.id] = priceItem(item, quote, settings);
      const category = findService(item, settings)?.category ?? item.category;
      if (category) categories.add(category);
    }
  }

  const bundles = {};
  for (const section of quote.sections) {
    for (const bundle of section.bundles ?? []) {
      const fullPrice = bundle.itemIds.reduce((sum, id) => sum + (items[id]?.lineTotal ?? 0), 0);
      bundles[bundle.id] = { fullPrice, price: bundle.priceOverride ?? bundlePrice(fullPrice, settings) };
    }
  }

  const estimate = { oneOff: 0, monthly: 0 };
  for (const section of quote.sections) {
    for (const item of estimatedItems(section)) {
      const priced = items[item.id];
      estimate[priced.monthly ? 'monthly' : 'oneOff'] += priced.lineTotal ?? 0;
    }
  }

  return {
    items,
    bundles,
    estimate,
    needsPrice: Object.values(items).some((i) => i.needsPrice),
    hasWebsite: categories.has('website'),
    hasPrint: categories.has('print'),
  };
}
