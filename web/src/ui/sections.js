// Code written with help from Claude (Anthropic)
import { t, uiLang } from '../i18n.js';
// Editors for the offer sections. onChange refreshes prices, redraw rebuilds the form.
import { h, field, textInput, textArea, numberInput, linesArea } from './dom.js';
import { newId, emptyItem, itemFromService } from '../quote.js';
import { formatMoney } from '../text.js';

const TYPE_LABELS = { options: 'Warianty', services: 'Usługi', bundles: 'Pakiety', info: 'Karty W cenie, Pliki, Czas' };

export function newSection(type) {
  const base = { id: newId(), type, eyebrow: '', title: '', intro: '', note: '' };
  if (type === 'options') return { ...base, recommendedId: null, items: [] };
  if (type === 'services') return { ...base, items: [] };
  if (type === 'bundles') return { ...base, style: 'rows', bundles: [] };
  return { id: newId(), type: 'info', included: '', files: '', time: '' };
}

function serviceName(service, lang) {
  return lang === 'en' ? service.nameEn || service.namePl : service.namePl || service.nameEn;
}

function itemPicker(section, quote, ctx, redraw) {
  const options = [h('option', { value: '' }, t('Dodaj z cennika…')), ...ctx.settings.priceList.map((s) => h('option', { value: s.id }, serviceName(s, quote.lang))), h('option', { value: '__custom' }, t('Pozycja własna'))];
  return h('select', {
    'aria-label': t('Dodaj pozycję'),
    onChange: (e) => {
      const service = ctx.settings.priceList.find((s) => s.id === e.target.value);
      if (!e.target.value) return;
      section.items.push(service ? itemFromService(service, quote.lang) : emptyItem());
      redraw();
    },
  }, options);
}

function itemEditor(section, item, quote, onChange, redraw) {
  const isOption = section.type === 'options';
  return h('div', { class: 'item', 'data-item': item.id },
    h('div', { class: 'row' },
      h('div', { class: 'grow' }, field(t('Nazwa'), textInput(item, 'name', onChange))),
      field(t('Ilość'), numberInput(item, 'qty', onChange, { min: '1', step: '1', style: 'width:70px' })),
      field(t('Cena ręczna (£)'), numberInput(item, 'unitPriceOverride', onChange, { style: 'width:110px' })),
    ),
    h('div', { class: 'row small' },
      h('span', { class: 'price' }),
      isOption ? h('label', { class: 'c' }, h('input', { type: 'radio', name: `rec_${section.id}`, checked: section.recommendedId === item.id, onChange: () => { section.recommendedId = item.id; onChange(); } }), t('Polecam')) : '',
      h('label', { class: 'c' }, h('input', { type: 'checkbox', checked: Boolean(item.priceFrom), onChange: (e) => { item.priceFrom = e.target.checked; onChange(); } }), t('Cena „od”')),
      h('button', { class: 'btn small', style: 'margin-left:auto', onClick: () => { section.items.splice(section.items.indexOf(item), 1); redraw(); } }, t('Usuń')),
    ),
    item.sourceQuote ? h('p', { class: 'small muted' }, t('Z wiadomości: „{v}”', { v: item.sourceQuote })) : '',
    isOption
      ? [field(t('Podtytuł'), textInput(item, 'subtitle', onChange)), field(t('Punkty, jeden w linii'), linesArea(item, 'bullets', onChange))]
      : [field(t('Opis'), textArea(item, 'description', onChange)), field(t('Mała notka pod ceną'), textInput(item, 'subNote', onChange))],
  );
}

function bundleEditor(section, bundle, quote, onChange, redraw) {
  const items = quote.sections.flatMap((s) => s.items ?? []);
  return h('div', { class: 'item', 'data-bundle': bundle.id },
    h('div', { class: 'row' },
      h('div', { class: 'grow' }, field(t('Nazwa pakietu'), textInput(bundle, 'name', onChange))),
      field(t('Cena ręczna (£)'), numberInput(bundle, 'priceOverride', onChange, { style: 'width:110px' })),
    ),
    h('div', { class: 'chips' }, items.map((item) => h('label', { class: 'c' },
      h('input', {
        type: 'checkbox', checked: bundle.itemIds.includes(item.id),
        onChange: (e) => {
          bundle.itemIds = e.target.checked ? [...bundle.itemIds, item.id] : bundle.itemIds.filter((id) => id !== item.id);
          onChange();
        },
      }), item.name || t('Bez nazwy')))),
    h('div', { class: 'row small' },
      h('span', { class: 'price' }),
      h('button', { class: 'btn small', style: 'margin-left:auto', onClick: () => { section.bundles.splice(section.bundles.indexOf(bundle), 1); redraw(); } }, t('Usuń')),
    ),
  );
}

