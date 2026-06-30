import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioHoldingsChart from "@/pages/FreeAccount/PortfolioHoldingsChart";
import PremiumModal from "@/components/PremiumModal";
import { getOrFetchFxRates } from "@/lib/fxRates";
import { usePortfolioData } from "@/contexts/PortfolioDataProvider";

export default function PortfolioPositions() {
  const navigate = useNavigate();
  const { generalData, positions } = usePortfolioData();
  const [fxRates, setFxRates] = useState(null);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  useEffect(() => {
    getOrFetchFxRates().then(setFxRates);
  }, []);

  return (
    <>
      <div className="-mt-14 mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="w-11 h-1 rounded-full bg-blue-500 mb-1" />
          <h1 className="text-[18px] md:text-[19px] font-bold tracking-tight text-[#2f3a56] dark:text-gray-100 uppercase">
            Posiciones De Cartera
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="h-10 px-4 rounded-xl border border-[#d9e2f1] dark:border-gray-600 bg-white dark:bg-gray-800 text-[13px] font-semibold text-[#51607f] dark:text-gray-300 hover:bg-[#f6f9ff] dark:hover:bg-gray-700 transition-all"
        >
          Volver
        </button>
      </div>

      <PortfolioHoldingsChart
        positions={positions}
        currency={generalData.currency}
        fxRates={fxRates}
        size="large"
        title="DISTRIBUCIÓN DE ACTIVOS"
        onOtrosClick={() => setPremiumModalOpen(true)}
      />

      <PremiumModal
        open={premiumModalOpen}
        positionCount={positions.length}
        onClose={() => setPremiumModalOpen(false)}
      />
    </>
  );
}
