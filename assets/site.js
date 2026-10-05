import { SITE_CONFIG } from './site-config.js';
import { LANGUAGES, chooseLanguage, translate } from './translations.js?v=20261005release';

/** @type {string} */
let language = 'en';
const storageKey = 'chat-history-site-language';
let saved = null;
try { saved = localStorage.getItem(storageKey); } catch { /* Storage can be blocked. */ }
language = chooseLanguage(new URLSearchParams(location.search).get('lang'), saved, navigator.languages) ?? 'en';

/** @param {keyof typeof import('./translations.js').TEXT} key */
export function t(key) { return translate(language, key, { product: SITE_CONFIG.productName }); }
export function currentLanguage() { return language; }
const moduleUrl = import.meta.url;
const siteRoot = new URL('../', moduleUrl);
// site.js is in assets/, so the site root is its parent directory.
/** @param {string} page */
function pageUrl(page) {
  const url = new URL(page, siteRoot);
  url.searchParams.set('lang', language);
  return url.href;
}

function render() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-product]').forEach(element => { element.textContent = SITE_CONFIG.productName; });
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = /** @type {keyof typeof import('./translations.js').TEXT} */ (element.getAttribute('data-i18n'));
    element.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = /** @type {keyof typeof import('./translations.js').TEXT} */ (element.getAttribute('data-i18n-placeholder'));
    element.setAttribute('placeholder', t(key));
  });
  document.querySelectorAll('[data-page]').forEach(element => {
    element.setAttribute('href', pageUrl(element.getAttribute('data-page') ?? ''));
  });
  document.querySelectorAll('[data-destination]').forEach(element => {
    const key = /** @type {'storeUrl' | 'reviewUrl' | 'issueUrl' | 'donationUrl'} */ (element.getAttribute('data-destination'));
    element.setAttribute('href', SITE_CONFIG[key]);
  });
  const titleKey = document.body.dataset.title;
  document.title = titleKey ? `${t(/** @type {keyof typeof import('./translations.js').TEXT} */ (titleKey))} — ${SITE_CONFIG.productName}` : SITE_CONFIG.productName;
  const descriptionKey = document.body.dataset.description;
  if (descriptionKey) document.querySelector('meta[name="description"]')?.setAttribute('content', t(/** @type {keyof typeof import('./translations.js').TEXT} */ (descriptionKey)));
  const legalNotice = /** @type {HTMLElement | null} */ (document.querySelector('#legal-language-note'));
  if (legalNotice) { legalNotice.hidden = language === 'en'; legalNotice.lang = language; }
  document.querySelectorAll('[data-i18n="privacyTitle"]').forEach(element => { element.setAttribute('lang', language); });
  document.dispatchEvent(new CustomEvent('site-language-change'));
}

const select = /** @type {HTMLSelectElement | null} */ (document.querySelector('#site-language'));
if (select) {
  for (const [code, label] of LANGUAGES) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = label;
    option.lang = code;
    select.append(option);
  }
  select.value = language;
  select.addEventListener('change', () => {
    language = select.value;
    try { localStorage.setItem(storageKey, language); } catch { /* Optional preference. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url.href);
    render();
  });
}
render();
