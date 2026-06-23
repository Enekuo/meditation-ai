import React, { useEffect, useState } from "react";

const FX_DATE_KEY = "portfolio_fx_rates_date";

export default function FooterDisclaimer() {
  const [fxDate, setFxDate] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FX_DATE_KEY);
      if (stored) setFxDate(stored);
    } catch { /* ignore */ }
  }, []);

  return (
    <footer className="border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3">
      <p className="text-[11px] text-slate-400 dark:text-gray-500 leading-relaxed">
        Los precios de las acciones y los tipos de cambio se actualizan
        periódicamente. Los valores mostrados pueden diferir ligeramente de los
        de tu bróker en tiempo real.
        {fxDate && (
          <span className="ml-1">
            Última actualización de tipos de cambio:{" "}
            <span className="font-medium">{fxDate}</span>.
          </span>
        )}
      </p>
    </footer>
  );
}
