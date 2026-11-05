// Code written with help from Claude (Anthropic)
import { t, uiLang } from '../i18n.js';
import { h, field, textInput, textArea, copyText, debounce, claudeErrorText } from './dom.js';
import { renderSections, paintPrices } from './sections.js';
import { loadPdfAssets, loadPdfViewer } from './pdfAssets.js';
import { calcQuote, freezePrices } from '../pricing.js';
import { renderOfferPdf } from '../pdf/render.js';
import { buildCopyPrompt, parseCopy, buildMessagePrompt, insertLink } from '../claude.js';
import { fallbackMessage } from '../templates.js';
import { makeOfferPayload, encodeOffer, signPayload, buildOfferUrl } from '../offerLink.js';
import { formatMoney, offerFileName, stripDashes, toISODate } from '../text.js';

const today = () => toISODate(new Date());

function highlighted(text, fragments) {
  const parts = [text];
  for (const fragment of fragments ?? []) {
    for (let i = 0; i < parts.length; i += 1) {
      if (typeof parts[i] !== 'string' || !parts[i].includes(fragment)) continue;
      const at = parts[i].indexOf(fragment);
      parts.splice(i, 1, parts[i].slice(0, at), h('mark', {}, fragment), parts[i].slice(at + fragment.length));
      break;
    }
  }
  return parts;
}

async function downscale(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => { canvas.toBlob(resolve, 'image/jpeg', 0.85); });
}

