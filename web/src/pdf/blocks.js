// Code written with help from Claude (Anthropic)
// Drawing blocks of the offer PDF. Each block measures itself before it draws.
import { THEME as T } from './theme.js';
import { formatMoney, addDays } from '../text.js';
import { displayName } from '../profile.js';

export const LABELS = {
  pl: {
    offerFor: 'Oferta dla', forPerson: 'Dla:', validUntil: 'Oferta ważna do', needs: 'Czego potrzebujecie', needsTy: 'Czego potrzebujesz', page: 'Strona',
    recommended: 'Polecam', perMonth: '/ mies.', from: 'od', oneOff: 'jednorazowo', included: 'W cenie', files: 'Pliki',
    time: 'Czas', timeDefault: 'Termin realizacji do ustalenia.', terms: 'Warunki', online: 'Oferta online:',
    hostingerEyebrow: 'Strona internetowa', hostingerTitle: 'Hosting i domena',
    hostingerIntro: 'Hosting i domenę kupujesz na swoim koncie, dzięki czemu strona zawsze należy do Ciebie.',
  },
  en: {
    offerFor: 'Offer for', forPerson: 'For:', validUntil: 'Offer valid until', needs: 'What you need', needsTy: 'What you need', page: 'Page',
    recommended: 'Recommended', perMonth: '/ month', from: 'from', oneOff: 'one off', included: 'Included', files: 'Files',
    time: 'Timing', timeDefault: 'Delivery date to be agreed.', terms: 'Terms', online: 'Online offer:',
    hostingerEyebrow: 'Website', hostingerTitle: 'Hosting and domain',
    hostingerIntro: 'You buy hosting and the domain on your own account, so the website always belongs to you.',
  },
};


