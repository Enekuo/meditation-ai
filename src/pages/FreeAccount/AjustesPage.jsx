import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useSettings } from "@/contexts/SettingsProvider";

const BASE_CURRENCY_OPTIONS = [
  "AUD","CAD","CHF","CZK","DKK","EUR","GBP","HKD","HUF","JPY",
  "MXN","NOK","NZD","SEK","SGD","USD",
];

// ─── Generic toggle row ────────────────────────────────────────────────────
function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div>
        <p className="text-[13px] font-medium text-[#2f3a56] dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          checked ? "bg-blue-600" : "bg-slate-200 dark:bg-gray-600"
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#edf1f7] dark:border-gray-700 bg-[#f9fafc] dark:bg-gray-800">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#3b455e] dark:text-gray-400">
          {title}
        </p>
      </div>
      <div className="divide-y divide-[#edf1f7] dark:divide-gray-700">{children}</div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function AjustesPage() {
  const { settings, updateSettings, baseCurrency, updateBaseCurrency } = useSettings();

  // Local copy so we can show saved feedback without spamming localStorage
  const [savedKey, setSavedKey] = useState(null);

  const save = (key, valueFn) => {
    valueFn();
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
  };

  // ── Divisa base ────────────────────────────────────────────────────────
  const [localCurrency, setLocalCurrency] = useState(baseCurrency);
  useEffect(() => setLocalCurrency(baseCurrency), [baseCurrency]);

  const handleCurrencyChange = (e) => setLocalCurrency(e.target.value);
  const handleCurrencySave = () => {
    save("currency", () => updateBaseCurrency(localCurrency));
  };

  const selectBase =
    "rounded-xl border border-[#d9e2f1] dark:border-gray-600 " +
    "bg-white dark:bg-gray-800 text-[13px] " +
    "text-[#2f3a56] dark:text-gray-100 " +
    "px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors";

  return (
    <div className="min-h-screen bg-[#f5f7fc] dark:bg-gray-950">
      <div className="max-w-[720px] mx-auto px-6 py-8 space-y-5">

        {/* Título */}
        <div>
          <div className="w-11 h-1 rounded-full bg-blue-500 mb-2" />
          <h1 className="text-[18px] md:text-[19px] font-bold tracking-tight text-[#2f3a56] dark:text-gray-100 uppercase">
            Ajustes
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-gray-400">
            Personaliza cómo se muestra y comporta la aplicación.
          </p>
        </div>

        {/* ── Cartera ── */}
        <Section title="Cartera">
          {/* Divisa base */}
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div>
              <p className="text-[13px] font-medium text-[#2f3a56] dark:text-gray-100">
                Divisa base
              </p>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">
                Todos los totales y porcentajes se convierten a esta divisa.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={localCurrency}
                onChange={handleCurrencyChange}
                className={selectBase}
              >
                {BASE_CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleCurrencySave}
                className="h-9 px-3 rounded-xl bg-[#2f6fed] hover:bg-[#2560d4] text-white text-[12px] font-semibold transition-colors whitespace-nowrap flex items-center gap-1"
              >
                {savedKey === "currency" ? <><Check size={13} /> Guardado</> : "Guardar"}
              </button>
            </div>
          </div>

          {/* Mostrar dividendos */}
          <ToggleRow
            label="Mostrar dividendos estimados"
            description="Muestra las tarjetas de dividendos anuales y yield en el Dashboard."
            checked={settings.showDividends}
            onChange={(v) => save("dividends", () => updateSettings({ showDividends: v }))}
          />
        </Section>

        {/* ── Apariencia ── */}
        <Section title="Apariencia">
          {/* Tema */}
          <div className="px-5 py-4">
            <p className="text-[13px] font-medium text-[#2f3a56] dark:text-gray-100 mb-3">
              Tema
            </p>
            <div className="flex gap-2">
              {[
                { key: "light", icon: <Sun size={15} />, label: "Claro" },
                { key: "dark",  icon: <Moon size={15} />, label: "Oscuro" },
                { key: "system", icon: <Monitor size={15} />, label: "Sistema" },
              ].map(({ key, icon, label }) => {
                const active = settings.theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => save("theme", () => updateSettings({ theme: key }))}
                    className={`flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold border transition-all ${
                      active
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                        : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border-[#d9e2f1] dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {icon}{label}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── Visualización ── */}
        <Section title="Visualización">
          {/* Formato de números */}
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div>
              <p className="text-[13px] font-medium text-[#2f3a56] dark:text-gray-100">
                Formato de números
              </p>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">
                Europeo: 1.234,56 · Anglosajón: 1,234.56
              </p>
            </div>
            <select
              value={settings.numberLocale}
              onChange={(e) =>
                save("locale", () => updateSettings({ numberLocale: e.target.value }))
              }
              className={`${selectBase} shrink-0`}
            >
              <option value="es-ES">Europeo (1.234,56)</option>
              <option value="en-US">Anglosajón (1,234.56)</option>
            </select>
          </div>

          {/* Gráfico por defecto */}
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div>
              <p className="text-[13px] font-medium text-[#2f3a56] dark:text-gray-100">
                Vista por defecto del gráfico de acciones
              </p>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">
                Se aplica al abrir el Dashboard o la página de posiciones.
              </p>
            </div>
            <select
              value={settings.defaultChartView}
              onChange={(e) =>
                save("chart", () => updateSettings({ defaultChartView: e.target.value }))
              }
              className={`${selectBase} shrink-0`}
            >
              <option value="donut">Donut</option>
              <option value="bars">Barras</option>
            </select>
          </div>
        </Section>

        {savedKey && (
          <div className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-semibold px-4 py-2 rounded-xl shadow-lg pointer-events-none">
            Ajuste guardado
          </div>
        )}
      </div>
    </div>
  );
}