export function renderDesk(root, ctx, quote) {
  const { settings, store, sample, downloads, toast, navigate } = ctx;
  let tab = 'message';
  let totals = calcQuote(quote, settings);
  let ready = false;
  let alive = true;
  const lastReport = {};

  const summary = h('div', { class: 'summary' });
  const sectionsRoot = h('div', { class: 'stack' });
  const copyNote = h('span', { class: 'small muted' });
  const side = h('div', { class: 'stack' });
  const tabBody = h('div', { class: 'stack' });

  const persist = debounce(() => store.saveQuote(quote).catch(() => toast(t('Nie udało się zapisać oferty.'))), 800);
  ctx.leave = () => {
    alive = false;
    return persist.flush();
  };
  const refreshPreview = debounce(() => { if (tab === 'pdf') drawTab(); }, 800);

  const offerDay = () => quote.sentAt?.slice(0, 10) ?? today();
  const blocked = () => totals.needsPrice || quote.sections.length === 0;

  function paintSummary() {
    summary.replaceChildren(
      h('span', {}, t('Wartość orientacyjna: '), h('b', {}, formatMoney(totals.estimate.oneOff))),
      totals.estimate.monthly ? h('span', {}, h('b', {}, `${formatMoney(totals.estimate.monthly)}/mies.`)) : '',
      totals.needsPrice ? h('span', { class: 'pill warn' }, t('Uzupełnij ceny „Do sprawdzenia”')) : '',
    );
  }

  function changed() {
    totals = calcQuote(quote, settings);
    paintPrices(sectionsRoot, totals, quote.lang);
    paintSummary();
    drawLockNote();
    side.querySelectorAll('.gated').forEach((b) => { b.disabled = blocked(); });
    if (!ready) return;
    if (quote.message) quote.messageStale = true;
    paintStale();
    refreshLink();
    persist();
    refreshPreview();
  }

  function paintStale() {
    side.querySelector('.stale')?.replaceChildren(quote.message && quote.messageStale ? t('Oferta się zmieniła. Napisz wiadomość ponownie.') : '');
  }

  function refreshLink() {
    const input = side.querySelector('.offer-link');
    if (!input) return;
    const button = side.querySelector('.copy-link');
    button.disabled = true;
    offerUrl().then((url) => {
      input.value = url;
      button.disabled = blocked();
    });
  }

  function redrawSections() {
    renderSections(sectionsRoot, quote, ctx, changed, redrawSections);
    changed();
  }

  async function offerUrl() {
    if (!settings.linkSecret || totals.needsPrice) return '';
    const encoded = await encodeOffer(makeOfferPayload(quote, totals, settings, offerDay()));
    return buildOfferUrl(settings.offerBaseUrl, encoded, await signPayload(encoded, settings.linkSecret));
  }

  async function buildPdf() {
    const { fonts, logos } = await loadPdfAssets();
    return renderOfferPdf({
      jsPDF: window.jspdf.jsPDF, fonts, logos, coverImage: await store.coverDataUrl(quote.coverAssetId),
      quote, totals, settings, offerUrl: await offerUrl(), today: offerDay(), report: lastReport,
    });
  }

  async function writeCopy(button) {
    if (!sample) return;
    if (button) button.disabled = true;
    copyNote.textContent = t('Claude pisze teksty oferty…');
    form.inert = true;
    try {
      const raw = await sample.json(buildCopyPrompt({ quote }), { cache: false });
      if (!alive) return;
      const updated = parseCopy(raw, quote);
      quote.needs = updated.needs;
      quote.sections = updated.sections;
      copyNote.textContent = '';
      drawForm();
      persist();
    } catch (e) {
      copyNote.textContent = claudeErrorText(e);
    }
    form.inert = false;
    if (button) button.disabled = false;
  }

  async function writeMessage(tone, area, button) {
    const url = await offerUrl();
    if (!sample) {
      quote.message = fallbackMessage({ quote, totals, settings, offerUrl: url });
    } else {
      button.disabled = true;
      area.value = t('Claude pisze wiadomość…');
      try {
        const { text, truncated } = await sample(buildMessagePrompt({ quote, totals, settings, offerUrl: url, tone }), {
          cache: false,
          onText: ({ text: partial }) => { area.value = partial; },
        });
        quote.message = insertLink(stripDashes(text), url);
        if (truncated) toast(t('Wiadomość została ucięta, napisz ją ponownie.'));
      } catch (e) {
        toast(claudeErrorText(e));
        quote.message = fallbackMessage({ quote, totals, settings, offerUrl: url });
      }
      button.disabled = false;
    }
    area.value = quote.message;
    quote.messageStale = false;
    paintStale();
    persist();
  }

  function messageTab() {
    const area = textArea(quote, 'message', persist, { class: 'message', 'aria-label': t('Wiadomość do klienta'), placeholder: t('Tu pojawi się wiadomość do klienta.') });
    const write = (tone) => (e) => writeMessage(tone, area, e.currentTarget);
    return [
      h('div', { class: 'row' },
        h('button', { class: 'btn primary gated', disabled: blocked(), onClick: write('default') }, quote.message ? t('Napisz ponownie') : t('Napisz wiadomość')),
        h('button', { class: 'btn gated', disabled: blocked(), onClick: write('shorter') }, t('Krócej')),
        h('button', { class: 'btn gated', disabled: blocked(), onClick: write('warmer') }, t('Cieplej')),
        h('button', { class: 'btn', onClick: () => copyText(area.value, area, toast) }, t('Kopiuj')),
      ),
      h('p', { class: 'small error stale' }, quote.message && quote.messageStale ? t('Oferta się zmieniła. Napisz wiadomość ponownie.') : ''),
      area,
    ];
  }

  function pdfTab() {
    const warning = h('p', { class: 'small error' });
    const pages = h('div', { class: 'pdf-pages' }, h('p', { class: 'small muted' }, t('Przygotowuję podgląd…')));
    const download = async () => {
      try {
        const doc = await buildPdf();
        const filename = offerFileName(quote.client.company || quote.client.name, new Date());
        if (downloads) await downloads.save({ filename, data: doc.output('arraybuffer') });
        else doc.save(filename);
      } catch (e) {
        if (e?.code !== 'cancelled') toast(t('Nie udało się zapisać PDF.'));
      }
    };
    (async () => {
      if (blocked()) {
        pages.replaceChildren(h('p', { class: 'small muted' }, t('Podgląd pojawi się, gdy oferta będzie mieć sekcje i ceny.')));
        return;
      }
      try {
        const [doc, pdfjs] = await Promise.all([buildPdf(), loadPdfViewer()]);
        if (lastReport.overflow.length) warning.textContent = t('Część tekstu nie zmieściła się w PDF. Skróć: {v}', { v: lastReport.overflow.join(', ') });
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(doc.output('arraybuffer')) }).promise;
        const canvases = [];
        for (let n = 1; n <= pdf.numPages; n += 1) {
          const page = await pdf.getPage(n);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = h('canvas', { width: viewport.width, height: viewport.height, 'aria-label': t('Strona {n}', { n }) });
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          canvases.push(canvas);
        }
        pages.replaceChildren(...canvases);
      } catch {
        pages.replaceChildren(h('p', { class: 'small muted' }, t('Podgląd jest niedostępny, ale PDF możesz pobrać.')));
      }
    })();
    return [h('div', { class: 'row' }, h('button', { class: 'btn primary gated', disabled: blocked(), onClick: download }, t('Pobierz PDF'))), warning, pages];
  }

  function linkTab() {
    if (!settings.linkSecret) return [h('p', {}, t('Brakuje klucza do linków. Uzupełnij go w Ustawieniach.'))];
    const input = h('input', { class: 'offer-link', readOnly: true, 'aria-label': t('Link do oferty') });
    offerUrl().then((url) => { input.value = url; });
    return [
      h('p', { class: 'small muted' }, t('Klient zobaczy skrót oferty i przycisk „Chcę rozmawiać”. Pełne opisy są w PDF.')),
      input,
      h('div', {}, h('button', { class: 'btn primary gated copy-link', disabled: blocked(), onClick: () => copyText(input.value, input, toast) }, t('Kopiuj link do oferty'))),
    ];
  }

  function drawTab() {
    const body = { message: messageTab, pdf: pdfTab, link: linkTab }[tab]();
    tabBody.replaceChildren(...body.flat());
  }

  function drawLockNote() {
    side.querySelector('.lock')?.replaceChildren(blocked() ? t('Najpierw dodaj sekcje i uzupełnij wszystkie ceny.') : '');
  }

  function drawSide() {
    const tabs = [['message', t('Wiadomość')], ['pdf', 'PDF'], ['link', t('Link')]];
    side.replaceChildren(
      h('div', { class: 'tabs', role: 'tablist' }, tabs.map(([id, label]) => h('button', { class: id === tab ? 'on' : '', role: 'tab', onClick: () => { tab = id; drawSide(); } }, t(label)))),
      h('p', { class: 'small muted lock' }),
      tabBody,
      h('div', { class: 'row' },
        h('button', {
          class: 'btn', disabled: quote.status !== 'draft',
          onClick: () => {
            quote.sections = freezePrices(quote, totals);
            quote.status = 'sent';
            quote.sentAt = new Date().toISOString();
            store.saveQuote(quote).catch(() => toast(t('Nie udało się zapisać oferty.')));
            toast(t('Oznaczono jako wysłaną'));
            const stale = quote.messageStale;
            drawForm();
            quote.messageStale = stale;
            drawSide();
          },
        }, quote.status === 'draft' ? t('Oznacz jako wysłaną') : t('Wysłana')),
        h('button', { class: 'btn link', onClick: () => navigate('quotes') }, t('Wszystkie oferty')),
      ),
    );
    drawLockNote();
    drawTab();
  }

  function clientCard() {
    const selectFor = (key, options) => h('select', { onChange: (e) => { quote[key] = e.target.value; changed(); } },
      options.map(([value, label]) => h('option', { value, selected: quote[key] === value }, t(label))));
    const typeChips = h('div', { class: 'chips' });
    const drawChips = () => typeChips.replaceChildren(...settings.clientTypes.map((c) => h('button', {
      class: `chip ${quote.clientTypeId === c.id ? 'on' : ''}`,
      onClick: () => { quote.clientTypeId = c.id; drawChips(); changed(); },
    }, `${uiLang() === 'en' ? c.labelEn : c.labelPl} ×${c.multiplier}`)));
    drawChips();
    return h('section', { class: 'card' },
      h('h2', {}, t('Klient')),
      h('div', { class: 'grid2' },
        field(t('Firma'), textInput(quote.client, 'company', changed)),
        field(t('Imię i nazwisko'), textInput(quote.client, 'name', changed)),
        field(t('Język oferty'), selectFor('lang', [['pl', t('Polski')], ['en', t('Angielski')]])),
        field(t('Forma zwrotu'), selectFor('address', [['ty', t('Ty')], ['wy', t('Wy')]])),
      ),
      typeChips,
      h('div', { class: 'row' },
        h('label', { class: 'c' }, h('input', { type: 'checkbox', checked: quote.rush, onChange: (e) => { quote.rush = e.target.checked; changed(); } }), t('Ekspres +{n}%', { n: Math.round(settings.rushRate * 100) })),
        quote.deadline ? h('span', { class: 'pill' }, t('Termin: {v}', { v: quote.deadline })) : '',
        quote.budget ? h('span', { class: 'pill' }, t('Budżet: {v}', { v: quote.budget })) : '',
      ),
    );
  }

  function sourceCard() {
    if (!quote.sourceMessage) return '';
    return h('section', { class: 'card' },
      h('h2', {}, t('Wiadomość od klienta')),
      h('p', { class: 'source' }, highlighted(quote.sourceMessage, quote.highlights)),
      quote.missing.length ? h('div', { class: 'stack' }, h('p', { class: 'small muted' }, t('Czego brakuje:')), h('ul', { style: 'margin:0;padding-left:18px' }, quote.missing.map((m) => h('li', {}, m)))) : '',
    );
  }

  function coverCard() {
    const redraw = () => drawForm();
    const needRows = quote.needs.map((need, i) => h('div', { class: 'row' },
      h('div', { style: 'width:120px' }, field(t('Etykieta'), textInput(need, 'label', changed))),
      h('div', { class: 'grow' }, field(t('Opis'), textInput(need, 'text', changed))),
      h('button', { class: 'btn small', onClick: () => { quote.needs.splice(i, 1); redraw(); changed(); } }, t('Usuń')),
    ));
    const upload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        quote.coverAssetId = await store.uploadCover(await downscale(file));
        redraw();
        changed();
      } catch {
        toast(t('Nie udało się dodać grafiki.'));
      }
    };
    return h('section', { class: 'card' },
      h('h2', {}, t('Okładka')),
      needRows,
      h('div', {}, h('button', { class: 'btn small', onClick: () => { quote.needs.push({ label: '', text: '' }); redraw(); } }, t('Dodaj wiersz „Czego potrzebujecie”'))),
      field(t('Grafika w ciemnym panelu, bez niej pokaże się Twoje logo'), h('input', { type: 'file', accept: 'image/*', onChange: upload })),
      quote.coverAssetId ? h('div', {}, h('button', { class: 'btn small', onClick: () => { quote.coverAssetId = null; redraw(); changed(); } }, t('Usuń grafikę'))) : '',
    );
  }

  const form = h('div', { class: 'stack' });
  function drawForm() {
    form.replaceChildren(
      sourceCard(),
      clientCard(),
      coverCard(),
      sectionsRoot,
      h('div', { class: 'row' },
        sample ? h('button', { class: 'btn', onClick: (e) => writeCopy(e.currentTarget) }, t('Napisz teksty')) : '',
        copyNote,
      ),
    );
    redrawSections();
  }

  root.append(h('div', { class: 'page' },
    h('div', { class: 'row' }, h('h1', { class: 'grow' }, quote.client.company || quote.client.name || t('Nowa oferta')), summary),
    h('div', { class: 'desk' }, form, h('aside', { class: 'card side' }, side)),
  ));
  drawForm();
  drawSide();
  ready = true;
  if (ctx.autoCopy) {
    ctx.autoCopy = false;
    writeCopy();
  }
}
