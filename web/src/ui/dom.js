// Code written with help from Claude (Anthropic)
import { t } from '../i18n.js';

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') el.className = value;
    else if (key in el) el[key] = value;
    else el.setAttribute(key, value);
  }
  el.append(...children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false));
  return el;
}

export function field(label, control) {
  return h('label', { class: 'f' }, label, control);
}

/** Text input bound to obj[key]. */
export function textInput(obj, key, onChange, props = {}) {
  return h('input', { value: obj[key] ?? '', onInput: (e) => { obj[key] = e.target.value; onChange(); }, ...props });
}

export function textArea(obj, key, onChange, props = {}) {
  return h('textarea', { value: obj[key] ?? '', onInput: (e) => { obj[key] = e.target.value; onChange(); }, ...props });
}

/** Number input bound to obj[key]; empty means null. */
export function numberInput(obj, key, onChange, props = {}) {
  return h('input', {
    type: 'number', step: 'any', min: '0', inputMode: 'decimal', value: obj[key] ?? '',
    onInput: (e) => {
      const v = e.target.value;
      obj[key] = v === '' || Number.isNaN(Number(v)) ? null : Number(v);
      onChange();
    },
    ...props,
  });
}

export function linesArea(obj, key, onChange, props = {}) {
  return h('textarea', {
    value: (obj[key] ?? []).join('\n'),
    onInput: (e) => { obj[key] = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean); onChange(); },
    ...props,
  });
}

export async function copyText(text, target, toast) {
  try {
    await navigator.clipboard.writeText(text);
    toast(t('Skopiowano'));
  } catch {
    target?.select?.();
    toast(t('Zaznaczono tekst, skopiuj go ręcznie'));
  }
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function claudeErrorText(e) {
  if (e?.code === 'rate_limited') return t('Spróbuj za chwilę.');
  if (e?.code === 'not_granted') return t('Claude niedostępny, uzupełnij ofertę ręcznie.');
  return t('Claude nie odpowiedział. Spróbuj ponownie albo uzupełnij ręcznie.');
}
