// Code written with help from Claude (Anthropic)
import { createStore } from '../store.js';
import { h } from './dom.js';
import { loadPdfAssets } from './pdfAssets.js';
import { renderInbox } from './inbox.js';
import { renderDesk } from './desk.js';
import { renderQuotes } from './quotes.js';
import { renderSettings } from './settings.js';

const app = document.getElementById('app');
const VIEWS = [['inbox', 'Nowa wycena'], ['quotes', 'Oferty'], ['settings', 'Ustawienia']];

function toast(text) {
  const el = h('div', { class: 'toast', role: 'status' }, text);
  document.body.append(el);
  setTimeout(() => el.remove(), 2200);
}

async function boot() {
  const store = await createStore();
  const settings = await store.getSettings();
  const use = (name) => (window.claude?.use ? window.claude.use(name) : Promise.resolve(null));
  const [sample, downloads, { logos }] = await Promise.all([use('sample'), use('downloads'), loadPdfAssets()]);

  const nav = h('nav', { class: 'nav', 'aria-label': 'Główne' });
  const banners = h('div');
  const main = h('main');
  app.replaceChildren(
    h('header', { class: 'bar' }, h('div', { class: 'bar-in' }, h('img', { src: `data:image/png;base64,${logos.white}`, alt: 'Design by Maria' }), nav)),
    banners,
    main,
  );

  const ctx = { store, settings, sample, downloads, toast, navigate, refreshBanners };

  function refreshBanners() {
    const paidServices = settings.priceList.filter((p) => !['post', 'care'].includes(p.id)).length;
    banners.replaceChildren(
      store.mode === 'local' ? h('div', { class: 'banner' }, 'Zapis tylko na tym urządzeniu.') : '',
      paidServices === 0 ? h('div', { class: 'banner' }, 'Cennik ma tylko post i opiekę nad stroną. ', h('button', { class: 'btn link', onClick: () => navigate('settings') }, 'Uzupełnij cennik')) : '',
    );
  }

  function navigate(view, quote = null) {
    nav.replaceChildren(...VIEWS.map(([id, label]) => h('button', { class: id === view ? 'on' : '', onClick: () => navigate(id) }, label)));
    main.replaceChildren();
    refreshBanners();
    window.scrollTo(0, 0);
    if (view === 'inbox') renderInbox(main, ctx);
    if (view === 'desk') renderDesk(main, ctx, quote);
    if (view === 'quotes') renderQuotes(main, ctx);
    if (view === 'settings') renderSettings(main, ctx);
  }

  navigate('inbox');
}

boot().catch(() => {
  app.replaceChildren(h('p', { class: 'boot error' }, 'Nie udało się uruchomić aplikacji. Odśwież stronę.'));
});
