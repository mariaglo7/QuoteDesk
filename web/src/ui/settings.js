// Code written with help from Claude (Anthropic)
import { t, uiLang } from '../i18n.js';
import { h, field, textInput, textArea, numberInput, linesArea, copyText, debounce } from './dom.js';
import { newId } from '../quote.js';
import { setCurrency } from '../text.js';

const UNITS = [['item', 'sztuka'], ['page', 'podstrona'], ['month', 'miesiąc']];
const CATEGORIES = [['branding', 'Branding'], ['print', 'Druk'], ['website', 'Strona'], ['social', 'Social media'], ['care', 'Opieka'], ['other', 'Inne']];

function select(obj, key, options, onChange) {
  return h('select', { onChange: (e) => { obj[key] = e.target.value; onChange(); } },
    options.map(([value, label]) => h('option', { value, selected: obj[key] === value }, t(label))));
}

function checkbox(obj, key, label, onChange) {
  return h('label', { class: 'c' }, h('input', { type: 'checkbox', checked: Boolean(obj[key]), onChange: (e) => { obj[key] = e.target.checked; onChange(); } }), label);
}

function serviceEditor(service, onChange, remove) {
  return h('details', {},
    h('summary', {}, `${(uiLang() === 'en' ? service.nameEn : service.namePl) || t('Nowa usługa')}, £${service.price ?? 0}`),
    h('div', { class: 'inner' },
      h('div', { class: 'grid2' },
        field(t('Nazwa PL'), textInput(service, 'namePl', onChange)),
        field(t('Nazwa EN'), textInput(service, 'nameEn', onChange)),
        field(t('Cena bazowa (£)'), numberInput(service, 'price', onChange)),
        field(t('Jednostka'), select(service, 'unit', UNITS, onChange)),
        field(t('Kategoria'), select(service, 'category', CATEGORIES, onChange)),
      ),
      h('div', { class: 'row' }, checkbox(service, 'applyMultiplier', t('Podlega mnożnikowi i ekspresowi'), onChange), checkbox(service, 'priceFrom', t('Cena „od”'), onChange)),
      h('div', { class: 'grid2' },
        field(t('Opis PL'), textArea(service, 'descPl', onChange)),
        field(t('Opis EN'), textArea(service, 'descEn', onChange)),
        field(t('Punkty PL, jeden w linii'), linesArea(service, 'bulletsPl', onChange)),
        field(t('Punkty EN, jeden w linii'), linesArea(service, 'bulletsEn', onChange)),
      ),
      h('div', { class: 'row end' }, h('button', { class: 'btn small', onClick: remove }, t('Usuń usługę'))),
    ));
}

function termsEditor(settings, lang, onChange) {
  return settings.terms[lang].map((term) => field(`${lang.toUpperCase()}: ${term.bold}`, textArea(term, 'text', onChange)));
}

