// Code written with help from Claude (Anthropic)
import { t, uiLang } from '../i18n.js';
import { h, copyText, claudeErrorText } from './dom.js';
import { calcQuote } from '../pricing.js';
import { effectiveStatus, isFollowUpDue } from '../status.js';
import { buildFollowUpPrompt, insertLink } from '../claude.js';
import { fallbackFollowUp } from '../templates.js';
import { formatMoney, stripDashes } from '../text.js';

const STATUSES = [['draft', 'Szkic'], ['sent', 'Wysłana'], ['interested', 'Chce rozmawiać'], ['agreed', 'Ustalona'], ['deposit_paid', 'Zaliczka wpłacona'], ['rejected', 'Odrzucona']];
const PILL = { expired: 'warn', interested: 'pink', agreed: 'pink', deposit_paid: 'ok' };

function amount(totals) {
  const { oneOff, monthly } = totals.estimate;
  const parts = [];
  if (oneOff) parts.push(formatMoney(oneOff));
  if (monthly) parts.push(`${formatMoney(monthly)}/mies.`);
  return parts.join(' + ') || formatMoney(0);
}

function inThisMonth(iso, now) {
  return Boolean(iso) && iso.slice(0, 7) === now.toISOString().slice(0, 7);
}

function followUpBox(quote, totals, ctx) {
  const area = h('textarea', { rows: 7, 'aria-label': t('Follow up') });
  const box = h('div', { class: 'stack', style: 'grid-column:1/-1' }, area,
    h('div', {}, h('button', { class: 'btn', onClick: () => copyText(area.value, area, ctx.toast) }, t('Kopiuj'))));
  const args = { quote, totals, settings: ctx.settings, offerUrl: '' };
  area.value = fallbackFollowUp(args);
  if (ctx.sample) {
    area.value = t('Claude pisze follow up…');
    ctx.sample(buildFollowUpPrompt(args), { cache: false }).then(({ text }) => { area.value = insertLink(stripDashes(text), ''); }).catch((e) => {
      ctx.toast(claudeErrorText(e));
      area.value = fallbackFollowUp(args);
    });
  }
  return box;
}

function quoteRow(quote, ctx, now, redraw) {
  const totals = calcQuote(quote, ctx.settings);
  const status = effectiveStatus(quote, now, ctx.settings);
  const label = status === 'expired' ? t('Wygasła') : t(STATUSES.find(([id]) => id === status)?.[1] ?? '');
  const row = h('article', { class: 'quote' });
  row.append(
    h('div', {},
      h('h2', {}, h('button', { class: 'btn link', onClick: () => ctx.navigate('desk', quote) }, quote.client.company || quote.client.name || t('Bez nazwy'))),
      h('p', { class: 'small muted' }, new Date(quote.createdAt).toLocaleDateString(uiLang() === 'en' ? 'en-GB' : 'pl-PL')),
    ),
    h('div', { class: 'amount' }, amount(totals)),
    h('div', { class: 'row' },
      h('span', { class: `pill ${PILL[status] ?? ''}` }, label),
      isFollowUpDue(quote, now, ctx.settings) ? h('span', { class: 'pill warn' }, t('{n} dni bez odpowiedzi', { n: ctx.settings.followUpDays })) : '',
    ),
    h('div', { class: 'row end' },
      isFollowUpDue(quote, now, ctx.settings) ? h('button', { class: 'btn small primary', onClick: (e) => { e.currentTarget.disabled = true; row.append(followUpBox(quote, totals, ctx)); } }, t('Napisz follow up')) : '',
      h('select', {
        'aria-label': t('Zmień status'), style: 'width:auto',
        onChange: (e) => {
          quote.status = e.target.value;
          if (quote.status === 'sent' && !quote.sentAt) quote.sentAt = now.toISOString();
          ctx.store.saveQuote(quote).then(redraw).catch(() => ctx.toast(t('Nie udało się zapisać oferty.')));
        },
      }, STATUSES.map(([id, text]) => h('option', { value: id, selected: quote.status === id }, t(text)))),
    ),
  );
  return row;
}

export function renderQuotes(root, ctx) {
  const page = h('div', { class: 'page narrow' }, h('h1', {}, t('Oferty')), h('p', { class: 'muted' }, t('Ładuję oferty…')));
  root.append(page);

  async function draw() {
    let quotes;
    try {
      quotes = await ctx.store.listQuotes();
    } catch {
      page.replaceChildren(h('h1', {}, t('Oferty')), h('p', { class: 'error' }, t('Nie udało się wczytać ofert. Odśwież stronę.')));
      return;
    }
    const now = new Date();
    quotes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const sum = (list) => list.reduce((s, q) => s + calcQuote(q, ctx.settings).estimate.oneOff, 0);
    const sentThisMonth = quotes.filter((q) => inThisMonth(q.sentAt, now));
    const won = sentThisMonth.filter((q) => ['agreed', 'deposit_paid'].includes(q.status));
    page.replaceChildren(
      h('h1', {}, t('Oferty')),
      quotes.length ? h('div', { class: 'stats' },
        h('div', {}, h('b', {}, formatMoney(sum(sentThisMonth))), h('span', { class: 'small muted' }, t('wysłane w tym miesiącu'))),
        h('div', {}, h('b', {}, formatMoney(sum(won))), h('span', { class: 'small muted' }, t('ustalone w tym miesiącu'))),
      ) : '',
      quotes.length
        ? h('div', { class: 'list' }, quotes.map((q) => quoteRow(q, ctx, now, draw)))
        : h('p', { class: 'muted' }, t('Brak ofert. Wklej pierwszą wiadomość od klienta.')),
    );
  }
  draw();
}
