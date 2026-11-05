// Code written with help from Claude (Anthropic)
import { t, uiLang } from '../i18n.js';
import { h, field, textInput, textArea, numberInput, linesArea, copyText } from './dom.js';
import { newId } from '../quote.js';

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
  const changed = () => { status.textContent = t('Masz niezapisane zmiany'); };

  async function save() {
    try {
      await store.saveSettings(settings);
      status.textContent = '';
      toast(t('Zapisano ustawienia'));
      ctx.refreshBanners();
    } catch {
      toast(t('Nie udało się zapisać. Spróbuj ponownie.'));
    }
  }

  function draw() {
    const secret = h('input', { readOnly: true, value: settings.linkSecret });
    page.replaceChildren(
      h('h1', {}, t('Ustawienia')),
      h('section', { class: 'card' },
        h('h2', {}, t('Cennik')),
        h('p', { class: 'small muted' }, t('Wpisz kwoty po obniżce. Opisy i punkty są opcjonalne, Claude je napisze przy ofercie.')),
        settings.priceList.map((service, i) => serviceEditor(service, changed, () => { settings.priceList.splice(i, 1); changed(); draw(); })),
        h('div', {}, h('button', {
          class: 'btn',
          onClick: () => {
            settings.priceList.push({ id: newId(), namePl: '', nameEn: '', descPl: '', descEn: '', bulletsPl: [], bulletsEn: [], price: 0, priceFrom: false, unit: 'item', category: 'other', applyMultiplier: true });
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
        field(t('Podpis'), textArea(settings, 'signature', changed)),
      ),
      h('section', { class: 'card' },
        h('h2', {}, t('Link do oferty')),
        field(t('Adres strony z ofertami'), textInput(settings, 'offerBaseUrl', changed)),
        field(t('Klucz do podpisywania linków, wklej go do config.php na serwerze'), secret),
        h('div', {}, h('button', { class: 'btn', onClick: () => copyText(settings.linkSecret, secret, toast) }, t('Kopiuj klucz'))),
      ),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', onClick: save }, t('Zapisz ustawienia')), status),
    );
  }
  draw();
}
