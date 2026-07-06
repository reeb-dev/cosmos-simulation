import es from './locales/es.js';
import en from './locales/en.js';

const STORAGE_KEY = 'cosmos_locale';
const SUPPORTED = ['es', 'en'];
const LOCALES = { es, en };

let locale = 'es';
let messages = es;

const listeners = new Set();

export function detectLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch { /* ignore */ }
  if (typeof navigator !== 'undefined') {
    const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
    return nav === 'en' ? 'en' : 'es';
  }
  return 'es';
}

async function loadMessages(loc) {
  messages = LOCALES[loc] ?? LOCALES.es;
  locale = loc;
}

export async function initI18n(preferred) {
  const loc = preferred && SUPPORTED.includes(preferred) ? preferred : detectLocale();
  await loadMessages(loc);
  if (typeof document !== 'undefined') document.documentElement.lang = loc;
  return loc;
}

export function getLocale() {
  return locale;
}

export function getMessages() {
  return messages;
}

/** Nested key lookup: "a.b.c" */
export function getBundle(key) {
  const parts = key.split('.');
  let val = messages;
  for (const p of parts) {
    val = val?.[p];
    if (val === undefined) return undefined;
  }
  return val;
}

export function t(key, params = {}) {
  const val = getBundle(key);
  if (typeof val !== 'string') return key;
  return val.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export async function setLocale(loc) {
  if (!SUPPORTED.includes(loc) || loc === locale) return locale;
  await loadMessages(loc);
  try {
    localStorage.setItem(STORAGE_KEY, loc);
  } catch { /* ignore */ }
  if (typeof document !== 'undefined') document.documentElement.lang = loc;
  listeners.forEach((fn) => fn(loc));
  return locale;
}

export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function toggleLocale() {
  return setLocale(locale === 'es' ? 'en' : 'es');
}
