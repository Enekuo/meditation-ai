import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioHoldingsChart from "@/pages/FreeAccount/PortfolioHoldingsChart";

const GENERAL_STORAGE_KEY = "portfolio_general_data";
const POSITIONS_STORAGE_KEY = "portfolio_positions";

const emptyGeneralData = {
  cash: 0,
  benchmark: "S&P500",
  benchmarkReturn: 0,
  currency: "USD",
  taxDividends: 0,
  taxGains: 0,
};

export default function PortfolioPositions() {
  const navigate = useNavigate();
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

        <PortfolioHoldingsChart
          positions={positions}
          currency={generalData.currency}
          size="large"
          title="ACCIONES"
        />
      </div>
    </div>
  );
}