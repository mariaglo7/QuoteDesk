// Code written with help from Claude (Anthropic)
import { parseOfferUrl, decodeOffer, formatOfferMoney } from './offer.js';

const TEXT = {
  pl: {
    title: 'Oferta dla', forPerson: 'Dla:', valid: 'Oferta ważna do', from: 'od', month: '/ mies.', recommended: 'Polecam',
    invalid: 'Ten link jest nieprawidłowy', invalidHelp: 'Odpisz na wiadomość z ofertą, a wyślę link jeszcze raz.',
    expired: 'Oferta wygasła', expiredHelp: 'Odpisz na wiadomość z ofertą, a przygotuję aktualną.',
    ask: 'Pełny opis znajdziesz w PDF. Masz pytania albo chcesz ruszać?', button: 'Chcę rozmawiać',
    thanks: 'Dziękuję! Odezwę się najszybciej, jak to możliwe.', error: 'Nie udało się wysłać. Odpisz proszę na wiadomość z ofertą.',
  },
  en: {
    title: 'Offer for', forPerson: 'For:', valid: 'Offer valid until', from: 'from', month: '/ month', recommended: 'Recommended',
    invalid: 'This link is invalid', invalidHelp: 'Reply to the message with the offer and I will send the link again.',
    expired: 'This offer has expired', expiredHelp: 'Reply to the message with the offer and I will prepare an up to date one.',
    ask: 'You will find the full details in the PDF. Any questions, or ready to start?', button: "Let's talk",
    thanks: 'Thank you! I will get back to you as soon as I can.', error: 'That did not work. Please reply to the message with the offer.',
  },
};

const root = document.getElementById('offer');
let currency = 'GBP';
const money = (n) => formatOfferMoney(n, currency);

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function message(title, help) {
  root.replaceChildren(el('h1', title), el('p', help, 'muted'));
}

async function post(action, link) {
  const res = await fetch('contact.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, p: link.encoded, s: link.sig }),
  });
  return res.json();
}

function itemRow(item, t) {
  const row = el('div', undefined, 'row');
  const name = el('span', item.n);
  if (item.r) name.append(el('span', t.recommended, 'tag'));
  const price = el('b');
  if (item.o) price.append(el('s', money(item.o)));
  price.append(`${item.f ? `${t.from} ` : ''}${money(item.p)}${item.m ? ` ${t.month}` : ''}`);
  row.append(name, price);
  return row;
}

function render(offer, link, t) {
  const title = el('h1', `${t.title} ${offer.company || offer.name}`);
  title.append(el('span', '.', 'dot'));
  const head = el('header');
  head.append(title);
  if (offer.name) head.append(el('p', `${t.forPerson} ${offer.name}`, 'muted'));
  head.append(el('p', `${t.valid} ${offer.exp.split('-').reverse().join('.')}`, 'muted'));

  const sections = offer.sections.map((section) => {
    const block = el('section');
    if (section.t) block.append(el('h2', section.t));
    block.append(...section.i.map((item) => itemRow(item, t)));
    return block;
  });

  const button = el('button', t.button);
  const box = el('div', undefined, 'box');
  box.append(el('p', t.ask), button);
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const reply = await post('contact', link);
      box.replaceChildren(el('p', reply.ok ? t.thanks : t.error));
    } catch {
      box.replaceChildren(el('p', t.error));
    }
  });

  root.replaceChildren(head, ...sections, box);
}

async function start() {
  const link = parseOfferUrl(location.hash);
  if (!link) {
    message(TEXT.pl.invalid, TEXT.pl.invalidHelp);
    return;
  }
  let offer;
  try {
    offer = await decodeOffer(link.encoded);
  } catch {
    message(TEXT.pl.invalid, TEXT.pl.invalidHelp);
    return;
  }
  const t = TEXT[offer.lang] ?? TEXT.pl;
  currency = offer.brand?.currency || 'GBP';
  if (/^#[0-9a-f]{6}$/i.test(offer.brand?.accent ?? '')) document.documentElement.style.setProperty('--pink', offer.brand.accent);
  const brand = offer.brand?.name ? ` | ${offer.brand.name}` : '';
  document.documentElement.lang = offer.lang;
  document.title = `${t.title} ${offer.company || offer.name}${brand}`;
  let check;
  try {
    check = await post('verify', link);
  } catch {
    check = { ok: false, error: 'invalid' };
  }
  if (check.ok) render(offer, link, t);
  else if (check.error === 'expired') message(t.expired, t.expiredHelp);
  else message(t.invalid, t.invalidHelp);
}

start();
