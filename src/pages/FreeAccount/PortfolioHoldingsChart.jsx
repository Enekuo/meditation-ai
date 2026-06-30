import React, { useMemo, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { useNavigate } from "react-router-dom";
import { calculateTopHoldings } from "@/lib/portfolioCalculations";
import { useSettings } from "@/contexts/SettingsProvider";

const HOLDING_COLORS = [
  "#2a78d6","#1baf7a","#eda100","#4a3aa7","#e87ba4","#eb6834",
  "#5b9ee0","#3dc492","#f5b938","#7560bc","#f0a5bf","#f09468",
  "#1a5299","#127a56","#a37100","#2f1f8a","#b5225a","#b5400d",
  "#20b2aa","#9b59b6","#e67e22","#27ae60","#2980b9","#8e44ad",
  "#16a085","#d35400","#2c3e50","#a84444","#1abc9c","#5d6d7e",
];

const formatCompactPercent = (value, locale = "es-ES") => {
  const num = Number(value || 0);
  return `${num.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

const ASSET_TYPE_LABELS = {
  "Acción": "Acciones",
  "ETF": "ETFs",
  "Fondo": "Fondos",
  "Cripto": "Cripto",
  "Otro": "Otros",
  "__none__": "Sin clasificar",
};

// Genera un sparkline SVG determinista a partir del ticker
function buildSparkline(ticker, positive, w = 120, h = 56) {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const n = 20;
  const vals = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const trend = positive ? t : 1 - t;
    const noise = Math.sin((i + seed) * 1.71) * 0.11 + Math.cos((i + seed) * 2.33) * 0.07;
    return Math.max(0.04, Math.min(0.96, trend * 0.68 + 0.12 + noise));
  });
  const pts = vals.map((v, i) => ({ x: (i / (n - 1)) * w, y: h - v * h }));
  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${lineD} L${w},${h} L0,${h} Z`;
  return { lineD, areaD };
}

export default function PortfolioHoldingsChart({
  positions = [],
  currency = "USD",
  fxRates = null,
  size = "small",
  showExpandButton = false,
  title = "DISTRIBUCIÓN DE ACTIVOS",
  onOtrosClick,
}) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const locale = settings.numberLocale;

  const [holdingsView, setHoldingsView] = useState(settings.defaultChartView || "donut");
  const [assetFilter, setAssetFilter] = useState("all");

  // Tipos de activo presentes en la cartera (dinámico)
  const availableAssetTypes = useMemo(() => {
    const types = new Set();
    let hasNone = false;
    positions.forEach((p) => {
      if (p.assetType) types.add(p.assetType);
      else hasNone = true;
    });
    const sorted = [...types].sort((a, b) => {
      const order = ["Acción", "ETF", "Fondo", "Cripto", "Otro"];
      return (order.indexOf(a) ?? 99) - (order.indexOf(b) ?? 99);
    });
    if (hasNone && sorted.length > 0) sorted.push("__none__");
    return sorted;
  }, [positions]);

  // Posiciones filtradas según el tipo de activo seleccionado
  const filteredPositions = useMemo(() => {
    if (assetFilter === "all") return positions;
    if (assetFilter === "__none__") return positions.filter((p) => !p.assetType);
    return positions.filter((p) => p.assetType === assetFilter);
  }, [positions, assetFilter]);

  const topHoldings = useMemo(
    () => calculateTopHoldings(filteredPositions, 30, currency, fxRates),
    [filteredPositions, currency, fxRates]
  );

  // ── Modal de detalle de posición ─────────────────────────────────────────
  const [clickedPos, setClickedPos] = useState(null);

  const positionsByTicker = useMemo(() => {
    const map = {};
    positions.forEach((p) => { if (p.ticker) map[p.ticker] = p; });
    return map;
  }, [positions]);

  const clickedIndex = clickedPos
    ? topHoldings.findIndex((h) => h.ticker === clickedPos.ticker)
    : -1;
  const clickedHolding = clickedIndex >= 0 ? topHoldings[clickedIndex] : null;
  const clickedColor = clickedIndex >= 0
    ? HOLDING_COLORS[clickedIndex % HOLDING_COLORS.length]
    : HOLDING_COLORS[0];

  const onChartEvents = useMemo(
    () => ({
      click: (params) => {
        if (params.name === "Otros") {
          setClickedPos(null);
          if (onOtrosClick) onOtrosClick();
          return;
        }
        const raw = positionsByTicker[params.name];
        if (raw) setClickedPos(raw);
      },
    }),
    [onOtrosClick, positionsByTicker]
  );

  useEffect(() => {
    if (!clickedPos) return;
    const onKey = (e) => { if (e.key === "Escape") setClickedPos(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [clickedPos]);
  // ─────────────────────────────────────────────────────────────────────────

  const hasPositions = filteredPositions.length > 0;

  const FILTER_TITLE_SUFFIX = {
    "Acción":    "DE ACCIONES",
    "ETF":       "DE ETFS",
    "Fondo":     "DE FONDOS",
    "Cripto":    "DE CRIPTO",
    "Otro":      "DE OTROS",
    "__none__":  "SIN CLASIFICAR",
  };
  const displayTitle = assetFilter === "all"
    ? title
    : `DISTRIBUCIÓN ${FILTER_TITLE_SUFFIX[assetFilter] || "DE ACTIVOS"}`;
  const isLarge = size === "large";
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const chartOption = useMemo(() => {
    if (!topHoldings.length) return {};

    const tooltipBg     = isDark ? "#1f2937" : "#ffffff";
    const tooltipBorder = isDark ? "#374151" : "#e2e8f0";
    const tooltipText   = isDark ? "#d1d5db" : "#374151";
    const borderColor   = isDark ? "#111827" : "#ffffff";

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        extraCssText: "border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);",
        textStyle: { color: tooltipText, fontSize: 12 },
        formatter: (params) =>
          `<b style="color:${params.color}">${params.name}</b><br/>${formatCompactPercent(params.value, locale)}`,
      },
      series: [
        {
          type: "pie",
          radius: isLarge ? ["36%", "65%"] : ["32%", "64%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          minShowLabelAngle: 1,
          label: {
            show: true,
            position: "outside",
            fontSize: isLarge ? 12 : 10,
            fontWeight: 600,
          },
          labelLine: {
            show: true,
            length: isLarge ? 10 : 7,
            length2: isLarge ? 18 : 13,
            smooth: 0.2,
            lineStyle: { width: 1, opacity: 0.65 },
          },
          itemStyle: {
            borderWidth: 2,
            borderColor,
          },
          data: topHoldings.map((item, i) => {
            const color   = HOLDING_COLORS[i % HOLDING_COLORS.length];
            const pct     = formatCompactPercent(item.weightPercent, locale);
            const isOtros = item.id === "otros";
            return {
              value: item.weightPercent,
              name: item.ticker,
              itemStyle: { color },
              label: {
                color,
                formatter: `${item.ticker} ${pct}`,
                ...(isOtros ? { show: true } : {}),
              },
              labelLine: {
                lineStyle: { color },
                ...(isOtros ? { show: true } : {}),
              },
            };
          }),
        },
      ],
    };
  }, [topHoldings, isLarge, isDark, locale]);

  const wrapperClass = isLarge
    ? "bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-6 py-5 min-h-[560px] flex flex-col"
    : "bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-3 flex flex-col";

  const titleClass = isLarge
    ? "text-center text-[20px] font-bold text-[#2f3a56] dark:text-gray-100 pt-1"
    : "text-center text-[16px] font-bold text-[#2f3a56] dark:text-gray-100";

  const buttonClass = (active) =>
    `${isLarge ? "h-9 px-4 rounded-xl text-[13px]" : "h-8 px-3 rounded-lg text-[12px]"} font-semibold border transition-all ${
      active
        ? "bg-[#2f6fed] border-[#2f6fed] text-white"
        : "bg-white dark:bg-gray-800 border-[#d9e2f1] dark:border-gray-600 text-[#51607f] dark:text-gray-300 hover:bg-[#f6f9ff] dark:hover:bg-gray-700"
    }`;

  const filterBtnClass = (active) =>
    `h-7 px-3 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap ${
      active
        ? "bg-[#2f6fed] border-[#2f6fed] text-white"
        : "bg-white dark:bg-gray-800 border-[#d9e2f1] dark:border-gray-600 text-[#51607f] dark:text-gray-300 hover:bg-[#f6f9ff] dark:hover:bg-gray-700"
    }`;

  return (
    <div className={wrapperClass}>
      <div className={`relative ${isLarge ? "min-h-[40px]" : "pt-1"}`}>
        {showExpandButton && !isLarge ? (
          <button
            type="button"
            onClick={() => navigate("/portfoliopositions")}
            className="absolute left-0 top-0 h-8 px-3 rounded-lg border border-[#d9e2f1] dark:border-gray-600 bg-white dark:bg-gray-800 text-[12px] font-semibold text-[#51607f] dark:text-gray-300 hover:bg-[#f6f9ff] dark:hover:bg-gray-700 transition-all"
          >
            Agrandar
          </button>
        ) : null}

        <h3 className={titleClass}>{displayTitle}</h3>

        <div className="absolute right-0 top-0 flex items-center gap-2">
          <button type="button" onClick={() => setHoldingsView("donut")} className={buttonClass(holdingsView === "donut")}>
            Donut
          </button>
          <button type="button" onClick={() => setHoldingsView("bars")} className={buttonClass(holdingsView === "bars")}>
            Barras
          </button>
        </div>
      </div>

      {/* ── Filtro por tipo de activo ── */}
      {availableAssetTypes.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setAssetFilter("all")}
            className={filterBtnClass(assetFilter === "all")}
          >
            Todo
          </button>
          {availableAssetTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAssetFilter(type)}
              className={filterBtnClass(assetFilter === type)}
            >
              {ASSET_TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>
      )}

      <div className={`flex-1 flex flex-col items-center justify-center ${isLarge ? "py-4" : "py-3"}`}>
        {holdingsView === "donut" ? (
          hasPositions ? (
            <div style={{ width: "100%", height: isLarge ? "520px" : "440px" }}>
              <ReactECharts
                option={chartOption}
                style={{ width: "100%", height: "100%" }}
                notMerge={true}
                opts={{ renderer: "canvas" }}
                onEvents={onChartEvents}
              />
            </div>
          ) : (
            <div className={`relative rounded-full bg-[#f1f5f9] dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 flex items-center justify-center ${isLarge ? "w-[340px] h-[340px]" : "w-[250px] h-[250px]"}`}>
              <div className={`absolute rounded-full bg-white dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 ${isLarge ? "inset-[48px]" : "inset-[35px]"}`} />
              <span className={`absolute font-semibold text-[#94a3b8] dark:text-gray-500 ${isLarge ? "text-[18px]" : "text-[14px]"}`}>
                Sin datos
              </span>
            </div>
          )
        ) : hasPositions ? (
          <div className={`w-full px-4 py-2 ${isLarge ? "max-w-[1100px]" : "max-w-[560px]"}`}>
            <div className={isLarge ? "space-y-5" : "overflow-y-auto max-h-[300px] space-y-4 pr-1"}>
              {topHoldings.map((item, index) => (
                <div
                  key={item.id || item.ticker}
                  className={`grid items-center ${isLarge ? "grid-cols-[220px_1fr_84px] gap-5" : "grid-cols-[170px_1fr_64px] gap-4"}`}
                >
                  <div className={`font-medium text-[#3a4560] dark:text-gray-300 truncate ${isLarge ? "text-[15px]" : "text-[13px]"}`}>
                    {item.ticker}
                  </div>
                  <div className={`overflow-hidden border border-[#edf1f7] dark:border-gray-700 bg-[#f1f4f9] dark:bg-gray-800 ${isLarge ? "h-[34px] rounded-lg" : "h-[24px] rounded-md"}`}>
                    <div
                      className={`h-full flex items-center justify-end text-white font-bold ${isLarge ? "pr-3 text-[13px] rounded-lg" : "pr-2 text-[12px] rounded-md"}`}
                      style={{
                        width: `${Math.max(Number(item.weightPercent || 0), 0)}%`,
                        backgroundColor: HOLDING_COLORS[index % HOLDING_COLORS.length],
                        minWidth: Number(item.weightPercent || 0) > 0 ? (isLarge ? "52px" : "42px") : "0px",
                      }}
                    >
                      {Number(item.weightPercent || 0) > 0 ? formatCompactPercent(item.weightPercent, locale) : ""}
                    </div>
                  </div>
                  <div className={`text-right font-semibold text-[#2f3a56] dark:text-gray-100 ${isLarge ? "text-[15px]" : "text-[13px]"}`}>
                    {formatCompactPercent(item.weightPercent, locale)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`w-full px-4 py-2 ${isLarge ? "max-w-[1100px]" : "max-w-[560px]"}`}>
            <div className={isLarge ? "space-y-5" : "space-y-4"}>
              {Array.from({ length: isLarge ? 8 : 6 }).map((_, index) => (
                <div
                  key={`empty-bar-${index}`}
                  className={`grid items-center ${isLarge ? "grid-cols-[220px_1fr_84px] gap-5" : "grid-cols-[170px_1fr_64px] gap-4"}`}
                >
                  <div className={`font-medium text-[#94a3b8] dark:text-gray-600 ${isLarge ? "text-[15px]" : "text-[13px]"}`}>
                    Sin datos
                  </div>
                  <div className={`overflow-hidden border border-[#edf1f7] dark:border-gray-700 bg-[#f1f4f9] dark:bg-gray-800 ${isLarge ? "h-[34px] rounded-lg" : "h-[24px] rounded-md"}`} />
                  <div className={`text-right font-semibold text-[#94a3b8] dark:text-gray-600 ${isLarge ? "text-[15px]" : "text-[13px]"}`}>
                    0{locale === "es-ES" ? "," : "."}0%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de detalle de posición ── */}
      {clickedPos && (
        <PositionModal
          position={clickedPos}
          holding={clickedHolding}
          color={clickedColor}
          locale={locale}
          onClose={() => setClickedPos(null)}
        />
      )}
    </div>
  );
}

// ─── Iconos SVG inline ────────────────────────────────────────────────────────
const IconLineChart = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="2,14 7,8 11,11 16,5"/>
    <line x1="2" y1="18" x2="18" y2="18"/>
  </svg>
);
const IconBarChart = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <rect x="2" y="10" width="4" height="8" rx="1"/>
    <rect x="8" y="6" width="4" height="12" rx="1"/>
    <rect x="14" y="2" width="4" height="16" rx="1"/>
  </svg>
);
const IconDatabase = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <ellipse cx="10" cy="5" rx="7" ry="2.5"/>
    <path d="M3 5v4c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V5"/>
    <path d="M3 9v4c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V9"/>
  </svg>
);
const IconArrowUp = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M4 14 L10 6 L16 14"/>
  </svg>
);
const IconArrowDown = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M4 6 L10 14 L16 6"/>
  </svg>
);
const IconDocument = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M6 2h6l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"/>
    <polyline points="12,2 12,6 16,6"/>
    <line x1="7" y1="10" x2="13" y2="10"/>
    <line x1="7" y1="13" x2="11" y2="13"/>
  </svg>
);
const IconDollar = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="10" cy="10" r="8"/>
    <path d="M10 6v8M8 8.5c0-.83.67-1.5 2-1.5s2 .67 2 1.5-.67 1.5-2 1.5-2 .67-2 1.5.67 1.5 2 1.5 2-.67 2-1.5"/>
  </svg>
);
const IconPercent = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="6" cy="6" r="2"/>
    <circle cx="14" cy="14" r="2"/>
    <line x1="4" y1="16" x2="16" y2="4"/>
  </svg>
);

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ ticker, positive }) {
  const { lineD, areaD } = buildSparkline(ticker, positive);
  const color = positive ? "#1baf7a" : "#ef4444";
  const gradId = `sg-${ticker.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 120 56" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`}/>
      <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Modal de detalle de posición ────────────────────────────────────────────
