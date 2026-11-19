// Code written with help from Claude (Anthropic)
// Builds the whole offer PDF from a quote, in the style of the Harbour Light Co reference.
import { THEME, registerFonts, applyTheme } from './theme.js';
import { createFlow } from './layout.js';
import { formatMoney, setCurrency } from '../text.js';
import {
  LABELS, drawCover, drawPageHeader, measureSectionHead, drawSectionHead, measureOptionRow, drawOptionCards,
  measureServiceRow, drawServiceRows, measureBanner, measureBundleStart, drawBundleRows, drawBundleBanner, drawInfoCards, drawNote, drawTerms, drawHostingerPage,
} from './blocks.js';

function visibleTerms(settings, lang, totals) {
  return settings.terms[lang].filter((t) => {
    if (t.key === 'print') return totals.hasPrint;
    if (t.key === 'hosting') return totals.hasWebsite;
    return true;
  });
}

/** Room the first block of a section needs, so a head never stays alone at the page bottom. */
function firstBlockHeight(section, flow, ctx) {
  if (section.type === 'options') return measureOptionRow(section, flow).height + 18;
  if (section.type === 'services') return measureServiceRow(section.items[0], flow).height;
  if (section.type === 'bundles' && section.style === 'banner') return measureBanner(section.bundles[0], ctx.quote, flow).height + 16;
  if (section.type === 'bundles') return measureBundleStart(section, flow);
  return 90;
}

const hasContent = (section) => section.type === 'info' || (section.items ?? section.bundles ?? []).length > 0;

function drawSection(doc, section, ctx) {
  const { flow, totals, L, settings, quote, report } = ctx;
  if (section.newPage && flow.y > THEME.contentTop) flow.newPage();
  const headHeight = measureSectionHead(section, flow);
  if (headHeight) {
    flow.ensure(headHeight + firstBlockHeight(section, flow, ctx));
    const page = doc.getNumberOfPages();
    drawSectionHead(doc, section, flow);
    flow.pendingHead = { page, nextBlockPage: null };
    report.heads.push(flow.pendingHead);
  }
  if (section.type === 'options') drawOptionCards(doc, section, totals, flow, L, report);
  if (section.type === 'services') drawServiceRows(doc, section, totals, flow, L, report);
  if (section.type === 'bundles' && section.style === 'banner') drawBundleBanner(doc, section, totals, flow, quote);
  if (section.type === 'bundles' && section.style !== 'banner') drawBundleRows(doc, section, totals, flow);
  if (section.type === 'info') drawInfoCards(doc, section, flow, L, settings, quote.lang);
  if (section.note) drawNote(doc, section.note, flow);
}

export function renderOfferPdf({ jsPDF, fonts, coverImage = null, quote, totals, settings, offerUrl = '', today, compress = true, report = {} }) {
  const { profile } = settings;
  setCurrency(profile.currency);
  const restoreTheme = applyTheme(profile);
  report.theme = { dark: THEME.ink, accent: THEME.pink };
  try {
    return draw({ jsPDF, fonts, coverImage, quote, totals, settings, offerUrl, today, compress, report, profile });
  } finally {
    restoreTheme();
  }
}

function draw({ jsPDF, fonts, coverImage, quote, totals, settings, offerUrl, today, compress, report, profile }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress });
  registerFonts(doc, fonts);
  const L = LABELS[quote.lang] ?? LABELS.pl;
  report.cardRows = [];
  report.heads = [];
  report.overflow = [];
  doc.setProperties({ title: `${L.offerFor} ${quote.client.company || quote.client.name}` });

  const flow = createFlow({ doc, header: (page) => drawPageHeader(doc, { profile, quote, L, page }) });
  drawCover(doc, { profile, coverImage, quote, L, flow, today, settings, report });

  flow.newPage();
  const ctx = { flow, totals, L, settings, quote, report };
  for (const section of quote.sections.filter(hasContent)) drawSection(doc, section, ctx);

  drawTerms(doc, {
    report,
    terms: visibleTerms(settings, quote.lang, totals), flow, L, offerUrl,
    extraRound: formatMoney(settings.extraRoundPrice),
    rounds: String(profile.includedRounds),
  });
  if (totals.hasWebsite) {
    drawHostingerPage(doc, { text: quote.lang === 'en' ? settings.hostingerEn : settings.hostingerPl, flow, L });
  }
  return doc;
}
