import { SUPPORT_CONFIG } from './support-config.js';
import { t, currentLanguage } from './site.js?v=20261005release';
import { createFeedbackController } from './support-form-core.js?v=20261005release';

const form = /** @type {HTMLFormElement} */ (document.querySelector('#support-form'));
const submit = /** @type {HTMLButtonElement} */ (document.querySelector('#send-report'));
const status = /** @type {HTMLElement} */ (document.querySelector('#report-status'));
const preview = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
const configured = SUPPORT_CONFIG.endpoint.startsWith('https://') && Boolean(SUPPORT_CONFIG.turnstileSiteKey);
/** @type {string | undefined} */
let widget;
const version = new URLSearchParams(location.search).get('version');
if (version && /^[a-zA-Z0-9. -]{1,32}$/.test(version)) {
  /** @type {HTMLInputElement} */ (form.elements.namedItem('version')).value = version;
}
const controller = createFeedbackController({
  form, submit, status, endpoint: SUPPORT_CONFIG.endpoint, preview,
  translate: key => t(/** @type {keyof typeof import('./translations.js').TEXT} */ (key)),
  resetVerification: () => { if (widget !== undefined) window.turnstile.reset(widget); },
});
document.addEventListener('site-language-change', () => controller.refreshLanguage());

// Never load third-party verification or send test reports from localhost.
if (!preview && configured) {
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.onload = () => {
    try {
      widget = window.turnstile.render('#verification', {
        sitekey: SUPPORT_CONFIG.turnstileSiteKey, action: 'support',
        language: currentLanguage(), theme: 'dark', size: 'flexible',
        callback: token => controller.verified(token),
        'expired-callback': () => controller.expired(),
        'error-callback': () => controller.failed(),
        'timeout-callback': () => controller.failed(),
        'unsupported-callback': () => controller.failed(),
      });
    } catch { controller.failed(); }
  };
  script.onerror = () => controller.failed();
  document.head.append(script);
} else if (!preview) {
  controller.unavailable();
}
