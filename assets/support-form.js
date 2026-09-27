import { SUPPORT_CONFIG } from './support-config.js';

const form = /** @type {HTMLFormElement} */ (document.querySelector('#support-form'));
const submit = /** @type {HTMLButtonElement} */ (document.querySelector('#send-report'));
const status = /** @type {HTMLParagraphElement} */ (document.querySelector('#report-status'));
let verificationToken = '';
/** @type {string | undefined} */
let widget;
const version = new URLSearchParams(location.search).get('version');
if (version && /^[a-zA-Z0-9. -]{1,32}$/.test(version)) /** @type {HTMLInputElement} */ (form.elements.namedItem('version')).value = version;
/** @param {string} text */
const setStatus = text => { status.textContent = text; };
const configured = SUPPORT_CONFIG.endpoint.startsWith('https://') && Boolean(SUPPORT_CONFIG.turnstileSiteKey);

if (configured) {
  setStatus('Complete verification before sending. No chat history is attached automatically.');
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.onload = () => {
    widget = window.turnstile.render('#verification', {
      sitekey: SUPPORT_CONFIG.turnstileSiteKey, action: 'support',
      callback: token => { verificationToken = token; submit.disabled = false; },
      'expired-callback': () => { verificationToken = ''; submit.disabled = true; },
      'error-callback': () => { verificationToken = ''; submit.disabled = true; setStatus('Verification failed. Please reload or use the GitHub issue link.'); },
    });
  };
  script.onerror = () => setStatus('Could not load verification. Please try again or use GitHub.');
  document.head.append(script);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!configured || !verificationToken || !form.reportValidity()) return;
  submit.disabled = true;
  setStatus('Sending…');
  const values = new FormData(form);
  /** @type {Record<string, string | boolean>} */
  const payload = Object.fromEntries(['message', 'contact', 'version', 'info', 'website'].map(key => [key, String(values.get(key) ?? '').trim()]));
  payload.consent = values.get('consent') === 'on';
  payload.token = verificationToken;
  try {
    const response = await fetch(SUPPORT_CONFIG.endpoint, {
      method: 'POST', credentials: 'omit', redirect: 'error',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      setStatus(response.status === 429 ? 'Too many reports. Please try again later.' : 'Could not send the report. Check the fields and try again.');
      return;
    }
    const result = await response.json();
    if (result.ok !== true) throw new Error('Unexpected reply');
    form.reset();
    setStatus('Report sent to the developer. Thank you!');
  } catch {
    setStatus('Delivery could not be confirmed. Your text is preserved. Please wait before retrying to avoid duplicate reports.');
  } finally {
    verificationToken = '';
    if (widget !== undefined) window.turnstile.reset(widget);
  }
});
