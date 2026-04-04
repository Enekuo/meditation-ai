import React, { useEffect, useMemo, useState } from "react";
import {
  calculatePortfolioTotals,
  calculateSectorDistribution,
  calculateInvestmentTypeDistribution,
  calculateTopHoldings,
  normalizePosition,
} from "@/lib/portfolioCalculations";

const GENERAL_STORAGE_KEY = "portfolio_general_data";
const POSITIONS_STORAGE_KEY = "portfolio_positions";

const HOLDING_COLORS = [
  "#26457f",
  "#4e84ff",
  "#7aa56d",
  "#7ab9ff",
  "#b1965e",
  "#8c63d8",
  "#b98bf2",
  "#79a96a",
  "#295da8",
  "#ad6230",
  "#f3872d",
  "#a8bfd9",
  "#85b864",
  "#488bb8",
  "#f1ce4b",
  "#6ab5ff",
  "#d9bfd9",
];

const TYPE_COLORS = {
  Especulativa: "#4d7cff",
  "Largo Plazo": "#72bf69",
  Dividendos: "#23447d",
  "Sin tipo": "#cbd5e1",
};

const SECTOR_COLORS = [
  "#4d7cff",
  "#72bf69",
  "#23447d",
  "#8c63d8",
  "#f3872d",
  "#7ab9ff",
  "#b1965e",
  "#85b864",
  "#488bb8",
  "#f1ce4b",
];

const emptyGeneralData = {
  cash: 0,
  benchmark: "S&P500",
  benchmarkReturn: 0,
  currency: "USD",
  taxDividends: 0,
  taxGains: 0,
};

const formatMoney = (value, currency = "USD") => {
  const num = Number(value || 0);
  return `${currency} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercent = (value) => {
  const num = Number(value || 0);
  return `${num.toFixed(2)}%`;
};

const formatCompactPercent = (value) => {
  const num = Number(value || 0);
  return `${Math.round(num)}%`;
};

const getAmountColor = (value) => {
  const num = Number(value || 0);
  if (num > 0) return "#4aa56d";
  if (num < 0) return "#d94b62";
  return "#94a3b8";
};

const buildConicGradient = (items, colorGetter) => {
  if (!items.length) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let start = 0;
  const stops = items.map((item, index) => {
    const percent = Number(item.percent || 0);
    const degrees = (percent / 100) * 360;
    const end = start + degrees;
    const color = colorGetter(item, index);
    const segment = `${color} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });

  if (start < 360) {
    stops.push(`#e2e8f0 ${start}deg 360deg`);
  }

  return `conic-gradient(${stops.join(",")})`;
};

