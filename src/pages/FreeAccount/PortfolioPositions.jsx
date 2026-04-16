import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  calculateTopHoldings,
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

const emptyGeneralData = {
  cash: 0,
  benchmark: "S&P500",
  benchmarkReturn: 0,
  currency: "USD",
  taxDividends: 0,
  taxGains: 0,
};

const formatCompactPercent = (value) => {
  const num = Number(value || 0);
  return `${num.toFixed(1)}%`;
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

export default function PortfolioPositions() {
  const navigate = useNavigate();

  const [generalData, setGeneralData] = useState(emptyGeneralData);
  const [positions, setPositions] = useState([]);
  const [holdingsView, setHoldingsView] = useState("donut");

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

  const topHoldings = useMemo(
    () => calculateTopHoldings(positions, 10, generalData.currency),
    [positions, generalData.currency]
  );

  const holdingsGradient = useMemo(
    () => buildHoldingsGradient(topHoldings),
    [topHoldings]
  );

  const hasPositions = positions.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <div className="max-w-[1480px] mx-auto px-6 py-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="w-11 h-1 rounded-full bg-blue-500 mb-2" />
            <h1 className="text-[18px] md:text-[19px] font-bold tracking-tight text-[#2f3a56] uppercase">
              Posiciones De Cartera
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="h-10 px-4 rounded-xl border border-[#d9e2f1] bg-white text-[13px] font-semibold text-[#51607f] hover:bg-[#f6f9ff] transition-all"
          >
            Volver
          </button>
        </div>

        <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-6 py-5 min-h-[760px] flex flex-col">
          <div className="relative min-h-[40px]">
            <h3 className="text-center text-[20px] font-bold text-[#2f3a56] pt-1">
              ACCIONES
            </h3>

            <div className="absolute right-0 top-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHoldingsView("donut")}
                className={`h-9 px-4 rounded-xl text-[13px] font-semibold border transition-all ${
                  holdingsView === "donut"
                    ? "bg-[#2f6fed] border-[#2f6fed] text-white"
                    : "bg-white border-[#d9e2f1] text-[#51607f] hover:bg-[#f6f9ff]"
                }`}
              >
                Donut
              </button>

              <button
                type="button"
                onClick={() => setHoldingsView("bars")}
                className={`h-9 px-4 rounded-xl text-[13px] font-semibold border transition-all ${
                  holdingsView === "bars"
                    ? "bg-[#2f6fed] border-[#2f6fed] text-white"
                    : "bg-white border-[#d9e2f1] text-[#51607f] hover:bg-[#f6f9ff]"
                }`}
              >
                Barras
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-8">
            {holdingsView === "donut" ? (
              hasPositions ? (
                <div className="relative w-[520px] h-[520px] rounded-full shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{ background: holdingsGradient }}
                  />
                  <div className="absolute inset-[135px] rounded-full bg-white border border-[#edf1f7]" />

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
                    const radius = 322;
                    const x = 260 + Math.cos(radians) * radius;
                    const y = 260 + Math.sin(radians) * radius;

                    return (
                      <div
                        key={item.id || item.ticker}
                        className="absolute text-[14px] font-semibold whitespace-nowrap"
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
                <div className="relative w-[520px] h-[520px] rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center">
                  <div className="absolute inset-[135px] rounded-full bg-white border border-[#e2e8f0]" />
                  <span className="absolute text-[18px] font-semibold text-[#94a3b8]">
                    Sin datos
                  </span>
                </div>
              )
            ) : hasPositions ? (
              <div className="w-full max-w-[1100px] px-4 py-2">
                <div className="space-y-5">
                  {topHoldings.map((item, index) => (
                    <div
                      key={item.id || item.ticker}
                      className="grid grid-cols-[220px_1fr_84px] items-center gap-5"
                    >
                      <div className="text-[15px] font-medium text-[#3a4560] truncate">
                        {item.ticker}
                      </div>

                      <div className="h-[34px] rounded-lg bg-[#f1f4f9] overflow-hidden border border-[#edf1f7]">
                        <div
                          className="h-full flex items-center justify-end pr-3 text-white text-[13px] font-bold rounded-lg"
                          style={{
                            width: `${Math.max(Number(item.weightPercent || 0), 0)}%`,
                            backgroundColor:
                              HOLDING_COLORS[index % HOLDING_COLORS.length],
                            minWidth:
                              Number(item.weightPercent || 0) > 0 ? "52px" : "0px",
                          }}
                        >
                          {Number(item.weightPercent || 0) > 0
                            ? formatCompactPercent(item.weightPercent)
                            : ""}
                        </div>
                      </div>

                      <div className="text-right text-[15px] font-semibold text-[#2f3a56]">
                        {formatCompactPercent(item.weightPercent)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[1100px] px-4 py-2">
                <div className="space-y-5">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={`empty-bar-${index}`}
                      className="grid grid-cols-[220px_1fr_84px] items-center gap-5"
                    >
                      <div className="text-[15px] font-medium text-[#94a3b8]">
                        Sin datos
                      </div>
                      <div className="h-[34px] rounded-lg bg-[#f1f4f9] overflow-hidden border border-[#edf1f7]" />
                      <div className="text-right text-[15px] font-semibold text-[#94a3b8]">
                        0.0%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}