const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "string") {
    const cleaned = value.replace(",", ".");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeQuotedValue = (value, quoteUnit = "NORMAL") => {
  const num = normalizeNumber(value);

  if (quoteUnit === "GBX") {
    return num / 100;
  }

  return num;
};


const FX_RATES_TO_USD = {
  USD: 1,
  EUR: 1.1725,
  GBP: 1.3463,
  AUD: 0.715,
  CAD: 0.797,
  CHF: 1.219,
  CZK: 0.0469,
  DKK: 0.1571,
  HKD: 0.1395,
  HUF: 0.00293,
  JPY: 0.00727,
  MXN: 0.0586,
  NOK: 0.0997,
  NZD: 0.656,
  SEK: 0.1044,
  SGD: 0.809,
  AED: 0.296,
  BRL: 0.199,
  CNH: 0.150,
  ILS: 0.293,
  KRW: 0.000798,
  MYR: 0.234,
  PLN: 0.270,
  RON: 0.234,
  SAR: 0.291,
  TRY: 0.0317,
  TWD: 0.0340,
  ZAR: 0.0598,
};

const getFxRateToUSD = (currency = "USD") => {
  return FX_RATES_TO_USD[currency] || 1;
};

const convertCurrency = (value, fromCurrency = "USD", toCurrency = "USD") => {
  const amount = normalizeNumber(value);

  if (fromCurrency === toCurrency) return amount;

  const fromRateToUSD = getFxRateToUSD(fromCurrency);
  const toRateToUSD = getFxRateToUSD(toCurrency);

  const valueInUSD = amount * fromRateToUSD;
  return valueInUSD / toRateToUSD;
};

const getPositionPriceInBase = (position, baseCurrency) => {
  const normalizedPrice = normalizeQuotedValue(
    position.price,
    position.quoteUnit || "NORMAL"
  );

  return convertCurrency(
    normalizedPrice,
    position.quoteCurrency || baseCurrency,
    baseCurrency
  );
};

const getPositionAvgCostInBase = (position, baseCurrency) => {
  const normalizedAvgCost = normalizeQuotedValue(
    position.avgCost,
    position.quoteUnit || "NORMAL"
  );

  return convertCurrency(
    normalizedAvgCost,
    position.quoteCurrency || baseCurrency,
    baseCurrency
  );
};

const getPositionDividendPerShareInBase = (position, baseCurrency) => {
  const normalizedDividend = normalizeQuotedValue(
    position.annualDividend,
    position.quoteUnit || "NORMAL"
  );

  return convertCurrency(
    normalizedDividend,
    position.quoteCurrency || baseCurrency,
    baseCurrency
  );
};

const normalizePosition = (position, baseCurrency) => {
  const shares = normalizeNumber(position.shares);
  const quoteCurrency = position.quoteCurrency || baseCurrency;

  const currentPriceOriginal = normalizeQuotedValue(
    position.price,
    position.quoteUnit || "NORMAL"
  );

  const avgCostOriginal = normalizeQuotedValue(
    position.avgCost,
    position.quoteUnit || "NORMAL"
  );

  const annualDividendPerShareOriginal = normalizeQuotedValue(
    position.annualDividend,
    position.quoteUnit || "NORMAL"
  );

  const importedMarketValueOriginal = normalizeNumber(position.marketValueOriginal);
  const importedCostBasisOriginal = normalizeNumber(position.costBasisOriginal);
  const importedUnrealizedGainOriginal = normalizeNumber(position.unrealizedGainOriginal);

  const fallbackMarketValueOriginal = currentPriceOriginal * shares;
  const fallbackCostBasisOriginal = avgCostOriginal * shares;
  const fallbackUnrealizedGainOriginal =
    fallbackMarketValueOriginal - fallbackCostBasisOriginal;

  const marketValueOriginal =
    importedMarketValueOriginal !== 0
      ? importedMarketValueOriginal
      : fallbackMarketValueOriginal;

  const costBasisOriginal =
    importedCostBasisOriginal !== 0
      ? importedCostBasisOriginal
      : fallbackCostBasisOriginal;

  const unrealizedGainOriginal =
    importedUnrealizedGainOriginal !== 0 || position.unrealizedGainOriginal === 0
      ? importedUnrealizedGainOriginal
      : fallbackUnrealizedGainOriginal;

  const currentPriceInBase = convertCurrency(
    currentPriceOriginal,
    quoteCurrency,
    baseCurrency
  );

  const avgCostInBase = convertCurrency(
    avgCostOriginal,
    quoteCurrency,
    baseCurrency
  );

  const annualDividendPerShareInBase = convertCurrency(
    annualDividendPerShareOriginal,
    quoteCurrency,
    baseCurrency
  );

  const marketValue = convertCurrency(
    marketValueOriginal,
    quoteCurrency,
    baseCurrency
  );

  const costBasis = convertCurrency(
    costBasisOriginal,
    quoteCurrency,
    baseCurrency
  );

  const unrealizedGain = convertCurrency(
    unrealizedGainOriginal,
    quoteCurrency,
    baseCurrency
  );

  return {
    ...position,
    ticker: position.ticker || "N/A",
    sector: position.sector || "Sin sector",
    type: position.type || "Sin tipo",
    shares,
    currency: quoteCurrency,
    quoteCurrency,
    currentPriceOriginal,
    avgCostOriginal,
    annualDividendPerShareOriginal,
    marketValueOriginal,
    costBasisOriginal,
    unrealizedGainOriginal,
    currentPriceInBase,
    avgCostInBase,
    annualDividendPerShareInBase,
    marketValue,
    costBasis,
    unrealizedGain,
    realizedGain: normalizeNumber(position.realizedGain || 0),
  };
};

const buildDistribution = (items, labelKey) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!total) return [];

  return items
    .map((item) => ({
      [labelKey]: item[labelKey],
      value: item.value,
      percent: (item.value / total) * 100,
    }))
    .sort((a, b) => b.value - a.value);
};

