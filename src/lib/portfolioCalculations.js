export function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function roundToTwo(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

export function calculatePositionValue(position) {
  return roundToTwo(toNumber(position.price) * toNumber(position.shares));
}

export function calculatePositionInvested(position) {
  return roundToTwo(toNumber(position.avgCost) * toNumber(position.shares));
}

export function calculatePositionUnrealizedGain(position) {
  return roundToTwo(
    calculatePositionValue(position) - calculatePositionInvested(position)
  );
}

export function calculatePositionRealizedGain(position) {
  return roundToTwo(toNumber(position.realizedGain));
}

export function calculatePositionTotalGain(position) {
  return roundToTwo(
    calculatePositionUnrealizedGain(position) + calculatePositionRealizedGain(position)
  );
}

export function calculatePositionAnnualDividend(position) {
  return roundToTwo(toNumber(position.annualDividend) * toNumber(position.shares));
}

export function calculatePositionReturnPercent(position) {
  const invested = calculatePositionInvested(position);
  if (invested <= 0) return 0;
  return roundToTwo((calculatePositionUnrealizedGain(position) / invested) * 100);
}

export function calculateEnrichedPositions(positions = []) {
  return positions.map((position) => {
    const value = calculatePositionValue(position);
    const invested = calculatePositionInvested(position);
    const unrealizedGain = calculatePositionUnrealizedGain(position);
    const realizedGain = calculatePositionRealizedGain(position);
    const totalGain = calculatePositionTotalGain(position);
    const annualDividendTotal = calculatePositionAnnualDividend(position);
    const returnPercent = calculatePositionReturnPercent(position);

    return {
      ...position,
      value,
      invested,
      unrealizedGain,
      realizedGain,
      totalGain,
      annualDividendTotal,
      returnPercent,
    };
  });
}

export function calculatePortfolioTotals(generalData = {}, positions = []) {
  const cash = toNumber(generalData.cash);
  const benchmarkReturn = toNumber(generalData.benchmarkReturn);
  const taxDividends = toNumber(generalData.taxDividends);
  const taxGains = toNumber(generalData.taxGains);

  const enrichedPositions = calculateEnrichedPositions(positions);

  const investedTotal = roundToTwo(
    enrichedPositions.reduce((sum, position) => sum + position.invested, 0)
  );

  const positionsValueTotal = roundToTwo(
    enrichedPositions.reduce((sum, position) => sum + position.value, 0)
  );

  const portfolioValue = roundToTwo(cash + positionsValueTotal);

  const unrealizedGainTotal = roundToTwo(
    enrichedPositions.reduce((sum, position) => sum + position.unrealizedGain, 0)
  );

  const realizedGainTotal = roundToTwo(
    enrichedPositions.reduce((sum, position) => sum + position.realizedGain, 0)
  );

  const totalGain = roundToTwo(unrealizedGainTotal + realizedGainTotal);

  const annualDividendsTotal = roundToTwo(
    enrichedPositions.reduce((sum, position) => sum + position.annualDividendTotal, 0)
  );

  const cashWeight = portfolioValue > 0 ? roundToTwo((cash / portfolioValue) * 100) : 0;
  const investedWeight =
    portfolioValue > 0 ? roundToTwo((positionsValueTotal / portfolioValue) * 100) : 0;

  const yieldPercent =
    portfolioValue > 0 ? roundToTwo((annualDividendsTotal / portfolioValue) * 100) : 0;

  const portfolioReturnPercent =
    investedTotal > 0 ? roundToTwo((unrealizedGainTotal / investedTotal) * 100) : 0;

  const benchmarkDifference = roundToTwo(portfolioReturnPercent - benchmarkReturn);

  const taxesOnDividends = roundToTwo((annualDividendsTotal * taxDividends) / 100);

  const taxableGainsBase = totalGain > 0 ? totalGain : 0;
  const taxesOnGains = roundToTwo((taxableGainsBase * taxGains) / 100);

  const positionsCount = enrichedPositions.length;

  const weightedPositions = enrichedPositions.map((position) => ({
    ...position,
    weightPercent:
      portfolioValue > 0 ? roundToTwo((position.value / portfolioValue) * 100) : 0,
  }));

  return {
    cash: roundToTwo(cash),
    benchmarkReturn,
    taxDividends,
    taxGains,
    investedTotal,
    positionsValueTotal,
    portfolioValue,
    unrealizedGainTotal,
    realizedGainTotal,
    totalGain,
    annualDividendsTotal,
    cashWeight,
    investedWeight,
    yieldPercent,
    portfolioReturnPercent,
    benchmarkDifference,
    taxesOnDividends,
    taxesOnGains,
    positionsCount,
    positions: weightedPositions,
  };
}

export function calculateSectorDistribution(positions = []) {
  const enrichedPositions = calculateEnrichedPositions(positions);
  const totalValue = enrichedPositions.reduce((sum, position) => sum + position.value, 0);

  const grouped = enrichedPositions.reduce((acc, position) => {
    const key = position.sector || "Sin sector";
    acc[key] = (acc[key] || 0) + position.value;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([sector, value]) => ({
      sector,
      value: roundToTwo(value),
      percent: totalValue > 0 ? roundToTwo((value / totalValue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateInvestmentTypeDistribution(positions = []) {
  const enrichedPositions = calculateEnrichedPositions(positions);
  const totalValue = enrichedPositions.reduce((sum, position) => sum + position.value, 0);

  const grouped = enrichedPositions.reduce((acc, position) => {
    const key = position.type || "Sin tipo";
    acc[key] = (acc[key] || 0) + position.value;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([type, value]) => ({
      type,
      value: roundToTwo(value),
      percent: totalValue > 0 ? roundToTwo((value / totalValue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateTopHoldings(positions = [], limit = 10) {
  const enrichedPositions = calculateEnrichedPositions(positions);
  const totalValue = enrichedPositions.reduce((sum, position) => sum + position.value, 0);

  return enrichedPositions
    .map((position) => ({
      ...position,
      weightPercent:
        totalValue > 0 ? roundToTwo((position.value / totalValue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}