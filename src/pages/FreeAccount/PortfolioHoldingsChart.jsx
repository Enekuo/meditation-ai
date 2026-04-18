import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateTopHoldings } from "@/lib/portfolioCalculations";

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

export default function PortfolioHoldingsChart({
  positions = [],
  currency = "USD",
  size = "small",
  showExpandButton = false,
  title = "ACCIONES",
}) {
  const navigate = useNavigate();
  const [holdingsView, setHoldingsView] = useState("donut");

  const topHoldings = useMemo(
    () => calculateTopHoldings(positions, 10, currency),
    [positions, currency]
  );

  const holdingsGradient = useMemo(
    () => buildHoldingsGradient(topHoldings),
    [topHoldings]
  );

  const hasPositions = positions.length > 0;
  const isLarge = size === "large";

  const wrapperClass = isLarge
    ? "bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-6 py-5 min-h-[560px] flex flex-col"
    : "bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-3 flex flex-col";

  const titleClass = isLarge
    ? "text-center text-[20px] font-bold text-[#2f3a56] pt-1"
    : "text-center text-[16px] font-bold text-[#2f3a56]";

  const buttonClass = (active) =>
    `${isLarge ? "h-9 px-4 rounded-xl text-[13px]" : "h-8 px-3 rounded-lg text-[12px]"} font-semibold border transition-all ${
      active
        ? "bg-[#2f6fed] border-[#2f6fed] text-white"
        : "bg-white border-[#d9e2f1] text-[#51607f] hover:bg-[#f6f9ff]"
    }`;

  return (
    <div className={wrapperClass}>
      <div className={`relative ${isLarge ? "min-h-[40px]" : "pt-1"}`}>
        {showExpandButton && !isLarge ? (
          <button
            type="button"
            onClick={() => navigate("/portfoliopositions")}
            className="absolute left-0 top-0 h-8 px-3 rounded-lg border border-[#d9e2f1] bg-white text-[12px] font-semibold text-[#51607f] hover:bg-[#f6f9ff] transition-all"
          >
            Agrandar
          </button>
        ) : null}

        <h3 className={titleClass}>{title}</h3>

        <div className="absolute right-0 top-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHoldingsView("donut")}
            className={buttonClass(holdingsView === "donut")}
          >
            Donut
          </button>

          <button
            type="button"
            onClick={() => setHoldingsView("bars")}
            className={buttonClass(holdingsView === "bars")}
          >
            Barras
          </button>
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col items-center justify-center ${
          isLarge ? "py-4" : "py-3"
        }`}
      >
        {holdingsView === "donut" ? (
          hasPositions ? (
            <div
              className={`relative rounded-full shrink-0 ${
                isLarge ? "w-[340px] h-[340px]" : "w-[250px] h-[250px]"
              }`}
            >
              <div
                className="w-full h-full rounded-full"
                style={{ background: holdingsGradient }}
              />
              <div
                className={`absolute rounded-full bg-white border border-[#edf1f7] ${
                  isLarge ? "inset-[88px]" : "inset-[67px]"
                }`}
              />

              {topHoldings.map((item, index) => {
                const angle =
                  topHoldings
                    .slice(0, index)
                    .reduce(
                      (sum, holding) => sum + Number(holding.weightPercent || 0),
                      0
                    ) + Number(item.weightPercent || 0) / 2;

                const radians = ((angle / 100) * 360 - 90) * (Math.PI / 180);

                const center = isLarge ? 170 : 125;
                const radius = isLarge ? 212 : 158;
                const x = center + Math.cos(radians) * radius;
                const y = center + Math.sin(radians) * radius;

                return (
                  <div
                    key={item.id || item.ticker}
                    className={`absolute font-semibold whitespace-nowrap ${
                      isLarge ? "text-[14px]" : "text-[11px]"
                    }`}
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
            <div
              className={`relative rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center ${
                isLarge ? "w-[340px] h-[340px]" : "w-[250px] h-[250px]"
              }`}
            >
              <div
                className={`absolute rounded-full bg-white border border-[#e2e8f0] ${
                  isLarge ? "inset-[88px]" : "inset-[67px]"
                }`}
              />
              <span
                className={`absolute font-semibold text-[#94a3b8] ${
                  isLarge ? "text-[18px]" : "text-[14px]"
                }`}
              >
                Sin datos
              </span>
            </div>
          )
        ) : hasPositions ? (
          <div
            className={`w-full px-4 py-2 ${
              isLarge ? "max-w-[1100px]" : "max-w-[560px]"
            }`}
          >
            <div className={isLarge ? "space-y-5" : "space-y-4"}>
              {topHoldings.map((item, index) => (
                <div
                  key={item.id || item.ticker}
                  className={`grid items-center ${
                    isLarge
                      ? "grid-cols-[220px_1fr_84px] gap-5"
                      : "grid-cols-[170px_1fr_64px] gap-4"
                  }`}
                >
                  <div
                    className={`font-medium text-[#3a4560] truncate ${
                      isLarge ? "text-[15px]" : "text-[13px]"
                    }`}
                  >
                    {item.ticker}
                  </div>

                  <div
                    className={`overflow-hidden border border-[#edf1f7] bg-[#f1f4f9] ${
                      isLarge ? "h-[34px] rounded-lg" : "h-[24px] rounded-md"
                    }`}
                  >
                    <div
                      className={`h-full flex items-center justify-end text-white font-bold ${
                        isLarge
                          ? "pr-3 text-[13px] rounded-lg"
                          : "pr-2 text-[12px] rounded-md"
                      }`}
                      style={{
                        width: `${Math.max(Number(item.weightPercent || 0), 0)}%`,
                        backgroundColor:
                          HOLDING_COLORS[index % HOLDING_COLORS.length],
                        minWidth:
                          Number(item.weightPercent || 0) > 0
                            ? isLarge
                              ? "52px"
                              : "42px"
                            : "0px",
                      }}
                    >
                      {Number(item.weightPercent || 0) > 0
                        ? formatCompactPercent(item.weightPercent)
                        : ""}
                    </div>
                  </div>

                  <div
                    className={`text-right font-semibold text-[#2f3a56] ${
                      isLarge ? "text-[15px]" : "text-[13px]"
                    }`}
                  >
                    {formatCompactPercent(item.weightPercent)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`w-full px-4 py-2 ${
              isLarge ? "max-w-[1100px]" : "max-w-[560px]"
            }`}
          >
            <div className={isLarge ? "space-y-5" : "space-y-4"}>
              {Array.from({ length: isLarge ? 8 : 6 }).map((_, index) => (
                <div
                  key={`empty-bar-${index}`}
                  className={`grid items-center ${
                    isLarge
                      ? "grid-cols-[220px_1fr_84px] gap-5"
                      : "grid-cols-[170px_1fr_64px] gap-4"
                  }`}
                >
                  <div
                    className={`font-medium text-[#94a3b8] ${
                      isLarge ? "text-[15px]" : "text-[13px]"
                    }`}
                  >
                    Sin datos
                  </div>
                  <div
                    className={`overflow-hidden border border-[#edf1f7] bg-[#f1f4f9] ${
                      isLarge ? "h-[34px] rounded-lg" : "h-[24px] rounded-md"
                    }`}
                  />
                  <div
                    className={`text-right font-semibold text-[#94a3b8] ${
                      isLarge ? "text-[15px]" : "text-[13px]"
                    }`}
                  >
                    0.0%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}