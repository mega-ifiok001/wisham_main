// FX conversion: turn USD prices into the merchant's Paystack currency at checkout.

const cache = new Map(); // currency -> { rate, expiresAt }

// Conservative fallbacks used if the rate API is unreachable.
const FALLBACK_RATES = {
  NGN: 1550,
  GHS: 14.5,
  KES: 130,
  ZAR: 18.2,
};

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h

async function fetchRate(currency) {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error(`FX API error ${res.status}`);
  const json = await res.json();
  if (json.result !== 'success' || !json.rates?.[currency]) {
    throw new Error(`No rate for ${currency}`);
  }
  return Number(json.rates[currency]);
}

/** Number of `currency` units per 1 USD (cached 12h, with a static fallback). */
export async function getUsdRate(currency) {
  const cached = cache.get(currency);
  if (cached && cached.expiresAt > Date.now()) return cached.rate;
  if (cached) cache.delete(currency);

  try {
    const rate = await fetchRate(currency);
    cache.set(currency, { rate, expiresAt: Date.now() + CACHE_TTL_MS });
    return rate;
  } catch (e) {
    console.warn(`FX rate fetch failed for ${currency}, using fallback:`, e.message);
    const fallback = FALLBACK_RATES[currency];
    if (!fallback) throw e;
    return fallback;
  }
}

/** Convert a USD amount into the local-currency subunit (kobo / pesewas / cents). */
export async function usdToSubunit(amountUsd, currency) {
  if (currency === 'USD') return Math.round(amountUsd * 100);
  const rate = await getUsdRate(currency);
  return Math.round(amountUsd * rate * 100);
}