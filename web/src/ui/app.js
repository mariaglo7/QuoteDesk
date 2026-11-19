// Code written with help from Claude (Anthropic)
import { t, uiLang, setUiLang } from '../i18n.js';
import { createStore } from '../store.js';
import { setCurrency } from '../text.js';
import { createAi, readStoredKey, storeKey } from '../ai.js';
import { hasProfile, displayName } from '../profile.js';
import { h } from './dom.js';
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
  setUiLang(settings.uiLang ?? (navigator.language?.toLowerCase().startsWith('pl') ? 'pl' : 'en'));
  const use = (name) => (window.claude?.use ? window.claude.use(name) : Promise.resolve(null));
  setCurrency(settings.profile.currency);
  const [sample, downloads] = await Promise.all([use('sample'), use('downloads')]);

  const nav = h('nav', { class: 'nav', 'aria-label': 'Menu' });
  const banners = h('div');
  const main = h('main');
  app.replaceChildren(
    h('header', { class: 'bar' }, h('div', { class: 'bar-in' }, h('strong', { class: 'brand' }, displayName(settings.profile)), nav)),
    banners,
    main,
    h('footer', { class: 'credit' }, 'QuoteDesk, made by ', h('a', { href: 'https://designbymaria.co.uk', target: '_blank', rel: 'noopener' }, 'Design by Maria')),
  );

  const ctx = {
    store, settings, downloads, toast, navigate, refreshBanners, leave: null, navToken: 0, inboxDraft: '',
    isArtifact: Boolean(sample),
    sample: createAi({ sample, apiKey: readStoredKey() }),
    setApiKey(key) {
      storeKey(key);
      ctx.sample = createAi({ sample, apiKey: key });
    },
  };
  window.addEventListener('pagehide', () => { ctx.leave?.(); });

  function refreshBanners() {
    const pricedServices = settings.priceList.filter((p) => p.price).length;
    document.querySelector('.brand').textContent = displayName(settings.profile);
    banners.replaceChildren(
      store.mode === 'local' ? h('div', { class: 'banner' }, t('Zapis tylko na tym urządzeniu.')) : '',
      !hasProfile(settings.profile) ? h('div', { class: 'banner' }, t('Uzupełnij profil firmy, żeby oferty miały Twoje dane. '), h('button', { class: 'btn link', onClick: () => navigate('settings') }, t('Otwórz Ustawienia'))) : '',
      pricedServices === 0 ? h('div', { class: 'banner' }, t('Cennik nie ma jeszcze cen. '), h('button', { class: 'btn link', onClick: () => navigate('settings') }, t('Uzupełnij cennik'))) : '',
    );
  }

  let current = { view: 'inbox', quote: null };

  function switchLanguage() {
    settings.uiLang = uiLang() === 'pl' ? 'en' : 'pl';
    setUiLang(settings.uiLang);
    store.saveSettings(settings).catch(() => {});
    navigate(current.view, current.quote);
  }

  async function navigate(view, quote = null) {
    await ctx.leave?.();
    ctx.leave = null;
    ctx.navToken += 1;
    current = { view, quote };
    nav.replaceChildren(
      ...VIEWS.map(([id, label]) => h('button', { class: id === view ? 'on' : '', onClick: () => navigate(id) }, t(label))),
      h('button', { class: 'lang', 'aria-label': 'Language', onClick: switchLanguage }, uiLang() === 'pl' ? 'EN' : 'PL'),
    );
    main.replaceChildren();
    refreshBanners();
    window.scrollTo(0, 0);
    if (view === 'inbox') renderInbox(main, ctx);
    if (view === 'desk') renderDesk(main, ctx, quote);
    if (view === 'quotes') renderQuotes(main, ctx);
    if (view === 'settings') renderSettings(main, ctx);
  }

  navigate(hasProfile(settings.profile) ? 'inbox' : 'settings');
}

boot().catch(() => {
  app.replaceChildren(h('p', { class: 'boot error' }, t('Nie udało się uruchomić aplikacji. Odśwież stronę.')));
});
