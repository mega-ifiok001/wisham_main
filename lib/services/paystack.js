import { config } from '../config.js';

const API = 'https://api.paystack.co';

function headers() {
  return {
    Authorization: `Bearer ${config.paystackSecretKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Initialize a Paystack transaction.
 * @param {{ amountSubunit: number, email: string, reference: string, currency: string, metadata: object }} p
 */
export async function initializeTransaction({ amountSubunit, email, reference, currency, metadata }) {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email,
      amount: amountSubunit,
      currency,
      reference,
      metadata,
      callback_url: `${config.appUrl}/checkout`,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack error ${res.status}`);
  }
  return json.data; // { authorization_url, access_code, reference }
}

/** Verify a transaction reference server-side with the secret key. */
export async function verifyTransaction(reference) {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: headers(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack verify error ${res.status}`);
  }
  return json.data; // { status, amount, currency, paid_at, metadata, ... }
}

/**
 * Verify a Paystack webhook signature (HMAC-SHA512 of the raw body).
 * @param {string} signature value of the "x-paystack-signature" header
 * @param {string} rawBody raw request body text
 */
export async function verifyWebhookSignature(signature, rawBody) {
  const crypto = await import('node:crypto');
  const expected = crypto
    .createHmac('sha512', config.paystackSecretKey)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}