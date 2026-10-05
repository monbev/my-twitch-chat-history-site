// Public receiving addresses supplied by the owner and decoded from their QR codes.
// Never put private keys, seed phrases, exchange credentials or API keys here.
export const CRYPTO_DONATIONS = Object.freeze([
  Object.freeze({
    id: 'usdt-tron', asset: 'USDT', network: 'Tron (TRC20)',
    address: 'TWJikfQVaPZHHGLRdwwogQWfRZoz3LddCf', qrFile: 'usdt-tron-qr.svg',
  }),
  Object.freeze({
    id: 'usdc-base', asset: 'USDC', network: 'Base',
    address: '0x3737e613c4f751eda0e4704e6cf60a9bac326667', qrFile: 'usdc-base-qr.svg',
  }),
]);