function PositionModal({ position: p, holding, color, locale, onClose }) {
  const ccy = p.quoteCurrency || "—";

  const fmt = (n, d = 2) =>
    Number(n || 0).toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });

  const fmtMoney = (n) => `${ccy} ${fmt(n)}`;

  const price    = Number(p.price || 0);
  const avgCost  = Number(p.avgCost || 0);
  const shares   = Number(p.shares || 0);
  const mktVal   = Number(p.marketValueOriginal || price * shares);
  const unreal   = (price - avgCost) * shares;
  const real     = Number(p.realizedGain || 0);
  const divPSh   = Number(p.annualDividend || 0);
  const totalDiv = divPSh * shares;
  const yieldPct = mktVal > 0 ? (totalDiv / mktVal) * 100 : 0;
  const weightPct = holding ? Number(holding.weightPercent || 0) : 0;

  const isPositive = unreal >= 0;
  const gainTextCls = isPositive
    ? "text-[#1baf7a] dark:text-green-400"
    : "text-red-500 dark:text-red-400";
  const gainIconBg = isPositive
    ? "bg-[#1baf7a]/15 text-[#1baf7a]"
    : "bg-red-500/15 text-red-500";

  // Formatea el número de acciones: sin decimales si es entero
  const sharesStr = shares % 1 === 0
    ? shares.toLocaleString(locale, { maximumFractionDigits: 0 })
    : fmt(shares, 4).replace(/0+$/, "").replace(/[.,]$/, "");

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-[#e7ebf3] dark:border-gray-700/60 shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ── Cabecera ── */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-[#f0f3fa] dark:border-gray-700/60">
          {/* Punto de color */}
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[26px] font-extrabold text-[#111827] dark:text-white leading-tight">
                {p.ticker}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[13px] font-semibold text-[#2a78d6] bg-[#2a78d6]/10 dark:bg-[#2a78d6]/20 dark:text-[#5b9ee0]">
                {formatCompactPercent(weightPct, locale)}
              </span>
            </div>
            {p.type && p.type !== "Sin tipo" && p.type !== "" && (
              <span className="text-[12px] text-[#6b7280] dark:text-gray-400">{p.type}</span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[#9ca3af] hover:text-[#374151] dark:hover:text-gray-200 hover:bg-[#f3f4f6] dark:hover:bg-gray-800 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Grid 2×3 de métricas ── */}
        <div className="grid grid-cols-2 gap-px bg-[#f0f3fa] dark:bg-gray-700/40 mx-6 mt-5 rounded-xl overflow-hidden border border-[#f0f3fa] dark:border-gray-700/40">
          {[
            {
              label: "Precio actual",
              value: fmtMoney(price),
              icon: <IconLineChart/>,
              iconBg: "bg-blue-500/12 text-blue-500 dark:text-blue-400",
            },
            {
              label: "Valor mercado",
              value: fmtMoney(mktVal),
              icon: <IconBarChart/>,
              iconBg: "bg-[#1baf7a]/12 text-[#1baf7a]",
            },
            {
              label: "Coste medio",
              value: fmtMoney(avgCost),
              icon: <IconDatabase/>,
              iconBg: "bg-purple-500/12 text-purple-500 dark:text-purple-400",
            },
            {
              label: "G/P no realizada",
              value: fmtMoney(unreal),
              valueClass: gainTextCls,
              icon: isPositive ? <IconArrowUp/> : <IconArrowDown/>,
              iconBg: gainIconBg,
            },
            {
              label: "Unidades",
              value: sharesStr,
              icon: <IconDocument/>,
              iconBg: "bg-orange-500/12 text-orange-500 dark:text-orange-400",
            },
            {
              label: "G/P realizada",
              value: fmtMoney(real),
              valueClass: real !== 0
                ? (real > 0 ? "text-[#1baf7a] dark:text-green-400" : "text-red-500 dark:text-red-400")
                : "text-[#6b7280] dark:text-gray-400",
              icon: <IconDatabase/>,
              iconBg: "bg-slate-500/12 text-slate-500 dark:text-slate-400",
            },
          ].map(({ label, value, icon, iconBg, valueClass }) => (
            <div key={label} className="flex items-center gap-3 bg-white dark:bg-[#111827] px-4 py-3.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                {icon}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-[#9ca3af] dark:text-gray-500 font-medium leading-tight">{label}</div>
                <div className={`text-[13px] font-bold leading-tight mt-0.5 truncate ${valueClass || "text-[#111827] dark:text-white"}`}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tarjeta destacada: Plusvalía no realizada ── */}
        <div className="mx-6 mt-3 rounded-xl bg-[#f6fdf9] dark:bg-[#0d1f17] border border-[#d1f2e3] dark:border-[#1baf7a]/20 overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${gainIconBg}`}>
              {isPositive
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M5 17 L12 7 L19 17"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M5 7 L12 17 L19 7"/></svg>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-[#6b7280] dark:text-gray-400 font-medium">Plusvalía no realizada</div>
              <div className={`text-[22px] font-extrabold leading-tight ${gainTextCls}`}>
                {fmtMoney(unreal)}
              </div>
              <div className="text-[12px] text-[#6b7280] dark:text-gray-400 font-medium">
                {formatCompactPercent(weightPct, locale)}
              </div>
            </div>
            {/* Mini sparkline */}
            <div className="w-[110px] h-[52px] shrink-0">
              <Sparkline ticker={p.ticker} positive={isPositive}/>
            </div>
          </div>
        </div>

        {/* ── Fila dividendo + yield ── */}
        <div className="grid grid-cols-2 gap-3 mx-6 mt-3 mb-5">
          <div className="flex items-center gap-3 bg-[#f0f5ff] dark:bg-[#0f1a2e] rounded-xl px-4 py-3.5 border border-[#dbe8ff] dark:border-blue-900/30">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white">
              <IconDollar/>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#9ca3af] dark:text-gray-500 font-medium leading-tight">Dividendo anuales estimados</div>
              <div className="text-[15px] font-extrabold text-[#111827] dark:text-white leading-tight mt-0.5 truncate">
                {ccy} {fmt(totalDiv)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#f5f0ff] dark:bg-[#190f2e] rounded-xl px-4 py-3.5 border border-[#e3d8ff] dark:border-purple-900/30">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0 text-white">
              <IconPercent/>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#9ca3af] dark:text-gray-500 font-medium leading-tight">Yield del portafolio</div>
              <div className="text-[15px] font-extrabold text-purple-600 dark:text-purple-400 leading-tight mt-0.5">
                {formatCompactPercent(yieldPct, locale)}
              </div>
            </div>
          </div>
        </div>

        {/* Sector si existe */}
        {p.sector && p.sector !== "Sin sector" && p.sector !== "" && (
          <div className="mx-6 mb-5 -mt-2 px-4 py-2.5 rounded-lg bg-[#f9fafb] dark:bg-gray-800/50 border border-[#f0f3fa] dark:border-gray-700/40">
            <span className="text-[11px] text-[#9ca3af] dark:text-gray-500">Sector: </span>
            <span className="text-[12px] font-semibold text-[#374151] dark:text-gray-200">{p.sector}</span>
          </div>
        )}
      </div>
    </div>
  );
}
