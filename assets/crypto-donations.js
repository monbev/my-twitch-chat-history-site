import { CRYPTO_DONATIONS } from './crypto-config.js';
import { t } from './site.js?v=20261005release';

/**
 * This page only displays public addresses and copies an address on an explicit click.
 * No wallet connection, exchange API, blockchain request or payment transaction.
 * @param {{root?: Document, translate?: typeof t, writeText?: (value: string) => Promise<void>}} [options]
 */
export function bindCryptoDonations(options = {}) {
  const { root = document, translate = t, writeText = value => navigator.clipboard.writeText(value) } = options;
  const moduleUrl = import.meta.url;
  const assetRoot = new URL('./', moduleUrl);
  /** @type {Array<() => void>} */
  const cleanup = [];
  const choice = /** @type {HTMLSelectElement | null} */ (root.querySelector('#crypto-choice'));
  if (choice) {
    choice.closest('label')?.removeAttribute('hidden');
    const select = () => {
      for (const config of CRYPTO_DONATIONS) {
        const card = /** @type {HTMLElement | null} */ (root.querySelector(`[data-crypto="${config.id}"]`));
        if (!card) continue;
        card.hidden = config.id !== choice.value;
        card.querySelector('details')?.removeAttribute('open');
        const status = card.querySelector('[data-crypto-status]');
        if (status) status.textContent = '';
      }
    };
    choice.addEventListener('change', select);
    select();
    cleanup.push(() => choice.removeEventListener('change', select));
  }
  for (const config of CRYPTO_DONATIONS) {
    const card = root.querySelector(`[data-crypto="${config.id}"]`);
    if (!card) continue;
    const address = /** @type {HTMLElement} */ (card.querySelector('[data-crypto-address]'));
    const qr = /** @type {HTMLImageElement} */ (card.querySelector('[data-crypto-qr]'));
    const button = /** @type {HTMLButtonElement} */ (card.querySelector('[data-crypto-copy]'));
    const status = /** @type {HTMLElement} */ (card.querySelector('[data-crypto-status]'));
    address.textContent = config.address;
    qr.src = new URL(config.qrFile, assetRoot).href;
    let busy = false;
    /** @type {'cryptoCopied' | 'cryptoCopyFailed' | null} */
    let statusKey = null;
    const refresh = () => {
      qr.alt = `${config.asset} · ${config.network}`;
      button.setAttribute('aria-label', `${translate('cryptoCopy')} — ${config.asset}, ${config.network}`);
      if (statusKey) status.textContent = translate(statusKey);
    };
    const resetStatus = () => { statusKey = null; status.textContent = ''; };
    const copy = async () => {
      if (busy) return;
      busy = true;
      button.disabled = true;
      try {
        await writeText(config.address);
        statusKey = 'cryptoCopied';
      } catch { statusKey = 'cryptoCopyFailed'; }
      finally { busy = false; button.disabled = false; if (card.hasAttribute('hidden')) resetStatus(); else refresh(); }
    };
    button.addEventListener('click', copy);
    choice?.addEventListener('change', resetStatus);
    root.addEventListener('site-language-change', refresh);
    refresh();
    cleanup.push(() => {
      button.removeEventListener('click', copy);
      choice?.removeEventListener('change', resetStatus);
      root.removeEventListener('site-language-change', refresh);
    });
  }
  return () => cleanup.forEach(remove => remove());
}

bindCryptoDonations();
