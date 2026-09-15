// FX conversion: convert USD prices into local Paystack currency at checkout.

const cache = new Map(); // currency -> { rate, expiresAt }

// Conservative fallbacks (updated regularly) used if the rate API is unreachable.
const FALLBACK_RATES = {
  NGN: 1550, // Naira per USD
  GHS: 14.5,
  KES: 130,
  ZAR: 18.2,
};

const cacheTtlMs = 12 * 60 * 60 * 1000; // 12h

async function fetchRate(currency) {
  const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
  if (!res.ok) throw new Error(`FX API error ${res.status}`);
  const json = await res.json();
  if (json.result !== 'success' || !json.rates?.[currency]) {
    throw new Error(`No rate for ${currency}`);
  }
  return Number(json.rates[currency]);
}

/**
 * Get the number of `currency` units per 1 USD.
 * Cached in-memory for 12h, with a static fallback if the API fails.
 */
export async function getUsdRate(currency) {
  const cached = cache.get(currency);
  if (cached && cached.expiresAt > Date.now()) return cached.rate;
  if (cached) cache.delete(currency);

  try {
    const rate = await fetchRate(currency);
    cache.set(currency, { rate, expiresAt: Date.now() + cacheTtlMs });
    return rate;
  } catch (e) {
    console.warn(`FX rate fetch failed for ${currency}, using fallback:`, e.message);
    const fallback = FALLBACK_RATES[currency];
    if (!fallback) throw e; // unknown currency — let the caller surface the error
    return fallback;
  }
}

/** Convert an amount (USD) into the local-currency subunit (kobo/pesewas/cents). */
export async function usdToSubunit(amountUsd, currency) {
  if (currency === 'USD') {
    return Math.round(amountUsd * 100);
  }
  const rate = await getUsdRate(currency);
  return Math.round(amountUsd * rate * 100);
}