export function renderSettings(root, ctx) {
  const { settings, store, toast } = ctx;
  const page = h('div', { class: 'page narrow' });
  root.append(page);
  const status = h('span', { class: 'small muted' });

  async function toPng(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => { canvas.toBlob(resolve, 'image/png'); });
  }

  async function save() {
    try {
      await store.saveSettings(settings);
      status.textContent = t('Zapisano');
      ctx.refreshBanners();
    } catch {
      status.textContent = t('Nie udało się zapisać. Spróbuj ponownie.');
    }
  }

  const autosave = debounce(save, 800);
  const changed = () => {
    status.textContent = t('Zapisuję…');
    autosave();
  };
  ctx.leave = () => autosave.flush();

  async function logoInput(key, label) {
    const preview = h('img', { alt: '', style: 'max-height:48px;max-width:180px;display:block;background:var(--surface);padding:4px;border-radius:6px' });
    const url = await store.coverDataUrl(settings.profile[key]);
    if (url) preview.src = url; else preview.hidden = true;
    const upload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        settings.profile[key] = await store.uploadCover(await toPng(file));
        changed();
        draw();
      } catch {
        toast(t('Nie udało się dodać grafiki.'));
      }
    };
    return field(label, h('div', { class: 'stack' }, preview,
      h('input', { type: 'file', accept: 'image/png,image/jpeg,image/svg+xml', onChange: upload }),
      settings.profile[key] ? h('div', {}, h('button', { class: 'btn small', onClick: () => { settings.profile[key] = null; changed(); draw(); } }, t('Usuń logo'))) : ''));
  }

  function profileCard(logos) {
    const p = settings.profile;
    const colour = (key, label) => field(label, h('input', { type: 'color', value: p[key], onInput: (e) => { p[key] = e.target.value; changed(); } }));
    return h('section', { class: 'card' },
      h('h2', {}, t('Profil firmy')),
      h('p', { class: 'small muted' }, t('Te dane pojawiają się w PDF, w wiadomościach i w podpisie.')),
      h('div', { class: 'grid2' },
        field(t('Nazwa firmy'), textInput(p, 'businessName', changed)),
        field(t('Imię i nazwisko'), textInput(p, 'ownerName', changed)),
        field(t('E-mail'), textInput(p, 'email', changed, { type: 'email' })),
        field(t('Strona www'), textInput(p, 'website', changed)),
        field(t('Waluta'), h('select', { onChange: (e) => { p.currency = e.target.value; setCurrency(p.currency); changed(); } },
          [['GBP', 'GBP'], ['EUR', 'EUR'], ['PLN', 'PLN']].map(([v, l]) => h('option', { value: v, selected: p.currency === v }, l)))),
        field(t('Rundy poprawek w cenie'), numberInput(p, 'includedRounds', changed, { min: '0', step: '1' })),
        colour('dark', t('Kolor ciemny w PDF')),
        colour('accent', t('Kolor akcentu w PDF')),
        logos,
      ),
    );
  }

  async function draw() {
    const logos = [await logoInput('logoLight', t('Logo na jasne tło')), await logoInput('logoDark', t('Logo na ciemne tło (opcjonalnie)'))];
    const secret = h('input', { readOnly: true, value: settings.linkSecret });
    page.replaceChildren(
      h('h1', {}, t('Ustawienia')),
      profileCard(logos),
      h('section', { class: 'card' },
        h('h2', {}, t('Cennik')),
        h('p', { class: 'small muted' }, t('Wpisz kwoty po obniżce. Opisy i punkty są opcjonalne, Claude je napisze przy ofercie.')),
        settings.priceList.map((service, i) => serviceEditor(service, changed, () => { settings.priceList.splice(i, 1); changed(); draw(); })),
        h('div', {}, h('button', {
          class: 'btn',
          onClick: () => {
            settings.priceList.push({ id: newId(), namePl: '', nameEn: '', descPl: '', descEn: '', bulletsPl: [], bulletsEn: [], price: null, priceFrom: false, unit: 'item', category: 'other', applyMultiplier: true, market: null });
            changed();
            draw();
            page.querySelectorAll('details')[settings.priceList.length - 1].open = true;
          },
        }, t('Dodaj usługę'))),
      ),
      h('section', { class: 'card' },
        h('h2', {}, t('Mnożniki i zasady')),
        h('div', { class: 'grid2' },
          settings.clientTypes.map((c) => field(uiLang() === 'en' ? c.labelEn : c.labelPl, numberInput(c, 'multiplier', changed))),
          field(t('Ekspres (0.25 to +25%)'), numberInput(settings, 'rushRate', changed)),
          field(t('Dodatkowa runda poprawek (£)'), numberInput(settings, 'extraRoundPrice', changed)),
          field(t('Rabat pakietowy (0.1 to 10%)'), numberInput(settings, 'bundleDiscount', changed)),
        ),
      ),
      h('section', { class: 'card' },
        h('h2', {}, t('Teksty oferty')),
        h('p', { class: 'small muted' }, t('W tekście poprawek {extraRound} zamienia się na kwotę z ustawień.')),
        termsEditor(settings, 'pl', changed), termsEditor(settings, 'en', changed),
        h('div', { class: 'grid2' },
          field(t('W cenie PL'), textArea(settings.infoCards.pl, 'included', changed)), field(t('W cenie EN'), textArea(settings.infoCards.en, 'included', changed)),
          field(t('Pliki PL'), textArea(settings.infoCards.pl, 'files', changed)), field(t('Pliki EN'), textArea(settings.infoCards.en, 'files', changed)),
          field(t('Instrukcja Hostingera PL, krok w linii'), textArea(settings, 'hostingerPl', changed)), field(t('Instrukcja Hostingera EN, krok w linii'), textArea(settings, 'hostingerEn', changed)),
        ),
      ),
      h('section', { class: 'card' },
        h('h2', {}, t('Link do oferty')),
        field(t('Adres strony z ofertami (puste wyłącza linki)'), textInput(settings, 'offerBaseUrl', changed, { placeholder: 'https://twojastrona.pl/oferta/' })),
        field(t('Klucz do podpisywania linków, wklej go do config.php na serwerze'), secret),
        h('div', {}, h('button', { class: 'btn', onClick: () => copyText(settings.linkSecret, secret, toast) }, t('Kopiuj klucz'))),
      ),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', onClick: () => autosave.flush() ?? save() }, t('Zapisz ustawienia')), status),
    );
  }
  draw();
}
