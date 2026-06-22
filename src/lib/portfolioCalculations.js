import { convertirADivisaBase } from './fxRates.js';

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

// convertCurrency is the internal helper — delegates to the central convertirADivisaBase.
// `rates` comes from getOrFetchFxRates(); if omitted, convertirADivisaBase uses the
// hardcoded fallback (still better than silent || 1 for unknown currencies).
const convertCurrency = (value, fromCurrency = "USD", toCurrency = "USD", rates) => {
  return convertirADivisaBase(normalizeNumber(value), fromCurrency, toCurrency, rates);
};

const getPositionPriceInBase = (position, baseCurrency, rates) => {
  const normalizedPrice = normalizeQuotedValue(
    position.price,
    position.quoteUnit || "NORMAL"
  );

  return convertCurrency(
    normalizedPrice,
    position.quoteCurrency || baseCurrency,
    baseCurrency,
    rates
  );
};

const getPositionAvgCostInBase = (position, baseCurrency, rates) => {
  const normalizedAvgCost = normalizeQuotedValue(
    position.avgCost,
    position.quoteUnit || "NORMAL"
  );

  return convertCurrency(
    normalizedAvgCost,
    position.quoteCurrency || baseCurrency,
    baseCurrency,
    rates
  );
};

const getPositionDividendPerShareInBase = (position, baseCurrency, rates) => {
  const normalizedDividend = normalizeQuotedValue(
    position.annualDividend,
    position.quoteUnit || "NORMAL"
  );

  return convertCurrency(
    normalizedDividend,
    position.quoteCurrency || baseCurrency,
    baseCurrency,
    rates
  );
};

const normalizePosition = (position, baseCurrency, rates) => {
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

  const fallbackMarketValueOriginal = currentPriceOriginal * shares;
  const fallbackCostBasisOriginal = avgCostOriginal * shares;

  const hasImportedMarketValue =
    position.marketValueOriginal !== undefined &&
    position.marketValueOriginal !== null &&
    position.marketValueOriginal !== "";

  const hasImportedCostBasis =
    position.costBasisOriginal !== undefined &&
    position.costBasisOriginal !== null &&
    position.costBasisOriginal !== "";

  const marketValueOriginal = hasImportedMarketValue
    ? importedMarketValueOriginal
    : fallbackMarketValueOriginal;

  const costBasisOriginal = hasImportedCostBasis
    ? importedCostBasisOriginal
    : fallbackCostBasisOriginal;

  const unrealizedGainOriginal = marketValueOriginal - costBasisOriginal;

  const currentPriceInBase = convertCurrency(
    currentPriceOriginal,
    quoteCurrency,
    baseCurrency,
    rates
  );

  const avgCostInBase = convertCurrency(
    avgCostOriginal,
    quoteCurrency,
    baseCurrency,
    rates
  );

  const annualDividendPerShareInBase = convertCurrency(
    annualDividendPerShareOriginal,
    quoteCurrency,
    baseCurrency,
    rates
  );

  const marketValue = convertCurrency(
    marketValueOriginal,
    quoteCurrency,
    baseCurrency,
    rates
  );

  const costBasis = convertCurrency(
    costBasisOriginal,
    quoteCurrency,
    baseCurrency,
    rates
  );

  const unrealizedGain = convertCurrency(
    unrealizedGainOriginal,
    quoteCurrency,
    baseCurrency,
    rates
  );

  // realizedGain is entered in the position's quoteCurrency — must be converted.
  // Previously this was only normalizeNumber() without currency conversion, causing
  // incorrect totals when positions have different currencies.
  const realizedGain = convertCurrency(
    normalizeNumber(position.realizedGain || 0),
    quoteCurrency,
    baseCurrency,
    rates
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
    realizedGain,
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

export const calculatePortfolioTotals = (generalData = {}, positions = [], rates) => {
  const baseCurrency = generalData.currency || "EUR";
  const cash = normalizeNumber(generalData.cash || 0);
  const benchmarkReturn = normalizeNumber(generalData.benchmarkReturn || 0);

  const normalizedPositions = positions.map((position) =>
    normalizePosition(position, baseCurrency, rates)
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

export const calculateSectorDistribution = (positions = [], baseCurrency = "EUR", rates) => {
  const normalizedPositions = positions.map((position) =>
    normalizePosition(position, baseCurrency, rates)
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
  baseCurrency = "EUR",
  rates
) => {
  const normalizedPositions = positions.map((position) =>
    normalizePosition(position, baseCurrency, rates)
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
  baseCurrency = "EUR",
  rates
) => {
  const normalizedPositions = positions
    .map((position) => normalizePosition(position, baseCurrency, rates))
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

export const calculateDashboardData = (generalData = {}, positions = [], rates) => {
  const baseCurrency = generalData.currency || "EUR";

  return {
    totals: calculatePortfolioTotals(generalData, positions, rates),
    sectors: calculateSectorDistribution(positions, baseCurrency, rates),
    investmentTypes: calculateInvestmentTypeDistribution(
      positions,
      baseCurrency,
      rates
    ),
    topHoldings: calculateTopHoldings(positions, 10, baseCurrency, rates),
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