const buildHoldingsGradient = (items) => {
  if (!items.length) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let start = 0;
  const stops = items.map((item, index) => {
    const percent = Number(item.weightPercent || 0);
    const degrees = (percent / 100) * 360;
    const end = start + degrees;
    const color = HOLDING_COLORS[index % HOLDING_COLORS.length];
    const segment = `${color} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });

  if (start < 360) {
    stops.push(`#e2e8f0 ${start}deg 360deg`);
  }

  return `conic-gradient(${stops.join(",")})`;
};

const getPositionMarketValue = (position) => {
  const directValue =
    position?.marketValue ??
    position?.currentValue ??
    position?.positionValue ??
    position?.totalValue ??
    position?.value;

  if (Number.isFinite(Number(directValue))) {
    return Number(directValue);
  }

  const shares = Number(
    position?.shares ?? position?.quantity ?? position?.amount ?? 0
  );
  const currentPrice = Number(
    position?.currentPrice ?? position?.price ?? position?.marketPrice ?? 0
  );

  return shares * currentPrice;
};

const DashboardPage = () => {
  const [generalData, setGeneralData] = useState(emptyGeneralData);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedGeneral = JSON.parse(
          localStorage.getItem(GENERAL_STORAGE_KEY) || "{}"
        );
        const savedPositions = JSON.parse(
          localStorage.getItem(POSITIONS_STORAGE_KEY) || "[]"
        );

        setGeneralData({ ...emptyGeneralData, ...savedGeneral });
        setPositions(Array.isArray(savedPositions) ? savedPositions : []);
      } catch {
        setGeneralData(emptyGeneralData);
        setPositions([]);
      }
    };

    loadData();

    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  const totals = useMemo(
    () => calculatePortfolioTotals(generalData, positions),
    [generalData, positions]
  );

  const sectors = useMemo(
    () => calculateSectorDistribution(positions, generalData.currency),
    [positions, generalData.currency]
  );

  const investmentTypes = useMemo(
    () => calculateInvestmentTypeDistribution(positions, generalData.currency),
    [positions, generalData.currency]
  );

  const topHoldings = useMemo(
    () => calculateTopHoldings(positions, 10, generalData.currency),
    [positions, generalData.currency]
  );

  const concentrationRows = useMemo(() => {
    const normalized = positions.map((position) =>
      normalizePosition(position, generalData.currency)
    );

    const investedTotal = Number(totals.positionsValueTotal || 0);

    return normalized
      .map((position) => {
        const marketValue = getPositionMarketValue(position);
        const weightPercent =
          investedTotal > 0 ? (marketValue / investedTotal) * 100 : 0;

        return {
          ...position,
          weightPercent,
        };
      })
      .sort(
        (a, b) => Number(b.weightPercent || 0) - Number(a.weightPercent || 0)
      );
  }, [positions, generalData.currency, totals.positionsValueTotal]);

  const topGainers = useMemo(() => {
    return positions
      .map((position) => normalizePosition(position, generalData.currency))
      .sort(
        (a, b) => Number(b.unrealizedGain || 0) - Number(a.unrealizedGain || 0)
      );
  }, [positions, generalData.currency]);

  const hasPositions = positions.length > 0;

  const holdingsGradient = useMemo(
    () => buildHoldingsGradient(topHoldings),
    [topHoldings]
  );

  const typeGradient = buildConicGradient(
    investmentTypes,
    (item) => TYPE_COLORS[item.type] || "#cbd5e1"
  );

  const sectorGradient = buildConicGradient(
    sectors,
    (_, index) => SECTOR_COLORS[index % SECTOR_COLORS.length]
  );

  const benchmarkLabel = generalData.benchmark || "Benchmark";

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <div className="max-w-[1480px] mx-auto px-6 py-5">
        <div className="mb-4">
          <div className="w-11 h-1 rounded-full bg-blue-500 mb-2" />
          <h1 className="text-[18px] md:text-[19px] font-bold tracking-tight text-[#2f3a56] uppercase">
            Información General Del Portafolio
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.98fr_1.62fr_0.78fr] gap-4">
          {/* LEFT COLUMN */}
          <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <p className="text-[13px] font-semibold text-[#3b455e] mb-2">
                Valor Actual
              </p>
              <h2 className="text-[28px] leading-none font-bold text-[#202b45]">
                {formatMoney(totals.portfolioValue, generalData.currency)}
              </h2>
            </div>

            <div className="border-t border-[#edf1f7] px-4 py-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#66c38b] flex items-center justify-center text-white text-sm font-bold">
                  $
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#3b455e]">
                    Efectivo
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#2c3651]">
                  {formatMoney(totals.cash, generalData.currency)}
                </p>
                <p className="text-[11px] font-semibold text-[#94a3b8]">
                  {formatMoney(totals.cash, generalData.currency)} (
                  {formatPercent(totals.cashWeight)})
                </p>
              </div>
            </div>

            <div className="border-t border-[#edf1f7] px-4 py-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4678df] flex items-center justify-center text-white text-xs font-bold">
                  ▣
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#3b455e] leading-[1.15]">
                    Cantidad
                    <br />
                    Invertida
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#2c3651]">
                  {formatMoney(totals.positionsValueTotal, generalData.currency)}
                </p>
                <p className="text-[11px] font-semibold text-[#94a3b8] leading-[1.2]">
                  {formatMoney(totals.positionsValueTotal, generalData.currency)}
                  <br />
                  ({formatPercent(totals.investedWeight)})
                </p>
              </div>
            </div>

            <div className="border-t border-[#edf1f7] px-4 py-4">
              <div className="flex items-center gap-4">
                <div className="relative w-[128px] h-[128px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: buildConicGradient(
                        [
                          { percent: totals.cashWeight },
                          { percent: totals.investedWeight },
                        ],
                        (_, index) => (index === 0 ? "#7ecb9b" : "#4d7cff")
                      ),
                    }}
                  />
                  <div className="absolute inset-[22px] rounded-full bg-white flex items-center justify-center border border-[#edf1f7]">
                    <span className="text-[34px] leading-none text-[#94a3b8]">
                      $
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#7ecb9b]" />
                      <span className="text-[13px] text-[#3a4560] font-medium">
                        Efectivo
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#2f3a56]">
                      {formatCompactPercent(totals.cashWeight)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#4d7cff]" />
                      <span className="text-[13px] text-[#3a4560] font-medium leading-[1.1]">
                        Cantidad
                        <br />
                        Invertida
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#2f3a56]">
                      {formatCompactPercent(totals.investedWeight)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-[#e7edf7] bg-[#eef4ff] px-4 py-2 text-center">
                <p className="text-[12px] font-bold uppercase tracking-wide text-[#35405c]">
                  Cantidad De Acciones
                </p>
                <p className="text-[30px] leading-none mt-1 font-bold text-[#3471e6]">
                  {totals.positionsCount}
                </p>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-3 flex flex-col">
            <h3 className="text-center text-[16px] font-bold text-[#2f3a56] pt-1">
              ACCIONES
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center py-3">
              {hasPositions ? (
                <div className="relative w-[250px] h-[250px] rounded-full shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{ background: holdingsGradient }}
                  />
                  <div className="absolute inset-[67px] rounded-full bg-white border border-[#edf1f7]" />

                  {topHoldings.map((item, index) => {
                    const angle =
                      topHoldings
                        .slice(0, index)
                        .reduce(
                          (sum, holding) => sum + Number(holding.weightPercent || 0),
                          0
                        ) +
                      Number(item.weightPercent || 0) / 2;

                    const radians = ((angle / 100) * 360 - 90) * (Math.PI / 180);
                    const radius = 158;
                    const x = 125 + Math.cos(radians) * radius;
                    const y = 125 + Math.sin(radians) * radius;

                    return (
                      <div
                        key={item.id || item.ticker}
                        className="absolute text-[11px] font-semibold whitespace-nowrap"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: "translate(-50%, -50%)",
                          color: HOLDING_COLORS[index % HOLDING_COLORS.length],
                        }}
                      >
                        {item.ticker} {formatCompactPercent(item.weightPercent)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative w-[250px] h-[250px] rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center">
                  <div className="absolute inset-[67px] rounded-full bg-white border border-[#e2e8f0]" />
                  <span className="absolute text-[14px] font-semibold text-[#94a3b8]">
                    Sin datos
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-3 py-3 text-center h-[98px] flex flex-col justify-center">
                <p className="text-[12px] leading-tight font-bold text-[#313b56]">
                  Dividendos
                  <br />
                  Anuales
                  <br />
                  Estimados
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#24304a]">
                  {formatMoney(totals.annualDividendsTotal, generalData.currency)}
                </p>
              </div>

              <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-3 py-3 text-center h-[98px] flex flex-col justify-center">
                <p className="text-[12px] leading-tight font-bold text-[#313b56]">
                  Yield Del
                  <br />
                  Portafolio
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#94a3b8]">
                  {formatPercent(totals.yieldPercent)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3">
                Retorno Promedio Anual
              </h3>

              <div className="space-y-2">
                <div className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-[13px] text-[#3a4560] font-medium">
                    Mi Retorno
                  </span>
                  <span className="text-[13px] font-bold text-[#24304a]">
                    {formatPercent(totals.portfolioReturnPercent)}
                  </span>
                </div>

                <div className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-[13px] text-[#3a4560] font-medium">
                    {benchmarkLabel}
                  </span>
                  <span className="text-[13px] font-bold text-[#24304a]">
                    {formatPercent(totals.benchmarkReturn)}
                  </span>
                </div>

                <div className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-[13px] text-[#3a4560] font-medium">
                    Diferencia
                  </span>
                  <span className="text-[13px] font-bold text-[#24304a]">
                    {formatPercent(totals.benchmarkDifference)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3">
                Tipo De Inversión
              </h3>

              <div className="flex items-center gap-4">
                <div className="relative w-[112px] h-[112px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{ background: typeGradient }}
                  />
                  <div className="absolute inset-[24px] rounded-full bg-white border border-[#edf1f7]" />
                </div>

                <div className="space-y-3">
                  {(investmentTypes.length
                    ? investmentTypes
                    : [
                        { type: "Especulativa", percent: 0 },
                        { type: "Largo Plazo", percent: 0 },
                        { type: "Dividendos", percent: 0 },
                      ]
                  ).map((item) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between gap-3 min-w-[160px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-sm"
                          style={{
                            backgroundColor: TYPE_COLORS[item.type] || "#cbd5e1",
                          }}
                        />
                        <span className="text-[13px] text-[#3a4560] font-medium">
                          {item.type}
                        </span>
                      </div>

                      <span className="text-[13px] font-semibold text-[#2f3a56]">
                        {formatCompactPercent(item.percent)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* END RIGHT COLUMN */}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.72fr_1.28fr] gap-4 mt-4">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3">
                Ganancia/Pérdida
              </h3>

              <div className="overflow-hidden rounded-xl border border-[#edf1f7]">
                <div className="grid grid-cols-[1fr_auto] bg-[#f4f8fb]">
                  <div className="px-3 py-2 text-[13px] text-[#3a4560] font-medium">
                    Ganancia/Pérdida (sin realizar)
                  </div>
                  <div
                    className="px-3 py-2 text-[13px] font-bold"
                    style={{ color: getAmountColor(totals.unrealizedGainTotal) }}
                  >
                    {formatMoney(totals.unrealizedGainTotal, generalData.currency)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4 h-[282px] flex flex-col">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3 shrink-0">
                Sectores
              </h3>

              <div className="flex-1 min-h-0 flex items-center justify-center gap-6">
                <div className="relative w-[118px] h-[118px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{ background: sectorGradient }}
                  />
                  <div className="absolute inset-[25px] rounded-full bg-white border border-[#edf1f7] flex items-center justify-center">
                    <span className="text-[12px] font-semibold text-[#94a3b8]">
                      {sectors.length ? formatCompactPercent(sectors[0].percent) : "0%"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 h-full overflow-y-auto pr-1">
                  <div className="space-y-3 min-w-[160px]">
                    {sectors.length ? (
                      sectors.map((sector, index) => (
                        <div
                          key={sector.name || sector.sector || `sector-${index}`}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  SECTOR_COLORS[index % SECTOR_COLORS.length],
                              }}
                            />
                            <span className="text-[13px] text-[#3a4560] font-medium truncate">
                              {sector.name || sector.sector}
                            </span>
                          </div>

                          <span className="text-[13px] font-semibold text-[#2f3a56] shrink-0">
                            {formatCompactPercent(sector.percent)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[13px] font-medium text-[#94a3b8]">
                        Sin sectores
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4 h-[282px] flex flex-col">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3 shrink-0">
                Concentración del Portfolio
              </h3>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-2">
                  {concentrationRows.length ? (
                    concentrationRows.map((position) => (
                      <div
                        key={position.id || position.ticker}
                        className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between gap-3"
                      >
                        <span className="text-[13px] text-[#3a4560] font-medium">
                          {position.ticker}
                        </span>
                        <span className="text-[13px] font-bold text-[#24304a]">
                          {formatCompactPercent(position.weightPercent)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#eef4ff] rounded-xl px-4 py-3 text-[13px] font-medium text-[#94a3b8]">
                      Sin posiciones
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4 h-[282px] flex flex-col">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3 shrink-0">
                Top Ganadoras
              </h3>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-2">
                  {topGainers.length ? (
                    topGainers.map((position) => (
                      <div
                        key={position.id || position.ticker}
                        className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between gap-3"
                      >
                        <span className="text-[13px] text-[#3a4560] font-medium">
                          {position.ticker}
                        </span>
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: getAmountColor(position.unrealizedGain) }}
                        >
                          {formatMoney(position.unrealizedGain, generalData.currency)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#eef4ff] rounded-xl px-4 py-3 text-[13px] font-medium text-[#94a3b8]">
                      Sin posiciones
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;