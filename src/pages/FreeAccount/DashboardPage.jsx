import React, { useEffect, useMemo, useState } from "react";
import {
  calculatePortfolioTotals,
  calculateSectorDistribution,
  calculateInvestmentTypeDistribution,
  normalizePosition,
} from "@/lib/portfolioCalculations";
import { getOrFetchFxRates } from "@/lib/fxRates";
import { useSettings } from "@/contexts/SettingsProvider";
import { usePortfolioData } from "@/contexts/PortfolioDataProvider";
import PortfolioHoldingsChart from "@/pages/FreeAccount/PortfolioHoldingsChart";
import PremiumModal from "@/components/PremiumModal";
import ExpandModal from "@/components/ExpandModal";

const TYPE_COLORS = {
  Especulativa: "#2a78d6",
  "Largo Plazo": "#1baf7a",
  Dividendos: "#4a3aa7",
  "Sin tipo": "#94a3b8",
};

const SECTOR_COLORS = [
  "#2a78d6","#1baf7a","#eda100","#4a3aa7","#e87ba4","#eb6834",
  "#5b9ee0","#3dc492","#f5b938","#7560bc",
];


const formatMoney = (value, currency = "USD", locale = "es-ES") => {
  const num = Number(value || 0);
  return `${currency} ${num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercent = (value, locale = "es-ES") => {
  const num = Number(value || 0);
  return `${num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

const formatCompactPercent = (value, locale = "es-ES") => {
  const num = Number(value || 0);
  return `${num.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

const getAmountColor = (value) => {
  const num = Number(value || 0);
  if (num > 0) return "#4aa56d";
  if (num < 0) return "#d94b62";
  return "#94a3b8";
};

const buildConicGradient = (items, colorGetter, gapDeg = 0, gapColor = "#ffffff") => {
  if (!items.length) return "conic-gradient(#e2e8f0 0deg 360deg)";
  let start = 0;
  const stops = [];
  items.forEach((item, index) => {
    const percent = Number(item.percent || 0);
    const degrees = (percent / 100) * 360;
    const color = colorGetter(item, index);
    const isLast = index === items.length - 1;
    const gap = (!isLast && gapDeg > 0 && degrees > gapDeg * 2) ? gapDeg : 0;
    stops.push(`${color} ${start}deg ${start + degrees - gap}deg`);
    if (gap > 0) stops.push(`${gapColor} ${start + degrees - gap}deg ${start + degrees}deg`);
    start = start + degrees;
  });
  if (start < 360) stops.push(`#e2e8f0 ${start}deg 360deg`);
  return `conic-gradient(${stops.join(",")})`;
};



const ExpandBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2f6fed] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-gray-800"
    aria-label="Expandir"
  >
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2h4v4M14 2l-5 5M6 14H2v-4M2 14l5-5"/>
    </svg>
  </button>
);

