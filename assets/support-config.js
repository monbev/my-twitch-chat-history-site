// Public configuration only. Never place Telegram or Turnstile secret keys here.
export const SUPPORT_CONFIG = Object.freeze({
  endpoint: 'https://twitch-chat-history-support.monbev135.workers.dev/report',
  turnstileSiteKey: '0x4AAAAAAFFK8_F39Sf5a3nd', // Public key; the secret stays on Cloudflare.
});
