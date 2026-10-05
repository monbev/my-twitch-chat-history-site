/** @param {HTMLFormElement} form @param {string} token */
export function feedbackPayload(form, token) {
  const fields = ['message', 'contact', 'version', 'info', 'website'];
  /** @type {Record<string, string | boolean>} */
  const payload = {};
  for (const key of fields) {
    const field = /** @type {HTMLInputElement | HTMLTextAreaElement | null} */ (form.elements.namedItem(key));
    payload[key] = (field?.value ?? '').trim();
  }
  payload.consent = /** @type {HTMLInputElement | null} */ (form.elements.namedItem('consent'))?.checked === true;
  payload.token = token;
  return payload;
}

/**
 * @param {{form: HTMLFormElement, submit: HTMLButtonElement, status: HTMLElement,
 * translate: (key: string) => string, endpoint: string, preview?: boolean,
 * request?: typeof fetch, resetVerification?: () => void}} options
 */
export function createFeedbackController(options) {
  const { form, submit, status, translate, endpoint, preview = false,
    request = fetch, resetVerification = () => {} } = options;
  let token = '';
  let sending = false;
  let statusKey = preview ? 'preview' : 'verificationWaiting';
  // This status is owned by the controller, not the general page renderer.
  status.removeAttribute('data-i18n');
  /** @param {string} key */
  const show = key => { statusKey = key; status.textContent = translate(key); };
  const syncButton = () => { submit.disabled = sending || (!preview && !token); };
  show(statusKey);
  syncButton();

  /** @param {SubmitEvent | Event} event */
  async function send(event) {
    event.preventDefault();
    if (sending || (!preview && !token) || !form.reportValidity()) return;
    const payload = feedbackPayload(form, token);
    if (payload.consent !== true || String(payload.message).length < 20 || payload.website !== '') {
      show('sendFailed');
      return;
    }
    if (preview) { show('preview'); return; }
    if (!endpoint.startsWith('https://')) { show('unavailable'); return; }
    sending = true;
    syncButton();
    show('sending');
    try {
      const response = await request(endpoint, {
        method: 'POST', credentials: 'omit', redirect: 'error',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
        show(response.status === 429 ? 'tooMany' : [400, 413].includes(response.status) ? 'sendFailed' : 'uncertain');
        return;
      }
      const result = await response.json();
      if (result.ok !== true) throw new Error('Unexpected reply');
      form.reset();
      show('sent');
    } catch { show('uncertain'); }
    finally {
      token = '';
      sending = false;
      syncButton();
      resetVerification();
    }
  }
  form.addEventListener('submit', send);
  return {
    /** @param {string} value */
    verified(value) { token = value; syncButton(); },
    expired() { token = ''; syncButton(); if (!sending) show('verificationWaiting'); },
    failed() { token = ''; syncButton(); if (!sending) show('verificationFailed'); },
    unavailable() { token = ''; syncButton(); show('unavailable'); },
    refreshLanguage() { show(statusKey); },
    send,
    destroy() { form.removeEventListener('submit', send); },
  };
}
