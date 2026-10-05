# Website — approved 1.2.0 revision

This directory contains the approved revision for the separate GitHub Pages repository
`my-twitch-chat-history-site`. The support form and privacy update were published
with owner approval at commit `e9a91054c1ce3f6112682c6244bf6d54f5080ffb`.
Live form: https://monbev.github.io/my-twitch-chat-history-site/support/ .
On 2026-10-05, a new approved synthetic submission returned Telegram-confirmed
delivery, and the owner confirmed receipt in the intended private chat.

Preview via the repository's local Vite preview server:
`http://127.0.0.1:5178/support-site/support/`.

The approved form layout and donation page are separate.
Publication evidence is recorded in `docs/prerelease-2026-10-05.md` in the extension
repository; source files alone do not confirm a successful Pages deployment.
`assets/site-config.js` centralizes public product branding, website,
store, issue, and the owner's monobank Jar destination; the extension imports it too.
No bank-card numbers or provider secrets are stored in frontend assets.

The homepage, form, donation page, navigation and statuses support en, uk, es,
pt-BR, de, fr, pl, tr, ja and ko (no Russian). The complete legal policy remains
English with an explicit localized notice. The site saves only a manual language
preference; incoming `lang` from the extension takes precedence.

On localhost the form is explicitly preview-only: **no reports, requests to the
backend, or Turnstile scripts**. On the published hostname it uses the configured
Turnstile widget and existing Worker. Empty configuration fails closed. Never
change the Worker's origin allowlist or Turnstile hostname just to test locally.

The donation link is live and opens monobank in a new tab, only when clicked.
There are no payment widgets, auto-redirects, analytics or automatic report attachments.
The donation page also offers USDT on Tron (TRC20) and USDC on Base. Public
receiving addresses are in `assets/crypto-config.js`; QR SVGs are hosted locally.
Crypto starts collapsed. Choose an asset/network to see its address; QR codes
open separately on request and close when switching destinations. Copy feedback
also resets when switching. Without JavaScript both labeled addresses remain available.
Both supplied screenshot QR codes were decoded and matched against the address
text. Copy buttons copy only the raw address: a QR scan does not select a network.
No Binance API, wallet connection, private key, balance query or transaction is used.
Before relying on cryptocurrency donations, the owner should check current Binance
deposit minimums, confirm both addresses are still active, and verify a small test
deposit has credited. No such transfer is performed by the agent.
Do not invent minimums from generic documentation or initiate a transfer for the owner.
The form preserves text on failure, guards duplicate submissions, and resets only
after confirmed success. Unit tests mock all backend requests.

For future website changes:

- keep bot, recipient and Turnstile secrets on the approved backend;
- test actual delivery with synthetic data and the intended recipient;
- set the privacy policy's real effective date, verify retention/contact wording;
- review both homepage and form at mobile and desktop sizes;
- verify deployed links and replace any donation placeholder only after approval.
- repeat an approved synthetic delivery test after publishing the redesigned form.

Do not copy `support-service` into the public static site. Its secrets belong only
in the backend platform's secret manager, never in JavaScript, Git or browser URLs.