const DashboardPage = ({ filterToAcciones = false }) => {
  const { settings } = useSettings();
  const locale = settings.numberLocale;
  const showDividends = settings.showDividends;

  const { generalData, positions } = usePortfolioData();
  const [fxRates, setFxRates] = useState(null);

  useEffect(() => {
    getOrFetchFxRates().then(setFxRates);
  }, []);

  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const accionPositions = useMemo(
    () => positions.filter(p => (p.assetType || "") === "Acción"),
    [positions]
  );

  const viewPositions = useMemo(
    () => (filterToAcciones ? accionPositions : positions),
    [filterToAcciones, accionPositions, positions]
  );

  const totals = useMemo(
    () => calculatePortfolioTotals(generalData, viewPositions, fxRates),
    [generalData, viewPositions, fxRates]
  );

  const sectors = useMemo(
    () => calculateSectorDistribution(viewPositions, generalData.currency, fxRates),
    [viewPositions, generalData.currency, fxRates]
  );

  const investmentTypes = useMemo(
    () => calculateInvestmentTypeDistribution(viewPositions, generalData.currency, fxRates),
    [viewPositions, generalData.currency, fxRates]
  );

  const concentrationRows = useMemo(() => {
    return viewPositions
      .map((position) => normalizePosition(position, generalData.currency, fxRates))
      .sort((a, b) => Number(b.marketValue || 0) - Number(a.marketValue || 0));
  }, [viewPositions, generalData.currency, fxRates]);

  const topGainers = useMemo(() => {
    return viewPositions
      .map((position) => normalizePosition(position, generalData.currency, fxRates))
      .sort((a, b) => Number(b.unrealizedGain || 0) - Number(a.unrealizedGain || 0));
  }, [viewPositions, generalData.currency, fxRates]);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const cardBg = isDark ? '#111827' : '#ffffff';
  const typeGradient = buildConicGradient(investmentTypes, (item) => TYPE_COLORS[item.type] || "#94a3b8", 2, cardBg);
  const sectorGradient = buildConicGradient(sectors, (_, index) => SECTOR_COLORS[index % SECTOR_COLORS.length], 2, cardBg);
  const benchmarkLabel = generalData.benchmark || "Benchmark";

  // Dark-mode-aware card shadow
  const cardClass =
    "relative group bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)]";

  const pillClass = "bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-2 flex items-center justify-between";

  return (
    <div className="min-h-screen bg-[#f5f7fc] dark:bg-gray-950">
      <div className="max-w-[1480px] mx-auto px-6 py-5">
        <div className="mb-4">
          <div className="w-11 h-1 rounded-full bg-blue-500 mb-2" />
          <h1 className="text-[18px] md:text-[19px] font-bold tracking-tight text-[#2f3a56] dark:text-gray-100 uppercase">
            Información General Del Portafolio
          </h1>
        </div>

        {/* ── Empty state (solo página Acciones, sin posiciones clasificadas) ── */}
        {filterToAcciones && accionPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#eef4ff] dark:bg-gray-800 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-[#2f3a56] dark:text-gray-100 mb-1">
                No tienes posiciones clasificadas como Acción
              </p>
              <p className="text-[13px] text-[#51607f] dark:text-gray-400">
                Ve a Portfolio Input y asigna el tipo de activo "Acción" a tus posiciones.
              </p>
            </div>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-1 xl:grid-cols-[0.98fr_1.62fr_0.78fr] gap-4">
          {/* ── Valor actual ── */}
          <div className={`${cardClass} overflow-hidden`}>
            <ExpandBtn onClick={() => setExpandedCard("valor-actual")} />
            <div className="px-4 pt-4 pb-3">
              <p className="text-[13px] font-semibold text-[#3b455e] dark:text-gray-300 mb-2">
                Valor Actual
              </p>
              <h2 className="text-[28px] leading-none font-bold text-[#202b45] dark:text-gray-100 flex items-end gap-2">
                <span className="text-[16px] font-semibold text-[#6b7280] dark:text-gray-400">
                  {generalData.currency}
                </span>
                <span className="relative top-[2px]">
                  {Number(totals.portfolioValue || 0).toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </h2>
            </div>

            <div className="border-t border-[#edf1f7] dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#66c38b] flex items-center justify-center text-white text-sm font-bold">$</div>
                <p className="text-[13px] font-semibold text-[#3b455e] dark:text-gray-300">Efectivo liquidado</p>
              </div>
              <p className="text-[14px] font-bold text-[#2c3651] dark:text-gray-100">
                {formatMoney(totals.cash, generalData.currency, locale)}
              </p>
            </div>

            <div className="border-t border-[#edf1f7] dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4678df] flex items-center justify-center text-white text-xs font-bold">▣</div>
                <p className="text-[13px] font-semibold text-[#3b455e] dark:text-gray-300 leading-[1.15]">
                  Cantidad<br />Invertida
                </p>
              </div>
              <p className="text-[14px] font-bold text-[#2c3651] dark:text-gray-100">
                {formatMoney(totals.positionsValueTotal, generalData.currency, locale)}
              </p>
            </div>

            <div className="border-t border-[#edf1f7] dark:border-gray-700 px-4 py-4">
              <div className="flex items-center gap-4">
                <div className="relative w-[128px] h-[128px] shrink-0 transition-transform duration-300 hover:scale-[1.04] cursor-pointer">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: buildConicGradient(
                        [{ percent: totals.cashWeight }, { percent: totals.investedWeight }],
                        (_, index) => (index === 0 ? "#1baf7a" : "#2a78d6"),
                        2,
                        cardBg
                      ),
                    }}
                  />
                  <div className="absolute inset-[18px] rounded-full bg-white dark:bg-gray-900 flex items-center justify-center border border-[#edf1f7] dark:border-gray-700">
                    <span className="text-[34px] leading-none text-[#94a3b8]">$</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-[2px] bg-[#1baf7a] shrink-0" />
                      <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">Efectivo</span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#2f3a56] dark:text-gray-100">
                      {formatCompactPercent(totals.cashWeight, locale)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-[2px] bg-[#2a78d6] shrink-0" />
                      <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium leading-[1.1]">
                        Cantidad<br />Invertida
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#2f3a56] dark:text-gray-100">
                      {formatCompactPercent(totals.investedWeight, locale)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8 rounded-xl border border-[#e7edf7] dark:border-gray-700 bg-[#eef4ff] dark:bg-gray-800 px-4 py-2 text-center">
                <p className="text-[12px] font-bold uppercase tracking-wide text-[#35405c] dark:text-gray-300">
                  {filterToAcciones ? "Cantidad De Acciones" : "Total De Activos"}
                </p>
                <p className="text-[30px] leading-none mt-1 font-bold text-[#3471e6]">
                  {totals.positionsCount}
                </p>
              </div>
            </div>
          </div>

          {/* ── Holdings chart ── */}
          <PortfolioHoldingsChart
            positions={viewPositions}
            currency={generalData.currency}
            fxRates={fxRates}
            size="small"
            showExpandButton={true}
            title={filterToAcciones ? "ACCIONES" : "DISTRIBUCIÓN DE ACTIVOS"}
            hideAssetFilter={filterToAcciones}
            onOtrosClick={() => setPremiumModalOpen(true)}
            onExpandClick={() => setExpandedCard("chart")}
          />

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">
            {showDividends && (
              <div className="grid grid-cols-2 gap-3">
                <div className={`${cardClass} px-3 py-3 text-center h-[98px] flex flex-col justify-center`}>
                  <ExpandBtn onClick={() => setExpandedCard("dividendos")} />
                  <p className="text-[12px] leading-tight font-bold text-[#313b56] dark:text-gray-300">
                    Dividendos<br />Anuales<br />Estimados
                  </p>
                  <p className="mt-2 text-[14px] font-bold text-[#24304a] dark:text-gray-100">
                    {formatMoney(totals.annualDividendsTotal, generalData.currency, locale)}
                  </p>
                </div>
                <div className={`${cardClass} px-3 py-3 text-center h-[98px] flex flex-col justify-center`}>
                  <ExpandBtn onClick={() => setExpandedCard("dividendos")} />
                  <p className="text-[12px] leading-tight font-bold text-[#313b56] dark:text-gray-300">
                    Yield Del<br />Portafolio
                  </p>
                  <p className="mt-2 text-[14px] font-bold text-[#94a3b8]">
                    {formatPercent(totals.yieldPercent, locale)}
                  </p>
                </div>
              </div>
            )}

            <div className={`${cardClass} px-4 py-4`}>
              <ExpandBtn onClick={() => setExpandedCard("retorno")} />
              <h3 className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100 mb-3">Retorno Promedio Anual</h3>
              <div className="space-y-2">
                <div className={pillClass}>
                  <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">Mi Retorno</span>
                  <span className="text-[13px] font-bold text-[#24304a] dark:text-gray-100">
                    {formatPercent(totals.portfolioReturnPercent, locale)}
                  </span>
                </div>
                <div className={pillClass}>
                  <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">{benchmarkLabel}</span>
                  <span className="text-[13px] font-bold text-[#24304a] dark:text-gray-100">
                    {formatPercent(totals.benchmarkReturn, locale)}
                  </span>
                </div>
                <div className={pillClass}>
                  <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">Diferencia</span>
                  <span className="text-[13px] font-bold text-[#24304a] dark:text-gray-100">
                    {formatPercent(totals.benchmarkDifference, locale)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`${cardClass} px-4 py-4`}>
              <ExpandBtn onClick={() => setExpandedCard("tipo-inversion")} />
              <h3 className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100 mb-3">Tipo De Inversión</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-[112px] h-[112px] shrink-0 transition-transform duration-300 hover:scale-[1.04] cursor-pointer">
                  <div className="w-full h-full rounded-full" style={{ background: typeGradient }} />
                  <div className="absolute inset-[16px] rounded-full bg-white dark:bg-gray-900 border border-[#edf1f7] dark:border-gray-700" />
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
                    <div key={item.type} className="flex items-center justify-between gap-3 min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-[2px]"
                          style={{ backgroundColor: TYPE_COLORS[item.type] || "#94a3b8" }}
                        />
                        <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">{item.type}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#2f3a56] dark:text-gray-100">
                        {formatCompactPercent(item.percent, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Segunda fila ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[0.72fr_1.28fr] gap-4 mt-4">
          <div className="flex flex-col gap-4">
            {/* Ganancia/Pérdida */}
            <div className={`${cardClass} px-4 py-4`}>
              <ExpandBtn onClick={() => setExpandedCard("ganancia")} />
              <h3 className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100 mb-3">Ganancia/Pérdida</h3>
              <div className="overflow-hidden rounded-xl border border-[#edf1f7] dark:border-gray-700">
                <div className="grid grid-cols-[1fr_auto] bg-[#f4f8fb] dark:bg-gray-800">
                  <div className="px-3 py-2 text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">
                    Ganancia/Pérdida (sin realizar)
                  </div>
                  <div
                    className="px-3 py-2 text-[13px] font-bold"
                    style={{ color: getAmountColor(totals.unrealizedGainTotal) }}
                  >
                    {formatMoney(totals.unrealizedGainTotal, generalData.currency, locale)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sectores */}
            <div className={`${cardClass} px-4 py-4 h-[282px] flex flex-col`}>
              <ExpandBtn onClick={() => setExpandedCard("sectores")} />
              <h3 className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100 mb-3 shrink-0">Sectores</h3>
              <div className="flex-1 min-h-0 flex items-center justify-center gap-6">
                <div className="relative w-[118px] h-[118px] shrink-0 transition-transform duration-300 hover:scale-[1.04] cursor-pointer">
                  <div className="w-full h-full rounded-full" style={{ background: sectorGradient }} />
                  <div className="absolute inset-[17px] rounded-full bg-white dark:bg-gray-900 border border-[#edf1f7] dark:border-gray-700 flex items-center justify-center">
                    <span className="text-[12px] font-semibold text-[#94a3b8]">
                      {sectors.length ? formatCompactPercent(sectors[0].percent, locale) : "0,0%"}
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
                              className="w-2 h-2 rounded-[2px] shrink-0"
                              style={{ backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length] }}
                            />
                            <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium truncate">
                              {sector.name || sector.sector}
                            </span>
                          </div>
                          <span className="text-[13px] font-semibold text-[#2f3a56] dark:text-gray-100 shrink-0">
                            {formatCompactPercent(sector.percent, locale)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[13px] font-medium text-[#94a3b8] dark:text-gray-500">Sin sectores</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Concentración + Top Ganadoras */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className={`${cardClass} px-4 py-4 h-[404px] flex flex-col`}>
              <ExpandBtn onClick={() => setExpandedCard("concentracion")} />
              <h3 className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100 mb-3 shrink-0">
                Concentración por Valor de Mercado
              </h3>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-2">
                  {concentrationRows.length ? (
                    concentrationRows.map((position) => (
                      <div
                        key={position.id || position.ticker}
                        className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-2 flex items-center justify-between gap-3"
                      >
                        <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">{position.ticker}</span>
                        <span className="text-[13px] font-bold text-[#24304a] dark:text-gray-100">
                          {/* Show original currency — sort/proportions still use base-currency internally */}
                          {formatMoney(position.marketValueOriginal, position.quoteCurrency, locale)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-3 text-[13px] font-medium text-[#94a3b8] dark:text-gray-500">
                      Sin posiciones
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${cardClass} px-4 py-4 h-[404px] flex flex-col`}>
              <ExpandBtn onClick={() => setExpandedCard("top-ganadoras")} />
              <h3 className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100 mb-3 shrink-0">Top Ganadoras</h3>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-2">
                  {topGainers.length ? (
                    topGainers.map((position) => (
                      <div
                        key={position.id || position.ticker}
                        className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-2 flex items-center justify-between gap-3"
                      >
                        <span className="text-[13px] text-[#3a4560] dark:text-gray-300 font-medium">{position.ticker}</span>
                        <div className="flex items-center gap-1.5">
                          {/* Show original currency — ranking order still uses base-currency internally */}
                          <span className="text-[13px] font-bold text-[#24304a] dark:text-gray-400">
                            {position.quoteCurrency}
                          </span>
                          <span
                            className="text-[13px] font-bold"
                            style={{ color: getAmountColor(position.unrealizedGainOriginal) }}
                          >
                            {Number(position.unrealizedGainOriginal || 0).toLocaleString(locale, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-3 text-[13px] font-medium text-[#94a3b8] dark:text-gray-500">
                      Sin posiciones
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
      {expandedCard && (() => {
        const cfg = {
          "valor-actual":  { title: "Valor Actual del Portafolio",           maxWidth: "max-w-2xl" },
          "chart":         { title: filterToAcciones ? "Acciones" : "Distribución de Activos", maxWidth: "max-w-5xl" },
          "retorno":       { title: "Retorno Promedio Anual",                 maxWidth: "max-w-lg" },
          "tipo-inversion":{ title: "Tipo De Inversión",                     maxWidth: "max-w-lg" },
          "dividendos":    { title: "Dividendos",                            maxWidth: "max-w-md" },
          "ganancia":      { title: "Ganancia / Pérdida",                    maxWidth: "max-w-lg" },
          "sectores":      { title: "Sectores",                              maxWidth: "max-w-lg" },
          "concentracion": { title: "Concentración por Valor de Mercado",    maxWidth: "max-w-md" },
          "top-ganadoras": { title: "Top Ganadoras",                         maxWidth: "max-w-md" },
        }[expandedCard];
        if (!cfg) return null;

        const pillLg = "bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-6 py-5 flex items-center justify-between";

        const content = {
          "valor-actual": (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-[13px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">Valor Total</p>
                <h2 className="text-[48px] leading-none font-bold text-[#202b45] dark:text-gray-100">
                  <span className="text-[22px] font-semibold text-[#6b7280] dark:text-gray-400 mr-2">{generalData.currency}</span>
                  {Number(totals.portfolioValue || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-5 py-4">
                  <p className="text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">Efectivo liquidado</p>
                  <p className="text-[22px] font-bold text-[#1baf7a]">{formatMoney(totals.cash, generalData.currency, locale)}</p>
                </div>
                <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-5 py-4">
                  <p className="text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">Cantidad invertida</p>
                  <p className="text-[22px] font-bold text-[#2a78d6]">{formatMoney(totals.positionsValueTotal, generalData.currency, locale)}</p>
                </div>
                <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-5 py-4">
                  <p className="text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">% Efectivo</p>
                  <p className="text-[22px] font-bold text-[#2f3a56] dark:text-gray-100">{formatPercent(totals.cashWeight, locale)}</p>
                </div>
                <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-5 py-4">
                  <p className="text-[12px] font-semibold text-[#3b455e] dark:text-gray-300 mb-1">% Invertido</p>
                  <p className="text-[22px] font-bold text-[#2f3a56] dark:text-gray-100">{formatPercent(totals.investedWeight, locale)}</p>
                </div>
              </div>
              <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-5 py-4 text-center">
                <p className="text-[13px] font-bold uppercase tracking-wide text-[#35405c] dark:text-gray-300">
                  {filterToAcciones ? "Cantidad De Acciones" : "Total De Activos"}
                </p>
                <p className="text-[44px] leading-none mt-1 font-bold text-[#3471e6]">{totals.positionsCount}</p>
              </div>
            </div>
          ),
          "chart": (
            <PortfolioHoldingsChart
              positions={viewPositions}
              currency={generalData.currency}
              fxRates={fxRates}
              size="large"
              flat={true}
              title={filterToAcciones ? "ACCIONES" : "DISTRIBUCIÓN DE ACTIVOS"}
              hideAssetFilter={filterToAcciones}
              onOtrosClick={() => { setExpandedCard(null); setPremiumModalOpen(true); }}
            />
          ),
          "retorno": (
            <div className="space-y-4">
              {[
                { label: "Mi Retorno",     value: formatPercent(totals.portfolioReturnPercent, locale), color: "#2a78d6" },
                { label: benchmarkLabel,   value: formatPercent(totals.benchmarkReturn, locale),        color: "#1baf7a" },
                { label: "Diferencia",     value: formatPercent(totals.benchmarkDifference, locale),   color: getAmountColor(totals.benchmarkDifference) },
              ].map(({ label, value, color }) => (
                <div key={label} className={pillLg}>
                  <span className="text-[16px] text-[#3a4560] dark:text-gray-300 font-semibold">{label}</span>
                  <span className="text-[28px] font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          ),
          "tipo-inversion": (
            <div className="flex items-center justify-center gap-10 py-4">
              <div className="relative w-[200px] h-[200px] shrink-0">
                <div className="w-full h-full rounded-full" style={{ background: typeGradient }} />
                <div className="absolute inset-[28px] rounded-full bg-white dark:bg-gray-900 border border-[#edf1f7] dark:border-gray-700" />
              </div>
              <div className="space-y-5 min-w-[200px]">
                {(investmentTypes.length ? investmentTypes : [
                  { type: "Especulativa", percent: 0 },
                  { type: "Largo Plazo",  percent: 0 },
                  { type: "Dividendos",   percent: 0 },
                ]).map((item) => (
                  <div key={item.type} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: TYPE_COLORS[item.type] || "#94a3b8" }} />
                      <span className="text-[16px] text-[#3a4560] dark:text-gray-300 font-medium">{item.type}</span>
                    </div>
                    <span className="text-[18px] font-bold text-[#2f3a56] dark:text-gray-100">{formatCompactPercent(item.percent, locale)}</span>
                  </div>
                ))}
              </div>
            </div>
          ),
          "dividendos": (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-5 py-5 text-center">
                <p className="text-[13px] font-bold uppercase tracking-wide text-[#35405c] dark:text-gray-300 mb-3">Dividendos Anuales Estimados</p>
                <p className="text-[28px] font-bold text-[#24304a] dark:text-gray-100">{formatMoney(totals.annualDividendsTotal, generalData.currency, locale)}</p>
              </div>
              <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-2xl px-5 py-5 text-center">
                <p className="text-[13px] font-bold uppercase tracking-wide text-[#35405c] dark:text-gray-300 mb-3">Yield Del Portafolio</p>
                <p className="text-[28px] font-bold text-[#94a3b8]">{formatPercent(totals.yieldPercent, locale)}</p>
              </div>
            </div>
          ),
          "ganancia": (
            <div className="space-y-4">
              <div className={pillLg}>
                <span className="text-[16px] text-[#3a4560] dark:text-gray-300 font-semibold">G/P no realizada</span>
                <span className="text-[28px] font-bold" style={{ color: getAmountColor(totals.unrealizedGainTotal) }}>
                  {formatMoney(totals.unrealizedGainTotal, generalData.currency, locale)}
                </span>
              </div>
              {concentrationRows.length > 0 && (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {concentrationRows.map((position) => (
                    <div key={position.id || position.ticker} className="bg-[#f4f8fb] dark:bg-gray-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                      <span className="text-[14px] text-[#3a4560] dark:text-gray-300 font-medium">{position.ticker}</span>
                      <span className="text-[14px] font-bold" style={{ color: getAmountColor(position.unrealizedGain) }}>
                        {formatMoney(position.unrealizedGain, generalData.currency, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
          "sectores": (
            <div className="flex items-start gap-8 py-2">
              <div className="relative w-[180px] h-[180px] shrink-0">
                <div className="w-full h-full rounded-full" style={{ background: sectorGradient }} />
                <div className="absolute inset-[25px] rounded-full bg-white dark:bg-gray-900 border border-[#edf1f7] dark:border-gray-700 flex items-center justify-center">
                  <span className="text-[14px] font-semibold text-[#94a3b8]">
                    {sectors.length ? formatCompactPercent(sectors[0].percent, locale) : "0,0%"}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[340px] pr-1">
                {sectors.length ? sectors.map((sector, index) => (
                  <div key={sector.name || sector.sector || `s-${index}`} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length] }} />
                      <span className="text-[14px] text-[#3a4560] dark:text-gray-300 font-medium truncate">{sector.name || sector.sector}</span>
                    </div>
                    <span className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100 shrink-0">{formatCompactPercent(sector.percent, locale)}</span>
                  </div>
                )) : (
                  <div className="text-[14px] font-medium text-[#94a3b8] dark:text-gray-500">Sin sectores</div>
                )}
              </div>
            </div>
          ),
          "concentracion": (
            <div className="space-y-2">
              {concentrationRows.length ? concentrationRows.map((position) => (
                <div key={position.id || position.ticker} className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="text-[14px] text-[#3a4560] dark:text-gray-300 font-medium">{position.ticker}</span>
                  <span className="text-[14px] font-bold text-[#24304a] dark:text-gray-100">
                    {formatMoney(position.marketValueOriginal, position.quoteCurrency, locale)}
                  </span>
                </div>
              )) : (
                <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-3 text-[14px] font-medium text-[#94a3b8] dark:text-gray-500">Sin posiciones</div>
              )}
            </div>
          ),
          "top-ganadoras": (
            <div className="space-y-2">
              {topGainers.length ? topGainers.map((position) => (
                <div key={position.id || position.ticker} className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="text-[14px] text-[#3a4560] dark:text-gray-300 font-medium">{position.ticker}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#24304a] dark:text-gray-400">{position.quoteCurrency}</span>
                    <span className="text-[14px] font-bold" style={{ color: getAmountColor(position.unrealizedGainOriginal) }}>
                      {Number(position.unrealizedGainOriginal || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="bg-[#eef4ff] dark:bg-gray-800 rounded-xl px-4 py-3 text-[14px] font-medium text-[#94a3b8] dark:text-gray-500">Sin posiciones</div>
              )}
            </div>
          ),
        }[expandedCard];

        return (
          <ExpandModal
            title={cfg.title}
            onClose={() => setExpandedCard(null)}
            maxWidth={cfg.maxWidth}
          >
            {content}
          </ExpandModal>
        );
      })()}
      <PremiumModal
        open={premiumModalOpen}
        positionCount={positions.length}
        onClose={() => setPremiumModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
