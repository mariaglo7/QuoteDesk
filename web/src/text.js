// Code written with help from Claude (Anthropic)

/** Maria's rule: no em dash, en dash or spaced hyphen in any text. */
export function stripDashes(s) {
  return String(s)
    .replace(/^[ \t]*[—–-][ \t]+/gm, '')
    .replace(/^[ \t]*[—–][ \t]*/gm, '')
    .replace(/[ \t]*[—–][ \t]*/g, ', ')
    .replace(/[ \t]+-[ \t]+/g, ', ')
    .replace(/,[ \t]*,/g, ',')
    .replace(/[ \t]{2,}/g, ' ');
}

export function slugify(s) {
  return String(s)
    .replace(/[łŁ]/g, 'l')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export function addDays(isoDate, n) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

export function offerFileName(company, date) {
  const stamp = toISODate(date).replaceAll('-', '');
  return `${slugify(company) || 'klient'}_oferta_${stamp}.pdf`;
}

export function formatMoney(n) {
  return `£${Number(n).toLocaleString('en-GB')}`;
}
