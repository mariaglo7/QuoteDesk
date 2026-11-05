// Code written with help from Claude (Anthropic)
import { t } from '../i18n.js';
import { h, claudeErrorText } from './dom.js';
import { buildExtractPrompt, parseExtraction } from '../claude.js';
import { newId, newQuote } from '../quote.js';
import { toISODate } from '../text.js';

const infoSection = () => ({ id: newId(), type: 'info', included: '', files: '', time: '' });

function quoteFromExtraction(extraction, message) {
  return {
    ...newQuote(),
    client: { name: extraction.name, company: extraction.company, email: '' },
    lang: extraction.lang, address: extraction.address, clientTypeId: extraction.clientTypeId,
    rush: extraction.rush, deadline: extraction.deadline, budget: extraction.budget,
    sections: extraction.sections.length ? [...extraction.sections, infoSection()] : [],
    sourceMessage: message, missing: extraction.missing, highlights: extraction.highlights,
  };
}

export function renderInbox(root, ctx) {
  const { sample, settings, navigate } = ctx;
  const box = h('textarea', { id: 'client-message', rows: 10, value: ctx.inboxDraft, onInput: (e) => { ctx.inboxDraft = e.target.value; }, placeholder: t('Hej! Otwieram piekarnię w Aberdeen i potrzebuję logo i prostej strony…') });
  const error = h('p', { class: 'error', role: 'alert' });

  async function read(button) {
    const message = box.value.trim();
    if (!message) {
      error.textContent = t('Wklej najpierw wiadomość od klienta.');
      return;
    }
    if (!sample) {
      navigate('desk', { ...newQuote(), sourceMessage: message });
      return;
    }
    const token = ctx.navToken;
    button.disabled = true;
    button.textContent = t('Czytam wiadomość…');
    error.textContent = '';
    try {
      const raw = await sample.json(buildExtractPrompt(message, settings, toISODate(new Date())));
      const quote = quoteFromExtraction(parseExtraction(raw, settings, toISODate(new Date())), message);
      await ctx.store.saveQuote(quote);
      ctx.inboxDraft = '';
      if (ctx.navToken !== token) {
        ctx.toast(t('Oferta czeka na liście ofert.'));
        return;
      }
      ctx.autoCopy = quote.sections.length > 0;
      navigate('desk', quote);
    } catch (e) {
      if (e?.code === 'rate_limited') {
        error.textContent = claudeErrorText(e);
        button.disabled = false;
        button.textContent = t('Przeczytaj');
        return;
      }
      ctx.toast(claudeErrorText(e));
      if (ctx.navToken === token) navigate('desk', { ...newQuote(), sourceMessage: message });
    }
  }

  const readButton = h('button', { class: 'btn primary', onClick: (e) => read(e.currentTarget) }, t('Przeczytaj'));
  root.append(h('div', { class: 'page narrow' },
    h('h1', {}, t('Wklej wiadomość od klienta')),
    h('p', { class: 'muted' }, t('Mail, DM z Instagrama albo notatka z rozmowy. Claude rozpozna, czego klient potrzebuje, a Ty sprawdzisz ceny.')),
    box,
    error,
    h('div', { class: 'row' }, readButton, h('button', { class: 'btn', onClick: () => navigate('desk', newQuote()) }, t('Zacznij od zera'))),
    sample ? '' : h('p', { class: 'small muted' }, t('Claude jest dostępny po otwarciu aplikacji na claude.ai. Tutaj uzupełnisz ofertę ręcznie.')),
  ));
}
