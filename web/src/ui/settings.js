// Code written with help from Claude (Anthropic)
import { h, field, textInput, textArea, numberInput, linesArea, copyText } from './dom.js';
import { newId } from '../quote.js';

const UNITS = [['item', 'sztuka'], ['page', 'podstrona'], ['month', 'miesiąc']];
const CATEGORIES = [['branding', 'Branding'], ['print', 'Druk'], ['website', 'Strona'], ['social', 'Social media'], ['care', 'Opieka'], ['other', 'Inne']];

function select(obj, key, options, onChange) {
  return h('select', { onChange: (e) => { obj[key] = e.target.value; onChange(); } },
    options.map(([value, label]) => h('option', { value, selected: obj[key] === value }, label)));
}

function checkbox(obj, key, label, onChange) {
  return h('label', { class: 'c' }, h('input', { type: 'checkbox', checked: Boolean(obj[key]), onChange: (e) => { obj[key] = e.target.checked; onChange(); } }), label);
}

function serviceEditor(service, onChange, remove) {
  return h('details', {},
    h('summary', {}, `${service.namePl || 'Nowa usługa'}, £${service.price ?? 0}`),
    h('div', { class: 'inner' },
      h('div', { class: 'grid2' },
        field('Nazwa PL', textInput(service, 'namePl', onChange)),
        field('Nazwa EN', textInput(service, 'nameEn', onChange)),
        field('Cena bazowa (£)', numberInput(service, 'price', onChange)),
        field('Jednostka', select(service, 'unit', UNITS, onChange)),
        field('Kategoria', select(service, 'category', CATEGORIES, onChange)),
      ),
      h('div', { class: 'row' }, checkbox(service, 'applyMultiplier', 'Podlega mnożnikowi i ekspresowi', onChange), checkbox(service, 'priceFrom', 'Cena „od”', onChange)),
      h('div', { class: 'grid2' },
        field('Opis PL', textArea(service, 'descPl', onChange)),
        field('Opis EN', textArea(service, 'descEn', onChange)),
        field('Punkty PL, jeden w linii', linesArea(service, 'bulletsPl', onChange)),
        field('Punkty EN, jeden w linii', linesArea(service, 'bulletsEn', onChange)),
      ),
      h('div', { class: 'row end' }, h('button', { class: 'btn small', onClick: remove }, 'Usuń usługę')),
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
  const changed = () => { status.textContent = 'Masz niezapisane zmiany'; };

  async function save() {
    try {
      await store.saveSettings(settings);
      status.textContent = '';
      toast('Zapisano ustawienia');
      ctx.refreshBanners();
    } catch {
      toast('Nie udało się zapisać. Spróbuj ponownie.');
    }
  }

  function draw() {
    const secret = h('input', { readOnly: true, value: settings.linkSecret });
    page.replaceChildren(
      h('h1', {}, 'Ustawienia'),
      h('section', { class: 'card' },
        h('h2', {}, 'Cennik'),
        h('p', { class: 'small muted' }, 'Wpisz kwoty po obniżce. Opisy i punkty są opcjonalne, Claude je napisze przy ofercie.'),
        settings.priceList.map((service, i) => serviceEditor(service, changed, () => { settings.priceList.splice(i, 1); changed(); draw(); })),
        h('div', {}, h('button', {
          class: 'btn',
          onClick: () => {
            settings.priceList.push({ id: newId(), namePl: '', nameEn: '', descPl: '', descEn: '', bulletsPl: [], bulletsEn: [], price: 0, priceFrom: false, unit: 'item', category: 'other', applyMultiplier: true });
            changed();
            draw();
            page.querySelectorAll('details')[settings.priceList.length - 1].open = true;
          },
        }, 'Dodaj usługę')),
      ),
      h('section', { class: 'card' },
        h('h2', {}, 'Mnożniki i zasady'),
        h('div', { class: 'grid2' },
          settings.clientTypes.map((c) => field(c.labelPl, numberInput(c, 'multiplier', changed))),
          field('Ekspres (0.25 to +25%)', numberInput(settings, 'rushRate', changed)),
          field('Dodatkowa runda poprawek (£)', numberInput(settings, 'extraRoundPrice', changed)),
          field('Rabat pakietowy (0.1 to 10%)', numberInput(settings, 'bundleDiscount', changed)),
        ),
      ),
      h('section', { class: 'card' },
        h('h2', {}, 'Teksty oferty'),
        h('p', { class: 'small muted' }, 'W tekście poprawek {extraRound} zamienia się na kwotę z ustawień.'),
        termsEditor(settings, 'pl', changed), termsEditor(settings, 'en', changed),
        h('div', { class: 'grid2' },
          field('W cenie PL', textArea(settings.infoCards.pl, 'included', changed)), field('W cenie EN', textArea(settings.infoCards.en, 'included', changed)),
          field('Pliki PL', textArea(settings.infoCards.pl, 'files', changed)), field('Pliki EN', textArea(settings.infoCards.en, 'files', changed)),
          field('Instrukcja Hostingera PL, krok w linii', textArea(settings, 'hostingerPl', changed)), field('Instrukcja Hostingera EN, krok w linii', textArea(settings, 'hostingerEn', changed)),
        ),
        field('Podpis', textArea(settings, 'signature', changed)),
      ),
      h('section', { class: 'card' },
        h('h2', {}, 'Link do oferty'),
        field('Adres strony z ofertami', textInput(settings, 'offerBaseUrl', changed)),
        field('Klucz do podpisywania linków, wklej go do config.php na serwerze', secret),
        h('div', {}, h('button', { class: 'btn', onClick: () => copyText(settings.linkSecret, secret, toast) }, 'Kopiuj klucz')),
      ),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', onClick: save }, 'Zapisz ustawienia'), status),
    );
  }
  draw();
}
