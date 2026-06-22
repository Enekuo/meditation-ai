const CACHE_KEY = 'portfolio_fx_rates';
const CACHE_DATE_KEY = 'portfolio_fx_rates_date';

// Emergency static fallback — only used if API fails AND no cached data exists.
// Do NOT rely on these values for production; they go stale quickly.
const FALLBACK_RATES_TO_USD = {
  USD: 1, EUR: 1.1725, GBP: 1.3463, AUD: 0.715, CAD: 0.797, CHF: 1.219,
  CZK: 0.0469, DKK: 0.1571, HKD: 0.1395, HUF: 0.00293, JPY: 0.00727,
  MXN: 0.0586, NOK: 0.0997, NZD: 0.656, SEK: 0.1044, SGD: 0.809,
  AED: 0.296, BRL: 0.199, CNH: 0.150, ILS: 0.293, KRW: 0.000798,
  MYR: 0.234, PLN: 0.270, RON: 0.234, SAR: 0.291, TRY: 0.0317,
  TWD: 0.0340, ZAR: 0.0598,
};

// API response format: { date: "...", usd: { eur: 0.92, gbp: 0.79, ... } }
// Each value = "how many units of that currency equal 1 USD"
// We need "how many USD equal 1 unit of that currency" → invert each value.
const parseApiRates = (apiUsdRates) => {
  const result = { USD: 1 };
  for (const [key, value] of Object.entries(apiUsdRates || {})) {
    if (key === 'usd' || !value || value <= 0) continue;
    result[key.toUpperCase()] = 1 / value;
  }
  return result;
};

/**
 * Returns FX rates as { CURRENCY: rateToUSD } for every ISO code the API covers
 * (~170 currencies, including all IBKR-supported ones).
 *
 * Strategy:
 *  1. Return today's localStorage cache if it exists.
 *  2. Fetch from fawazahmed0 currency API (free, no key, ~170 currencies).
 *  3. On failure, return stale cache if any, else hardcoded fallback.
 *
 * Call once per day from the component; pass the result to calculation functions.
 */
export async function getOrFetchFxRates() {
  const today = new Date().toISOString().slice(0, 10);

  try {
    if (localStorage.getItem(CACHE_DATE_KEY) === today) {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && typeof cached.USD === 'number') return cached;
    }
  } catch { /* ignore localStorage errors */ }

  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rates = parseApiRates(data.usd);
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(CACHE_DATE_KEY, today);
    return rates;
  } catch (err) {
    console.warn('[fxRates] API fetch failed, using stale/fallback rates:', err.message);
    try {
      const stale = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (stale && typeof stale.USD === 'number') return stale;
    } catch { /* ignore */ }
    return { ...FALLBACK_RATES_TO_USD };
  }
}

/**
 * Central conversion function.
 *
 * @param {number} amount
 * @param {string} fromCurrency  ISO 4217 code (e.g. "GBP")
 * @param {string} toCurrency    ISO 4217 code (e.g. "EUR")
 * @param {object} rates         Result of getOrFetchFxRates() — { USD:1, EUR:1.17, ... }
 * @returns {number}
 */
export const convertirADivisaBase = (amount, fromCurrency, toCurrency, rates) => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return 0;

  const from = (fromCurrency || 'USD').toUpperCase();
  const to = (toCurrency || 'USD').toUpperCase();
  if (from === to) return num;

  const ratesMap = (rates && typeof rates.USD === 'number') ? rates : FALLBACK_RATES_TO_USD;

  const fromRate = ratesMap[from] !== undefined ? ratesMap[from]
    : (FALLBACK_RATES_TO_USD[from] !== undefined ? FALLBACK_RATES_TO_USD[from]
      : (console.warn(`[fxRates] Unknown currency "${from}" — treating as 1:1 USD`), 1));

  const toRate = ratesMap[to] !== undefined ? ratesMap[to]
    : (FALLBACK_RATES_TO_USD[to] !== undefined ? FALLBACK_RATES_TO_USD[to]
      : (console.warn(`[fxRates] Unknown currency "${to}" — treating as 1:1 USD`), 1));

  return (num * fromRate) / toRate;
};