function sectionEditor(section, index, quote, ctx, onChange, redraw) {
  const move = (delta) => {
    const [s] = quote.sections.splice(index, 1);
    quote.sections.splice(index + delta, 0, s);
    redraw();
  };
  const head = section.type === 'info' ? [] : [
    h('div', { class: 'grid2' }, field(t('Mały nadtytuł'), textInput(section, 'eyebrow', onChange)), field(t('Tytuł'), textInput(section, 'title', onChange))),
    field(t('Wstęp'), textArea(section, 'intro', onChange, { rows: 2 })),
  ];
  const body = [];
  if (section.items) {
    body.push(section.items.map((item) => itemEditor(section, item, quote, onChange, redraw)));
    if (section.type !== 'options' || section.items.length < 3) body.push(itemPicker(section, quote, ctx, redraw));
    if (section.type === 'options' && section.items.length < 2) body.push(h('p', { class: 'small muted' }, t('Dodaj 2 lub 3 warianty.')));
  }
  if (section.type === 'bundles') {
    body.push(
      field(t('Wygląd'), h('select', { onChange: (e) => { section.style = e.target.value; onChange(); } },
        h('option', { value: 'rows', selected: section.style === 'rows' }, t('Wiersze z przekreśloną ceną')),
        h('option', { value: 'banner', selected: section.style === 'banner' }, t('Ciemny baner')))),
      section.bundles.map((bundle) => bundleEditor(section, bundle, quote, onChange, redraw)),
      h('div', {}, h('button', { class: 'btn small', onClick: () => { section.bundles.push({ id: newId(), name: '', itemIds: [], priceOverride: null, caption: quote.lang === 'en' ? 'one off' : 'jednorazowo' }); redraw(); } }, t('Dodaj pakiet'))),
    );
  }
  if (section.type === 'info') {
    const d = ctx.settings.infoCards[quote.lang];
    body.push(
      field(t('W cenie'), textArea(section, 'included', onChange, { rows: 2, placeholder: d.included })),
      field(t('Pliki'), textArea(section, 'files', onChange, { rows: 2, placeholder: d.files })),
      field(t('Czas'), textArea(section, 'time', onChange, { rows: 2, placeholder: t('Termin realizacji do ustalenia.') })),
    );
  } else {
    body.push(field(t('Notka pod sekcją'), textArea(section, 'note', onChange, { rows: 2 })));
  }
  return h('section', { class: 'card' },
    h('div', { class: 'row' },
      h('h2', { class: 'grow' }, t(TYPE_LABELS[section.type])),
      h('button', { class: 'btn small', disabled: index === 0, 'aria-label': t('Przesuń wyżej'), onClick: () => move(-1) }, t('Wyżej')),
      h('button', { class: 'btn small', disabled: index === quote.sections.length - 1, 'aria-label': t('Przesuń niżej'), onClick: () => move(1) }, t('Niżej')),
      h('button', { class: 'btn small', onClick: () => { quote.sections.splice(index, 1); redraw(); } }, t('Usuń')),
    ),
    head, body,
  );
}

export function renderSections(root, quote, ctx, onChange, redraw) {
  root.replaceChildren(
    ...quote.sections.map((section, i) => sectionEditor(section, i, quote, ctx, onChange, redraw)),
    h('div', { class: 'row' }, h('span', { class: 'small muted' }, t('Dodaj sekcję:')),
      Object.entries(TYPE_LABELS).map(([type, label]) => h('button', { class: 'btn small', onClick: () => { quote.sections.push(newSection(type)); redraw(); } }, t(label)))),
  );
}

/** Refreshes the price text inside the editors without touching the inputs. */
export function paintPrices(root, totals, lang) {
  root.querySelectorAll('[data-item]').forEach((el) => {
    const p = totals.items[el.dataset.item];
    if (!p) return;
    el.classList.toggle('flag', p.needsPrice);
    const span = el.querySelector('.price');
    span.replaceChildren(p.needsPrice
      ? h('span', { class: 'pill warn' }, t('Do sprawdzenia'))
      : h('b', {}, `${p.priceFrom ? (lang === 'en' ? 'from ' : 'od ') : ''}${formatMoney(p.lineTotal)}${p.monthly ? (lang === 'en' ? '/month' : '/mies.') : ''}`));
  });
  root.querySelectorAll('[data-bundle]').forEach((el) => {
    const b = totals.bundles[el.dataset.bundle];
    if (b) el.querySelector('.price').replaceChildren(h('s', { class: 'muted' }, formatMoney(b.fullPrice)), ' ', h('b', {}, formatMoney(b.price)));
  });
}