function setText(doc, font, size, color) {
  doc.setFont('Poppins', font);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

function drawLines(doc, lines, x, y, size, leading) {
  lines.forEach((line, i) => doc.text(line, x, y + i * size * leading));
}

function hairline(doc, x1, y, x2, color = T.line, width = 0.6) {
  doc.setDrawColor(color);
  doc.setLineWidth(width);
  doc.line(x1, y, x2, y);
}

function dot(doc, x, y, r, color = T.pink) {
  doc.setFillColor(color);
  doc.circle(x, y, r, 'F');
}

function check(doc, x, y, color) {
  doc.setDrawColor(color);
  doc.setLineWidth(0.8);
  doc.lines([[2.4, 2.6], [5, -6]], x, y - 0.5);
}

function strike(doc, text, x, y, color) {
  const w = doc.getTextWidth(text);
  doc.setDrawColor(color);
  doc.setLineWidth(0.6);
  doc.line(x, y - 3, x + w, y - 3);
}

/** Title with the brand's pink full stop. */
function titleWithDot(doc, lines, x, y, size, leading) {
  drawLines(doc, lines, x, y, size, leading);
  const last = lines[lines.length - 1];
  const lastY = y + (lines.length - 1) * size * leading;
  dot(doc, x + doc.getTextWidth(last) + size * 0.14, lastY - size * 0.055, size * 0.085);
}

export function priceLabel(priced, L) {
  return `${priced.priceFrom ? `${L.from} ` : ''}${formatMoney(priced.lineTotal)}`;
}

function imageSize(doc, dataUrl, maxW, maxH) {
  const p = doc.getImageProperties(dataUrl);
  const scale = Math.min(maxW / p.width, maxH / p.height);
  return { w: p.width * scale, h: p.height * scale };
}

function drawBrand(doc, { logo, name, x, y, maxW, maxH, size, color }) {
  if (logo) {
    const { w, h } = imageSize(doc, logo, maxW, maxH);
    doc.addImage(logo, x, y, w, h);
    return;
  }
  setText(doc, 'semibold', size, color);
  doc.text(doc.splitTextToSize(name, maxW)[0], x, y + size);
}

export function drawPageHeader(doc, { profile, quote, L, page }) {
  const m = T.margin;
  drawBrand(doc, { logo: profile.logoLight, name: displayName(profile), x: m, y: 54, maxW: 110, maxH: 32, size: 11, color: T.ink });
  setText(doc, 'light', 8, T.muted);
  const right = T.margin + T.contentWidth;
  doc.text(`${L.offerFor} ${quote.client.company || quote.client.name}`, right, 65, { align: 'right' });
  doc.text(`${L.page} ${page}`, right, 77.5, { align: 'right' });
  hairline(doc, m, 102, right);
}

export function drawCover(doc, { profile, coverImage, quote, L, flow, today, settings, report }) {
  const m = T.margin;
  const leftWidth = T.panelX - m - 20;
  doc.setFillColor(T.ink);
  doc.rect(T.panelX, 0, T.pageWidth - T.panelX, T.pageHeight, 'F');
  drawBrand(doc, { logo: profile.logoLight, name: displayName(profile), x: m, y: 56, maxW: 170, maxH: 56, size: 15, color: T.ink });

  const panelInner = T.pageWidth - T.panelX - 68;
  const panelX = T.panelX + 34;
  if (coverImage) {
    const props = doc.getImageProperties(coverImage);
    const w = panelInner;
    const h = Math.min(w * (props.height / props.width), 340);
    doc.addImage(coverImage, panelX + (panelInner - h * (props.width / props.height)) / 2, 205, h * (props.width / props.height), h);
  } else if (profile.logoDark) {
    const { w, h } = imageSize(doc, profile.logoDark, panelInner, 120);
    doc.addImage(profile.logoDark, panelX, 240, w, h);
  } else {
    setText(doc, 'semibold', 20, T.white);
    drawLines(doc, doc.splitTextToSize(displayName(profile), panelInner).slice(0, 3), panelX, 260, 20, 1.2);
  }

  const list = quote.coverList ?? quote.sections.map((s) => s.title).filter(Boolean);
  setText(doc, 'light', 8.5, T.onDark);
  list.slice(0, 6).forEach((text, i, arr) => {
    const lines = doc.splitTextToSize(text, panelInner);
    doc.text(lines[0], panelX, 780 - (arr.length - 1 - i) * 13);
  });

  const name = quote.client.company || quote.client.name;
  const heading = `${L.offerFor} ${name}`.trim();
  let size = 33;
  let lines = [];
  for (; size >= 20; size -= 2) {
    lines = name ? [L.offerFor, ...flow.wrap(name, 'semibold', size, leftWidth)] : flow.wrap(heading, 'semibold', size, leftWidth);
    if (lines.length <= 4) break;
  }
  setText(doc, 'semibold', size, T.ink);
  const leading = 1.1;
  const titleY = 266;
  titleWithDot(doc, lines, m, titleY, size, leading);
  const titleBottom = titleY + (lines.length - 1) * size * leading;

  let y = titleBottom + 40;
  setText(doc, 'light', 12, T.muted);
  if (quote.client.name) {
    doc.text(flow.wrap(`${L.forPerson} ${quote.client.name}`, 'light', 12, leftWidth - 20)[0], m, y);
    y += 18;
  }
  setText(doc, 'light', 8.5, T.muted);
  const until = addDays(today, settings.validityDays).split('-').reverse().join('.');
  doc.text(`${L.validUntil} ${until}`, m, y);

  const labelW = 90;
  const textW = T.panelX - m - 28 - labelW;
  const bottomLimit = 812;
  const layout = (fontSize) => {
    const list = quote.needs.map((n) => ({ ...n, lines: flow.wrap(n.text, 'light', fontSize, textW) }));
    const rowHeight = (r) => r.lines.length * fontSize * 1.54 + 18;
    return { list, rowHeight, total: list.reduce((sum, r) => sum + rowHeight(r), 0) };
  };
  const room = bottomLimit - (y + 34) - 15;
  let needsSize = 9.3;
  let fitted = layout(needsSize);
  while (fitted.total > room && needsSize > 7.6) {
    needsSize -= 0.5;
    fitted = layout(needsSize);
  }
  const rows = fitted.list;
  while (rows.length && rows.reduce((sum, r) => sum + fitted.rowHeight(r), 0) > room) {
    report.overflow.push(rows.pop().label);
  }
  const rowsHeight = rows.reduce((sum, r) => sum + fitted.rowHeight(r), 0);
  const needsTop = Math.max(y + 34, 788 - rowsHeight - 30);
  if (rows.length) {
    setText(doc, 'medium', 7.5, T.muted);
    doc.text((quote.address === 'wy' ? L.needs : L.needsTy).toUpperCase(), m, needsTop, { charSpace: 1.8 });
    let ry = needsTop + 15;
    for (const row of rows) {
      hairline(doc, m, ry, T.panelX - 28);
      setText(doc, 'light', needsSize, T.muted);
      doc.text(row.label, m, ry + 19);
      setText(doc, 'light', needsSize, T.ink);
      drawLines(doc, row.lines, m + labelW, ry + 19, needsSize, 1.54);
      ry += fitted.rowHeight(row);
    }
  }

  doc.setFont('Poppins', 'semibold');
  doc.setFontSize(size);
  report.cover = {
    titleMaxWidth: Math.max(...lines.map((l) => doc.getTextWidth(l))),
    titleBottom,
    needsTop,
  };
}

const TITLE_LEADING = 21 * 1.15;
const MAX_CARD_HEIGHT = 500;
const MAX_DESCRIPTION_LINES = 30;

/** Height of the section head, 0 when the section has no heading. */
export function measureSectionHead(section, flow) {
  if (!section.title && !section.eyebrow && !section.intro) return 0;
  const title = section.title ? flow.wrap(section.title, 'semibold', 21, T.contentWidth) : [];
  const intro = section.intro ? flow.wrap(section.intro, 'light', 11, 400) : [];
  const titleHeight = title.length ? 46 + (title.length - 1) * TITLE_LEADING + 28 : 22;
  return titleHeight + intro.length * 17.5 + (intro.length ? 8 : 0);
}

export function drawSectionHead(doc, section, flow) {
  const m = T.margin;
  let y = flow.y;
  if (section.eyebrow) {
    setText(doc, 'medium', 7.5, T.muted);
    doc.text(section.eyebrow.toUpperCase(), m, y + 14, { charSpace: 1.8 });
  }
  if (section.title) {
    const lines = flow.wrap(section.title, 'semibold', 21, T.contentWidth);
    y += 46;
    setText(doc, 'semibold', 21, T.ink);
    titleWithDot(doc, lines, m, y, 21, 1.15);
    y += (lines.length - 1) * TITLE_LEADING + 28;
  } else {
    y += 22;
  }
  if (section.intro) {
    const lines = flow.wrap(section.intro, 'light', 11, 400);
    setText(doc, 'light', 11, T.muted);
    drawLines(doc, lines, m, y, 11, 1.59);
    y += lines.length * 17.5 + 8;
  }
  flow.y = y - 6;
}

function measureCard(item, width, flow) {
  const inner = width - (width > 200 ? 36 : 24);
  const bullets = item.bullets.map((b) => flow.wrap(b, 'light', 8.8, inner - 14));
  const nameLines = flow.wrap(item.name, 'medium', 12, inner);
  const subLines = item.subtitle ? flow.wrap(item.subtitle, 'light', 8, inner) : [];
  const bulletsHeight = bullets.reduce((s, l) => s + l.length * 14 + 7, 0);
  const headHeight = 27 + nameLines.length * 16 + subLines.length * 13.5;
  return { inner, bullets, nameLines, subLines, bulletsHeight, headHeight };
}

function drawCard(doc, item, priced, m, x, y, width, height, dark, L) {
  const pad = width > 200 ? 18 : 15;
  const ink = dark ? T.white : T.ink;
  const soft = dark ? T.onDark : T.muted;
  const rule = dark ? T.darkLine : T.line;
  if (dark) {
    doc.setFillColor(T.ink);
    doc.roundedRect(x, y, width, height, T.cardRadius, T.cardRadius, 'F');
  } else {
    doc.setDrawColor(T.line);
    doc.setLineWidth(0.7);
    doc.roundedRect(x, y, width, height, T.cardRadius, T.cardRadius, 'S');
  }

  let cy = y + 27;
  setText(doc, 'medium', 12, ink);
  drawLines(doc, m.nameLines, x + pad, cy, 12, 1.33);
  cy += m.nameLines.length * 16 - 1;
  if (m.subLines.length) {
    setText(doc, 'light', 8, soft);
    drawLines(doc, m.subLines, x + pad, cy + 2, 8, 1.69);
    cy += m.subLines.length * 13.5;
  }
  cy = y + m.headHeight + 26;

  const price = priceLabel(priced, L);
  const size = width > 200 ? 24 : 21;
  setText(doc, 'semibold', size, ink);
  doc.text(price, x + pad, cy);
  if (priced.monthly) {
    const w = doc.getTextWidth(price);
    setText(doc, 'light', 8.8, soft);
    doc.text(L.perMonth, x + pad + w + 4, cy);
  }
  cy += 13;

  for (const lines of m.bullets) {
    hairline(doc, x + pad, cy, x + width - pad, rule);
    cy += 15;
    dot(doc, x + pad + 2.5, cy - 3.2, 2.4);
    setText(doc, 'light', 8.8, ink);
    drawLines(doc, lines, x + pad + 14, cy, 8.8, 1.59);
    cy += (lines.length - 1) * 14 + 6;
  }

  if (dark) {
    const label = L.recommended;
    setText(doc, 'medium', 7.5, T.ink);
    const w = doc.getTextWidth(label) + 18;
    doc.setFillColor(T.pink);
    doc.roundedRect(x + pad, y - 8, w, 16, 8, 8, 'F');
    doc.text(label, x + pad + 9, y + 2.6);
  }
}

const cardHeight = (m) => m.headHeight + 39 + m.bulletsHeight;

export function measureOptionRow(section, flow) {
  const n = section.items.length;
  const gap = n === 2 ? 16 : 13;
  const width = (T.contentWidth - gap * (n - 1)) / n;
  const measures = section.items.map((item) => measureCard(item, width, flow));
  let clipped = false;
  for (;;) {
    const tallest = measures.reduce((a, b) => (cardHeight(b) > cardHeight(a) ? b : a));
    if (cardHeight(tallest) + 12 <= MAX_CARD_HEIGHT || tallest.bullets.length === 0) break;
    const removed = tallest.bullets.pop();
    tallest.bulletsHeight -= removed.length * 14 + 7;
    clipped = true;
  }
  const height = Math.max(...measures.map(cardHeight)) + 12;
  return { n, gap, width, measures, height, clipped };
}

export function drawOptionCards(doc, section, totals, flow, L, report) {
  const { gap, width, measures, height, clipped } = measureOptionRow(section, flow);
  if (clipped) report.overflow.push(section.title || section.items[0].name);
  flow.ensure(height + 8);
  const y = flow.y + 4;
  section.items.forEach((item, i) => {
    const x = T.margin + i * (width + gap);
    drawCard(doc, item, totals.items[item.id], measures[i], x, y, width, height, item.id === section.recommendedId, L);
  });
  report.cardRows.push({ heights: section.items.map(() => height), bottom: y + height });
  flow.y = y + height + 12;
}

export function measureServiceRow(item, flow) {
  const nameLines = flow.wrap(item.name, 'medium', 11.5, 395);
  const all = item.description ? flow.wrap(item.description, 'light', 8.8, 420) : [];
  const clipped = all.length > MAX_DESCRIPTION_LINES;
  const lines = clipped ? [...all.slice(0, MAX_DESCRIPTION_LINES - 1), `${all[MAX_DESCRIPTION_LINES - 1]}…`] : all;
  const nameExtra = (nameLines.length - 1) * 15;
  return { nameLines, nameExtra, lines, clipped, height: 34 + nameExtra + lines.length * 14.5 + 12 };
}

export function drawServiceRows(doc, section, totals, flow, L, report) {
  const right = T.margin + T.contentWidth;
  for (const item of section.items) {
    const { nameLines, nameExtra, lines, clipped, height } = measureServiceRow(item, flow);
    if (clipped) report.overflow.push(item.name);
    flow.ensure(height);
    const y = flow.y;
    const priced = totals.items[item.id];
    hairline(doc, T.margin, y, right);
    setText(doc, 'medium', 11.5, T.ink);
    drawLines(doc, nameLines, T.margin, y + 26, 11.5, 1.3);
    setText(doc, 'semibold', 12.5, T.ink);
    const price = priced.lineTotal === null ? '' : priceLabel(priced, L) + (priced.monthly ? ` ${L.perMonth}` : '');
    doc.text(price, right, y + 26, { align: 'right' });
    if (item.subNote) {
      setText(doc, 'light', 8, T.muted);
      doc.text(item.subNote, right, y + 40, { align: 'right' });
    }
    setText(doc, 'light', 8.8, T.ink);
    drawLines(doc, lines, T.margin, y + 46 + nameExtra, 8.8, 1.65);
    flow.y = y + height;
  }
  hairline(doc, T.margin, flow.y, right);
  flow.y += 12;
}

const bundleLines = (bundle, flow) => flow.wrap(bundle.name, 'light', 9.3, 360);
const bundleRowHeight = (lines) => 25 + (lines.length - 1) * 13.5;

/** Room for the opening rule and the first row. */
export function measureBundleStart(section, flow) {
  return 13 + bundleRowHeight(bundleLines(section.bundles[0], flow)) + 14;
}

export function drawBundleRows(doc, section, totals, flow) {
  const right = T.margin + T.contentWidth;
  flow.ensure(measureBundleStart(section, flow));
  hairline(doc, T.margin, flow.y, right, T.ink, 1.3);
  flow.y += 13;
  for (const bundle of section.bundles) {
    const lines = bundleLines(bundle, flow);
    const height = bundleRowHeight(lines);
    flow.ensure(height);
    const priced = totals.bundles[bundle.id];
    const y = flow.y;
    setText(doc, 'light', 9.3, T.ink);
    drawLines(doc, lines, T.margin, y + 14, 9.3, 1.45);
    setText(doc, 'semibold', 9.3, T.ink);
    const price = formatMoney(priced.price);
    const px = right - 17 - doc.getTextWidth(price);
    doc.text(price, px, y + 14);
    setText(doc, 'light', 9.3, T.muted);
    const old = formatMoney(priced.fullPrice);
    const ox = px - 9 - doc.getTextWidth(old);
    doc.text(old, ox, y + 14);
    strike(doc, old, ox, y + 14, T.muted);
    hairline(doc, T.margin, y + height - 0.5, right);
    flow.y = y + height;
  }
  flow.y += 14;
}

function bannerLabels(bundle, quote) {
  const items = quote.sections.flatMap((s) => s.items ?? []);
  return bundle.labels ?? bundle.itemIds.map((id) => items.find((i) => i.id === id)?.name).filter(Boolean);
}

export function measureBanner(bundle, quote, flow) {
  const nameLines = flow.wrap(bundle.name, 'semibold', 15, 300);
  const labels = bannerLabels(bundle, quote).map((label) => {
    const lines = flow.wrap(label, 'light', 9, 158);
    return lines.length > 1 ? `${lines[0]}…` : lines[0];
  });
  const rows = Math.ceil(labels.length / 2);
  const nameExtra = (nameLines.length - 1) * 19;
  return { nameLines, nameExtra, labels, rows, height: Math.max(44 + nameExtra + rows * 18 + 20, 96) };
}

export function drawBundleBanner(doc, section, totals, flow, quote) {
  const right = T.margin + T.contentWidth;
  for (const bundle of section.bundles) {
    const { nameLines, nameExtra, labels, rows, height } = measureBanner(bundle, quote, flow);
    flow.ensure(height + 16);
    const y = flow.y + 6;
    doc.setFillColor(T.ink);
    doc.roundedRect(T.margin, y, T.contentWidth, height, T.cardRadius, T.cardRadius, 'F');
    setText(doc, 'semibold', 15, T.pink);
    drawLines(doc, nameLines, T.margin + 23, y + 33, 15, 1.27);
    labels.forEach((label, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      const lx = T.margin + 23 + col * 186;
      const ly = y + 55 + nameExtra + row * 18;
      check(doc, lx, ly - 2.4, T.pink);
      setText(doc, 'light', 9, T.white);
      doc.text(label, lx + 10, ly);
    });
    const priced = totals.bundles[bundle.id];
    const px = right - 23;
    setText(doc, 'light', 10.5, T.onDark);
    const old = formatMoney(priced.fullPrice);
    doc.text(old, px, y + 30, { align: 'right' });
    strike(doc, old, px - doc.getTextWidth(old), y + 30, T.onDark);
    setText(doc, 'semibold', 28, T.white);
    doc.text(formatMoney(priced.price), px, y + 60, { align: 'right' });
    if (bundle.caption) {
      setText(doc, 'light', 9, T.onDark);
      doc.text(bundle.caption, px, y + 76, { align: 'right' });
    }
    flow.y = y + height + 14;
  }
}

export function drawInfoCards(doc, section, flow, L, settings, lang) {
  const defaults = settings.infoCards[lang];
  const cards = [
    [L.included, (section.included || defaults.included).replaceAll('{rounds}', settings.profile.includedRounds)],
    [L.files, section.files || defaults.files],
    [L.time, section.time || L.timeDefault],
  ];
  const gap = 14;
  const width = (T.contentWidth - gap * 2) / 3;
  const wrapped = cards.map(([, text]) => flow.wrap(text, 'light', 8.8, width - 30));
  const height = 46 + Math.max(...wrapped.map((l) => l.length)) * 14 + 8;
  flow.ensure(height + 8);
  const y = flow.y;
  cards.forEach(([title], i) => {
    const x = T.margin + i * (width + gap);
    doc.setDrawColor(T.line);
    doc.setLineWidth(0.7);
    doc.roundedRect(x, y, width, height, 9, 9, 'S');
    setText(doc, 'medium', 10, T.ink);
    doc.text(title, x + 15, y + 25);
    setText(doc, 'light', 8.8, T.ink);
    drawLines(doc, wrapped[i], x + 15, y + 45, 8.8, 1.59);
  });
  flow.y = y + height + 14;
}

export function drawNote(doc, note, flow) {
  const lines = flow.wrap(note, 'light', 8.5, T.contentWidth);
  flow.ensure(lines.length * 13 + 10);
  setText(doc, 'light', 8.5, T.muted);
  drawLines(doc, lines, T.margin, flow.y + 12, 8.5, 1.5);
  flow.y += lines.length * 13 + 14;
}

/** Wraps a sentence whose first line starts after a bold word. */
function wrapAfterBold(doc, term, extraRound, width) {
  doc.setFontSize(8.8);
  doc.setFont('Poppins', 'medium');
  const boldWidth = doc.getTextWidth(term.bold);
  doc.setFont('Poppins', 'light');
  const text = term.text.replaceAll('{extraRound}', extraRound);
  const gap = text.startsWith(':') ? '' : ' ';
  const start = boldWidth + doc.getTextWidth(gap);
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    const limit = lines.length === 0 ? width - start : width;
    if (doc.getTextWidth(next) > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  return { lines, start };
}

export function drawTerms(doc, { terms, flow, L, offerUrl, extraRound, rounds, report }) {
  const colGap = 28;
  const width = (T.contentWidth - colGap) / 2;
  const rows = [];
  for (let i = 0; i < terms.length; i += 2) rows.push(terms.slice(i, i + 2));
  const wrapped = terms.map((t) => wrapAfterBold(doc, { ...t, text: t.text.replaceAll('{rounds}', rounds) }, extraRound, width));
  const rowHeight = (r) => Math.max(wrapped[r * 2].lines.length, wrapped[r * 2 + 1]?.lines.length ?? 0) * 14.5 + 20;
  const total = rows.reduce((s, _, r) => s + rowHeight(r), 34) + (offerUrl ? 22 : 0);
  flow.ensure(total);
  report.termsPage = doc.getNumberOfPages();

  let y = flow.y + 12;
  setText(doc, 'medium', 7.5, T.muted);
  doc.text(L.terms.toUpperCase(), T.margin, y, { charSpace: 1.8 });
  y += 20;
  rows.forEach((row, r) => {
    row.forEach((term, c) => {
      const x = T.margin + c * (width + colGap);
      const { lines, start } = wrapped[r * 2 + c];
      setText(doc, 'medium', 8.8, T.ink);
      doc.text(term.bold, x, y + 10);
      setText(doc, 'light', 8.8, T.ink);
      doc.text(lines[0], x + start, y + 10);
      drawLines(doc, lines.slice(1), x, y + 10 + 14.5, 8.8, 1.65);
      hairline(doc, x, y + rowHeight(r) - 6, x + width);
    });
    y += rowHeight(r);
  });
  if (offerUrl) {
    setText(doc, 'light', 8, T.muted);
    const short = offerUrl.split('#')[0].replace(/^https?:\/\//, '');
    doc.textWithLink(`${L.online} ${short}`, T.margin, y + 12, { url: offerUrl });
    y += 22;
  }
  flow.y = y;
}

export function drawHostingerPage(doc, { text, flow, L }) {
  flow.newPage();
  drawSectionHead(doc, { eyebrow: L.hostingerEyebrow, title: L.hostingerTitle, intro: L.hostingerIntro }, flow);
  flow.y += 12;
  text.split('\n').filter(Boolean).forEach((step, i) => {
    const lines = flow.wrap(step, 'light', 10.5, T.contentWidth - 34);
    hairline(doc, T.margin, flow.y, T.margin + T.contentWidth);
    setText(doc, 'semibold', 12, T.pink);
    doc.text(String(i + 1), T.margin, flow.y + 24);
    setText(doc, 'light', 10.5, T.ink);
    drawLines(doc, lines, T.margin + 34, flow.y + 24, 10.5, 1.5);
    flow.y += 24 + lines.length * 15.75 + 8;
  });
}