export const calculatePortfolioTotals = (generalData = {}, positions = []) => {
  const baseCurrency = generalData.currency || "EUR";
  const cash = normalizeNumber(generalData.cash || 0);
  const benchmarkReturn = normalizeNumber(generalData.benchmarkReturn || 0);

  const normalizedPositions = positions.map((position) =>
    normalizePosition(position, baseCurrency)
  );

  const positionsValueTotal = normalizedPositions.reduce(
    (sum, position) => sum + position.marketValue,
    0
  );

  const annualDividendsTotal = normalizedPositions.reduce(
    (sum, position) =>
      sum + position.annualDividendPerShareInBase * position.shares,
    0
  );

  const unrealizedGainTotal = normalizedPositions.reduce(
    (sum, position) => sum + position.unrealizedGain,
    0
  );

  const realizedGainTotal = normalizedPositions.reduce(
    (sum, position) => sum + position.realizedGain,
    0
  );

  const totalGain = unrealizedGainTotal + realizedGainTotal;
  const portfolioValue = cash + positionsValueTotal;
  const costBasisTotal = normalizedPositions.reduce(
    (sum, position) => sum + position.costBasis,
    0
  );

  const cashWeight = portfolioValue > 0 ? (cash / portfolioValue) * 100 : 0;
  const investedWeight =
    portfolioValue > 0 ? (positionsValueTotal / portfolioValue) * 100 : 0;

  const yieldPercent =
    positionsValueTotal > 0
      ? (annualDividendsTotal / positionsValueTotal) * 100
      : 0;

  const portfolioReturnPercent =
    costBasisTotal > 0 ? (unrealizedGainTotal / costBasisTotal) * 100 : 0;

  const benchmarkDifference = portfolioReturnPercent - benchmarkReturn;

  return {
    baseCurrency,
    cash,
    portfolioValue,
    positionsValueTotal,
    annualDividendsTotal,
    unrealizedGainTotal,
    realizedGainTotal,
    totalGain,
    costBasisTotal,
    positionsCount: normalizedPositions.length,
    cashWeight,
    investedWeight,
    yieldPercent,
    portfolioReturnPercent,
    benchmarkReturn,
    benchmarkDifference,
  };
};

export const calculateSectorDistribution = (positions = [], baseCurrency = "EUR") => {
  const normalizedPositions = positions.map((position) =>
    normalizePosition(position, baseCurrency)
  );

  const sectorMap = new Map();

  normalizedPositions.forEach((position) => {
    const sector = position.sector || "Sin sector";
    const previous = sectorMap.get(sector) || 0;
    sectorMap.set(sector, previous + position.marketValue);
  });

  const raw = Array.from(sectorMap.entries()).map(([sector, value]) => ({
    sector,
    value,
  }));

  return buildDistribution(raw, "sector");
};

export const calculateInvestmentTypeDistribution = (
  positions = [],
  baseCurrency = "EUR"
) => {
  const normalizedPositions = positions.map((position) =>
    normalizePosition(position, baseCurrency)
  );

  const typeMap = new Map();

  normalizedPositions.forEach((position) => {
    const type = position.type || "Sin tipo";
    const previous = typeMap.get(type) || 0;
    typeMap.set(type, previous + position.marketValue);
  });

  const raw = Array.from(typeMap.entries()).map(([type, value]) => ({
    type,
    value,
  }));

  return buildDistribution(raw, "type");
};

export const calculateTopHoldings = (
  positions = [],
  limit = 10,
  baseCurrency = "EUR"
) => {
  const normalizedPositions = positions
    .map((position) => normalizePosition(position, baseCurrency))
    .filter((position) => position.marketValue > 0);

  const total = normalizedPositions.reduce(
    (sum, position) => sum + position.marketValue,
    0
  );

  if (!total) return [];

  return normalizedPositions
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, limit)
    .map((position) => ({
      id: position.id,
      ticker: position.ticker,
      value: position.marketValue,
      weightPercent: (position.marketValue / total) * 100,
    }));
};

export const calculateDashboardData = (generalData = {}, positions = []) => {
  const baseCurrency = generalData.currency || "EUR";

  return {
    totals: calculatePortfolioTotals(generalData, positions),
    sectors: calculateSectorDistribution(positions, baseCurrency),
    investmentTypes: calculateInvestmentTypeDistribution(
      positions,
      baseCurrency
    ),
    topHoldings: calculateTopHoldings(positions, 10, baseCurrency),
  };
};

export {
  normalizeNumber,
  normalizeQuotedValue,
  convertCurrency,
  getPositionPriceInBase,
  getPositionAvgCostInBase,
  getPositionDividendPerShareInBase,
  normalizePosition,
};