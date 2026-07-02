import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePortfolioData } from "@/contexts/PortfolioDataProvider";

const baseCurrencyOptions = [
  "AUD",
  "CAD",
  "CHF",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "JPY",
  "MXN",
  "NOK",
  "NZD",
  "SEK",
  "SGD",
  "USD",
];

const quoteCurrencyOptions = [
  "USD",
  "AED",
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNH",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "ILS",
  "JPY",
  "KRW",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PLN",
  "RON",
  "SAR",
  "SEK",
  "SGD",
  "TRY",
  "TWD",
  "ZAR",
];

const quoteUnitOptions = [
  { value: "NORMAL", label: "Normal" },
  { value: "GBX", label: "GBX (peniques UK)" },
];

const emptyGeneralData = {
  cash: "",
  benchmark: "S&P500",
  benchmarkReturn: "10",
  currency: "EUR",
  taxDividends: "0",
  taxGains: "0",
};

const emptyPositionForm = {
  ticker: "",
  price: "",
  quoteCurrency: "EUR",
  quoteUnit: "NORMAL",
  sector: "",
  type: "",
  assetType: "",
  shares: "",
  avgCost: "",
  annualDividend: "",
  realizedGain: "",
};

const benchmarkGroups = [
  {
    label: "Índices Globales",
    options: [
      "S&P500",
      "Nasdaq 100",
      "MSCI World",
      "IBEX 35",
      "DAX 40",
      "FTSE 100",
      "CAC 40",
      "Nikkei 225",
      "Hang Seng",
      "ASX 200",
      "Euro Stoxx 50",
      "MSCI Emerging Markets",
      "MSCI Europe",
      "MSCI All Country World (ACWI)",
    ],
  },
  {
    label: "Renta Fija",
    options: ["US 10Y Treasury Bond", "Bloomberg Global Aggregate Bond"],
  },
  {
    label: "Cripto",
    options: ["Bitcoin (BTC)", "Ethereum (ETH)"],
  },
  {
    label: "Commodities",
    options: ["Gold (Oro)", "Oil WTI (Petróleo)"],
  },
];

// Retorno histórico anual promedio aproximado por benchmark (referencia editable)
const BENCHMARK_RETURNS = {
  "S&P500": "10.0",
  "Nasdaq 100": "13.0",
  "MSCI World": "8.0",
  "IBEX 35": "6.0",
  "DAX 40": "8.5",
  "FTSE 100": "7.0",
  "CAC 40": "7.5",
  "Nikkei 225": "8.0",
  "Hang Seng": "6.0",
  "ASX 200": "8.0",
  "Euro Stoxx 50": "7.5",
  "MSCI Emerging Markets": "7.0",
  "MSCI Europe": "7.0",
  "MSCI All Country World (ACWI)": "9.0",
  "US 10Y Treasury Bond": "3.5",
  "Bloomberg Global Aggregate Bond": "3.0",
  "Bitcoin (BTC)": "50.0",
  "Ethereum (ETH)": "40.0",
  "Gold (Oro)": "5.0",
  "Oil WTI (Petróleo)": "3.0",
};
const sectorOptions = [
  "Tecnología",
  "Salud",
  "Consumo Básico",
  "Consumo Discrecional",
  "Industrial",
  "Financiero",
  "Energía",
  "Bonos",
  "Inmobiliario",
  "Telecomunicaciones",
  "Materiales",
  "Utilities",
  "Otro",
];
const typeOptions = ["Largo Plazo", "Dividendos", "Especulativa"];
const assetTypeOptions = ["Acción", "ETF", "Fondo", "Cripto", "Otro"];

// ─── Selector personalizado de Benchmark (agrupado por categoría) ─────────
// Renderizado vía portal en document.body para no quedar recortado por el
// overflow-hidden de la tarjeta contenedora, y poder ser más ancho que el trigger.
function BenchmarkSelect({ value, onChange, groups, className }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const computeCoords = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    const desiredWidth = Math.max(rect.width * 2, 480);
    const width = Math.min(desiredWidth, window.innerWidth - 32);
    let left = rect.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - width - 16;
    if (left > maxLeft) left = Math.max(maxLeft, window.scrollX + 16);
    setCoords({ top: rect.bottom + window.scrollY + 6, left, width });
  };

  const handleToggle = () => {
    if (!open) computeCoords();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      const insideTrigger = triggerRef.current && triggerRef.current.contains(e.target);
      const insidePanel = panelRef.current && panelRef.current.contains(e.target);
      if (!insideTrigger && !insidePanel) setOpen(false);
    };
    const handleResize = () => computeCoords();
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`${className} flex items-center justify-between gap-2`}
      >
        <span className="truncate">{value || "Selecciona..."}</span>
        <svg
          viewBox="0 0 20 20"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-slate-400 dark:text-gray-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5l5 5 5-5" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "absolute", top: coords.top, left: coords.left, width: coords.width }}
            className="z-[9999] max-h-[480px] overflow-y-auto scrollbar-thin rounded-2xl border border-[#d9e2f1] dark:border-gray-600 bg-white dark:bg-gray-800 shadow-2xl py-2"
          >
            {groups.map((group, gIndex) => (
              <div
                key={group.label}
                className={gIndex > 0 ? "mt-1 pt-2 border-t border-[#edf1f7] dark:border-gray-700" : ""}
              >
                <p className="px-4 pt-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 bg-slate-50/80 dark:bg-gray-900/30 select-none cursor-default">
                  {group.label}
                </p>
                {group.options.map((option) => {
                  const active = option === value;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-4 py-3 text-[15px] flex items-center justify-between gap-3 transition-colors ${
                        active
                          ? "bg-[#dce9ff] dark:bg-blue-900/50 text-[#2f6fed] dark:text-blue-300 font-semibold shadow-[inset_3px_0_0_0_#2f6fed]"
                          : "text-[#24375d] dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700/70"
                      }`}
                    >
                      <span className="truncate">{option}</span>
                      {active && (
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" className="shrink-0">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

const PortfolioInputPage = () => {
  const {
    generalData: ctxGeneralData,
    positions: ctxPositions,
    isLoading: ctxLoading,
    saveGeneralData: ctxSaveGeneralData,
    savePositions: ctxSavePositions,
  } = usePortfolioData();

  const [generalData, setGeneralData] = useState(emptyGeneralData);
  const [positions, setPositions] = useState([]);
  const [formData, setFormData] = useState(emptyPositionForm);
  const [editingId, setEditingId] = useState(null);
  const [generalSavedMessage, setGeneralSavedMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formWarning, setFormWarning] = useState("");
  const [isGeneralSectionOpen, setIsGeneralSectionOpen] = useState(true);
  const [isImportSectionOpen, setIsImportSectionOpen] = useState(false);
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [initDone, setInitDone] = useState(false);

  const importEditorRef = useRef(null);

  useEffect(() => {
    if (!ctxLoading && !initDone) {
      const loadedGeneral = { ...emptyGeneralData, ...ctxGeneralData };
      setGeneralData(loadedGeneral);
      setPositions(ctxPositions);
      // Inicializa el formulario con la divisa real del portfolio, no "EUR" hardcodeado
      setFormData((prev) => ({ ...prev, quoteCurrency: loadedGeneral.currency || "EUR" }));
      setInitDone(true);
    }
  }, [ctxLoading, ctxGeneralData, ctxPositions, initDone]);

  const totalPositions = positions.length;

  const formattedCashPreview = useMemo(() => {
    const rawValue = String(generalData.cash || "").replace(",", ".");
    const value = Number(rawValue || 0);
    return `${generalData.currency} ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [generalData.cash, generalData.currency]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBenchmarkSelect = (option) => {
    setGeneralData((prev) => ({
      ...prev,
      benchmark: option,
      benchmarkReturn: BENCHMARK_RETURNS[option] ?? prev.benchmarkReturn,
    }));
  };

  const handleSaveGeneralData = () => {
    ctxSaveGeneralData(generalData);
    setIsGeneralSectionOpen(false);
    setGeneralSavedMessage("Datos generales guardados correctamente.");
    setTimeout(() => {
      setGeneralSavedMessage("");
    }, 2500);
  };

  const handlePositionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ ...emptyPositionForm, quoteCurrency: generalData.currency || "EUR" });
    setEditingId(null);
    setFormError("");
    setFormWarning("");
  };

  const validatePositionForm = () => {
    if (
      !formData.ticker.trim() ||
      !formData.price ||
      !formData.quoteCurrency ||
      !formData.shares ||
      !formData.avgCost ||
      !formData.annualDividend ||
      formData.realizedGain === ""
    ) {
      return "Completa los campos obligatorios: Ticker, Precio, Moneda, Cantidad, Costo, Dividendo y Ganancia Realizada.";
    }

    if (
      Number(String(formData.price).replace(",", ".")) < 0 ||
      Number(String(formData.shares).replace(",", ".")) < 0 ||
      Number(String(formData.avgCost).replace(",", ".")) < 0 ||
      Number(String(formData.annualDividend).replace(",", ".")) < 0
    ) {
      return "Los valores numéricos no pueden ser negativos.";
    }

    return "";
  };

  const checkOptionalWarning = () => {
    const missing = [];
    if (!formData.assetType) missing.push("Tipo de Activo");
    if (!formData.sector) missing.push("Sector");
    if (!formData.type) missing.push("Tipo de Inversión");
    if (missing.length === 0) return "";
    return `Has dejado vacío: ${missing.join(", ")}. Esto repercutirá en los análisis del dashboard (filtros, gráficos de sector y tipo).`;
  };

const buildPositionObject = () => {
  const existingPosition =
    positions.find((position) => position.id === editingId) || null;

  const parsedPrice = Number(String(formData.price).replace(",", "."));
  const parsedShares = Number(String(formData.shares).replace(",", "."));
  const parsedAvgCost = Number(String(formData.avgCost).replace(",", "."));
  const parsedAnnualDividend = Number(
    String(formData.annualDividend).replace(",", ".")
  );
  const parsedRealizedGain = Number(
    String(formData.realizedGain).replace(",", ".")
  );

  return {
    id: editingId || crypto.randomUUID(),
    ticker: formData.ticker.trim().toUpperCase(),
    price: parsedPrice,
    quoteCurrency: formData.quoteCurrency,
    quoteUnit: formData.quoteUnit,
    sector: formData.sector,
    type: formData.type,
    assetType: formData.assetType,
    shares: parsedShares,
    avgCost: parsedAvgCost,
    annualDividend: parsedAnnualDividend,
    realizedGain: parsedRealizedGain,
    unrealizedGainOriginal: existingPosition?.unrealizedGainOriginal ?? 0,
    marketValueOriginal:
      existingPosition?.marketValueOriginal ?? parsedPrice * parsedShares,
    costBasisOriginal:
      existingPosition?.costBasisOriginal ?? parsedAvgCost * parsedShares,
  };
};

  const persistPositions = (nextPositions) => {
    setPositions(nextPositions);
    ctxSavePositions(nextPositions);
  };

  const handleAddOrUpdatePosition = () => {
    const validationError = validatePositionForm();

    if (validationError) {
      setFormError(validationError);
      setFormWarning("");
      return;
    }

    setFormError("");
    const warning = checkOptionalWarning();

    const nextPosition = buildPositionObject();

    if (editingId) {
      const updated = positions.map((position) =>
        position.id === editingId ? nextPosition : position
      );
      persistPositions(updated);
    } else {
      const updated = [...positions, nextPosition];
      persistPositions(updated);
    }

    // Limpiar el form pero conservar el aviso visible para que el usuario lo vea
    setFormData({ ...emptyPositionForm, quoteCurrency: generalData.currency || "EUR" });
    setEditingId(null);
    setFormWarning(warning);
  };

  const handleEditPosition = (position) => {
    setEditingId(position.id);
    setFormData({
      ticker: position.ticker,
      price: String(position.price),
      quoteCurrency: position.quoteCurrency || generalData.currency || "EUR",
      quoteUnit: position.quoteUnit || "NORMAL",
      sector: position.sector,
      type: position.type,
      assetType: position.assetType || "",
      shares: String(position.shares),
      avgCost: String(position.avgCost),
      annualDividend: String(position.annualDividend),
      realizedGain: String(position.realizedGain),
    });
    setFormError("");
    setIsAddPositionOpen(true);
    setIsGeneralSectionOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePosition = (id) => {
    const updated = positions.filter((position) => position.id !== id);
    persistPositions(updated);

    if (editingId === id) {
      resetForm();
    }
  };

  const formatMoney = (value, currency = generalData.currency) => {
    return `${currency} ${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

const parseFlexibleNumber = (value) => {
  if (value === null || value === undefined) return 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  let normalized = raw;

  if (hasComma && hasDot) {
    if (raw.lastIndexOf(".") > raw.lastIndexOf(",")) {
      normalized = raw.replace(/,/g, "");
    } else {
      normalized = raw.replace(/\./g, "").replace(",", ".");
    }
  } else if (hasComma) {
    const commaParts = raw.split(",");
    const decimalDigits = commaParts[commaParts.length - 1]?.length || 0;

    if (decimalDigits > 0 && decimalDigits <= 4) {
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = raw.replace(/,/g, "");
    }
  } else if (hasDot) {
    const dotParts = raw.split(".");
    const decimalDigits = dotParts[dotParts.length - 1]?.length || 0;

    if (decimalDigits === 3 && dotParts.length > 2) {
      normalized = raw.replace(/\./g, "");
    } else {
      normalized = raw;
    }
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
};


  const isIbkrCurrencyHeader = (line) => {
    const value = String(line || "").trim().toUpperCase();
    return [
      "EUR",
      "USD",
      "GBP",
      "AUD",
      "CAD",
      "CHF",
      "CZK",
      "DKK",
      "HKD",
      "HUF",
      "JPY",
      "MXN",
      "NOK",
      "NZD",
      "SEK",
      "SGD",
    ].includes(value);
  };

  const isIbkrNoiseLine = (line) => {
    const value = String(line || "").trim();

    if (!value) return true;

    return (
      value === "Acciones" ||
      value.startsWith("Total") ||
      value.includes("Símbolo") ||
      value.includes("Cantidad") ||
      value.includes("Precio de coste") ||
      value.includes("Precio de cierre") ||
      value.includes("PyG no realizadas") ||
      value.includes("Código")
    );
  };

  const parseIbkrPastedTable = (rawText) => {
    const lines = String(rawText || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/\t/g, " ").trim())
      .filter(Boolean);

    let currentCurrency = "EUR";
    const imported = [];

    lines.forEach((line) => {
      if (isIbkrNoiseLine(line)) return;

      if (isIbkrCurrencyHeader(line)) {
        currentCurrency = line.trim().toUpperCase();
        return;
      }

      const parts = line.split(/\s+/);

      if (parts.length < 8) return;

      const ticker = parts[0]?.trim().toUpperCase();

      if (!/^[A-Z0-9.\-]{1,15}$/.test(ticker)) return;

      const shares = parseFlexibleNumber(parts[1]);

      // Algunos formatos IBKR incluyen la divisa en parts[2] (ej: "NVDA 10 USD 534.30 …")
      // Si parts[2] es un código de divisa válido, úsalo; si no, usa el header de sección.
      const inlineCurrency = isIbkrCurrencyHeader(parts[2] || "")
        ? parts[2].trim().toUpperCase()
        : null;
      const positionCurrency = inlineCurrency || currentCurrency;

      const avgCost = parseFlexibleNumber(parts[3]);
      const costBasis = parseFlexibleNumber(parts[4]);
      const currentPrice = parseFlexibleNumber(parts[5]);
      const marketValue = parseFlexibleNumber(parts[6]);
      const unrealizedGain = parseFlexibleNumber(parts[7]);

      imported.push({
        id: crypto.randomUUID(),
        ticker,
        price: currentPrice,
        quoteCurrency: positionCurrency,
        quoteUnit: "NORMAL",
        sector: "",
        type: "",
        assetType: "",
        shares,
        avgCost,
        annualDividend: 0,
        realizedGain: 0,
        unrealizedGainOriginal: unrealizedGain,
        marketValueOriginal: marketValue,
        costBasisOriginal: costBasis,
      });
    });

    return imported;
  };

  const handleAutoFillFromIbkr = () => {
    setImportMessage("");
    setImportError("");

    const rawText = importEditorRef.current?.innerText || "";

    if (!rawText.trim()) {
      setImportError("Primero pega tus posiciones de IBKR en el cuadro.");
      return;
    }

    const importedPositions = parseIbkrPastedTable(rawText);

    if (!importedPositions.length) {
      setImportError("No se han podido detectar posiciones válidas con ese formato.");
      return;
    }

    const updatedPositions = [...positions];

    importedPositions.forEach((importedPosition) => {
      const existingIndex = updatedPositions.findIndex(
        (position) => position.ticker === importedPosition.ticker
      );

      if (existingIndex >= 0) {
        updatedPositions[existingIndex] = {
          ...updatedPositions[existingIndex],
          ...importedPosition,
          id: updatedPositions[existingIndex].id,
          sector: updatedPositions[existingIndex].sector || "",
          type: updatedPositions[existingIndex].type || "",
          annualDividend: updatedPositions[existingIndex].annualDividend || 0,
        };
      } else {
        updatedPositions.push(importedPosition);
      }
    });

    persistPositions(updatedPositions);

    setImportMessage(
      `${importedPositions.length} ${
        importedPositions.length === 1 ? "posición rellenada" : "posiciones rellenadas"
      } automáticamente.`
    );
  };

  // Shared class fragments to keep JSX DRY
  const cardClass =
    "bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-[16px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden";

  const cardHeaderClass =
    "px-4 py-3 bg-[#f5f8ff] dark:bg-gray-800 border-b border-[#e7ebf3] dark:border-gray-700";

  const cardHeaderTitleClass =
    "text-[15px] font-bold text-[#2f3a56] dark:text-gray-100";

  const labelClass =
    "block text-[12px] font-semibold text-[#2f3a56] dark:text-gray-300 mb-1.5";

  const inputClass =
    "w-full h-[38px] rounded-lg border border-[#d9e2f1] dark:border-gray-600 px-3 text-[13px] text-[#24375d] dark:text-gray-100 bg-white dark:bg-gray-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 dark:placeholder-gray-500";

  const inputLgClass =
    "w-full h-[40px] rounded-lg border border-[#d9e2f1] dark:border-gray-600 px-3 text-[14px] text-[#24375d] dark:text-gray-100 bg-white dark:bg-gray-800 outline-none focus:border-blue-400 dark:focus:border-blue-500 dark:placeholder-gray-500";

  const selectClass =
    "w-full h-[38px] rounded-lg border border-[#d9e2f1] dark:border-gray-600 px-3 text-[13px] text-[#24375d] dark:text-gray-100 bg-white dark:bg-gray-800 outline-none focus:border-blue-400 dark:focus:border-blue-500";

  const selectLgClass =
    "w-full h-[40px] rounded-lg border border-[#d9e2f1] dark:border-gray-600 px-3 text-[14px] text-[#24375d] dark:text-gray-100 bg-white dark:bg-gray-800 outline-none focus:border-blue-400 dark:focus:border-blue-500";

  const btnPrimaryClass =
    "h-[38px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[12px] font-bold hover:bg-[#316fda] transition-colors";

  const btnSecondaryClass =
    "h-[38px] px-4 rounded-lg border border-[#d9e2f1] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#2f3a56] dark:text-gray-300 text-[12px] font-semibold hover:bg-[#f8fbff] dark:hover:bg-gray-700 transition-colors";

  const thClass =
    "text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] dark:text-gray-300 border-b border-[#e7ebf3] dark:border-gray-700";

  const tdClass =
    "px-3 py-2.5 text-[12px] text-[#24375d] dark:text-gray-300 border-b border-[#edf1f7] dark:border-gray-700";

  return (
    <div className="w-full">
      <div className="max-w-[1280px] mx-auto px-4 pt-0 pb-3">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="w-9 h-1 rounded-full bg-blue-500 mb-2" />
            <h1 className="text-[20px] leading-none font-bold text-[#24375d] dark:text-gray-100">
              Portfolio Input
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsImportSectionOpen((prev) => !prev)}
            className="h-[38px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[12px] font-bold hover:bg-[#316fda] transition-colors whitespace-nowrap"
          >
            {isImportSectionOpen ? "Ocultar importación" : "Importar desde tu broker"}
          </button>
        </div>

        {/* ── Importar desde tu broker ── */}
        {isImportSectionOpen ? (
          <div className={`${cardClass} mb-4`}>
            <div className={cardHeaderClass}>
              <h2 className={cardHeaderTitleClass}>
                Importar cartera automáticamente
              </h2>
            </div>

            {/* ── Bloque premium ── */}
            <div className="px-4 pt-4 pb-0">
              <div className="rounded-xl bg-[#eff6ff] dark:bg-[#0a1929] border border-[#93c5fd]/60 dark:border-[#1e3a5f] p-5 flex flex-col lg:flex-row gap-5 items-start">

                {/* Izquierda: candado + texto + botón */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#2563eb]/10 dark:bg-[#2563eb]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="#2563eb" width="22" height="22">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8V6a3 3 0 10-6 0v3h6zm-3 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1e3a5f] dark:text-gray-100 leading-snug mb-1.5">
                      Función disponible en{" "}
                      <span className="text-[#2563eb]">Plan Premium</span>
                    </h3>
                    <p className="text-[13px] text-[#4b5563] dark:text-gray-400 leading-relaxed mb-4 max-w-sm">
                      No podemos garantizar la importación desde cualquier broker en el plan gratuito. Esta función está disponible en Premium.
                    </p>
                    {/* TODO: reemplazar navigate por /premium cuando exista */}
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 h-[38px] px-5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-bold transition-colors"
                    >
                      Ver planes Premium
                      <span>👑</span>
                    </button>
                  </div>
                </div>

                {/* Centro: lista de checks */}
                <div className="flex flex-col gap-2.5 justify-center shrink-0">
                  {[
                    "Importación desde cualquier broker",
                    "Sincronización automática",
                    "Datos siempre actualizados",
                    "Ahorra tiempo y evita errores manuales",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 20 20" fill="white" width="11" height="11">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                      <span className="text-[13px] font-medium text-[#374151] dark:text-gray-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Derecha: ilustración decorativa */}
                <div className="relative w-[130px] h-[96px] shrink-0 hidden lg:block">
                  <div className="w-full h-full rounded-lg border border-[#93c5fd]/70 dark:border-[#1e3a5f] bg-white dark:bg-[#0a1929] shadow-md overflow-hidden">
                    <div className="h-[18px] bg-[#dbeafe] dark:bg-[#0c1f3f] flex items-center px-2 gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f87171]"/>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"/>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]"/>
                      <div className="ml-1.5 flex-1 h-[7px] rounded-sm bg-[#bfdbfe] dark:bg-[#1e3a5f]"/>
                    </div>
                    <div className="p-2 flex items-center gap-2">
                      <svg width="40" height="40" viewBox="0 0 40 40" style={{ minWidth: 40 }}>
                        <circle cx="20" cy="20" r="14" fill="none" stroke="#dbeafe" strokeWidth="7"/>
                        <circle cx="20" cy="20" r="14" fill="none" stroke="#2563eb" strokeWidth="7"
                          strokeDasharray="52 36" strokeDashoffset="-4" strokeLinecap="butt"/>
                        <circle cx="20" cy="20" r="14" fill="none" stroke="#60a5fa" strokeWidth="7"
                          strokeDasharray="26 62" strokeDashoffset="-56" strokeLinecap="butt"/>
                        <circle cx="20" cy="20" r="14" fill="none" stroke="#93c5fd" strokeWidth="7"
                          strokeDasharray="10 78" strokeDashoffset="-82" strokeLinecap="butt"/>
                        <circle cx="20" cy="20" r="8" fill="white" className="dark:hidden"/>
                        <circle cx="20" cy="20" r="8" fill="#0a1929" className="hidden dark:block"/>
                      </svg>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-[5px] rounded-sm bg-[#bfdbfe] dark:bg-[#1e3a5f] w-full"/>
                        <div className="h-[5px] rounded-sm bg-[#bfdbfe] dark:bg-[#1e3a5f] w-3/4"/>
                        <div className="h-[5px] rounded-sm bg-[#dbeafe] dark:bg-[#0c1f3f] w-5/6"/>
                        <div className="h-[5px] rounded-sm bg-[#dbeafe] dark:bg-[#0c1f3f] w-2/3"/>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8V6a3 3 0 10-6 0v3h6zm-3 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
                    </svg>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Hueco + separador ── */}
            <div className="mx-4 mt-5 mb-0 border-t border-[#e7ebf3] dark:border-gray-700" />

            {/* ── Textarea de pegar extracto ── */}
            <div className="px-4 pt-4 pb-4">
              <h3 className="text-[14px] font-bold text-[#2f3a56] dark:text-gray-100 mb-0.5">
                Pega aquí tus posiciones abiertas en cartera
              </h3>
              <p className="text-[12px] text-[#65728d] dark:text-gray-400 mb-3">
                Copia y pega el extracto de posiciones desde tu broker.
                Soportamos formatos de los brokers más populares.
              </p>

              <div
                ref={importEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full min-h-[220px] rounded-lg border border-[#d9e2f1] dark:border-gray-600 px-4 py-3 text-[14px] text-[#24375d] dark:text-gray-100 outline-none overflow-auto bg-white dark:bg-gray-800 whitespace-pre-wrap"
                style={{ fontFamily: "monospace" }}
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleAutoFillFromIbkr}
                  className={btnPrimaryClass}
                >
                  Rellenar posiciones automáticamente
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (importEditorRef.current) {
                      importEditorRef.current.innerHTML = "";
                    }
                    setImportMessage("");
                    setImportError("");
                  }}
                  className={btnSecondaryClass}
                >
                  Limpiar
                </button>
              </div>

              {importMessage ? (
                <p className="mt-3 text-[12px] font-semibold text-[#39a96b]">
                  {importMessage}
                </p>
              ) : null}

              {importError ? (
                <p className="mt-3 text-[12px] font-semibold text-[#d94b62]">
                  {importError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ── Datos Generales ── */}
        <div className={`${cardClass} mb-4`}>
          <button
            type="button"
            onClick={() => setIsGeneralSectionOpen((prev) => !prev)}
            className="w-full px-4 py-3 bg-[#f5f8ff] dark:bg-gray-800 border-b border-[#e7ebf3] dark:border-gray-700 flex items-center justify-between text-left"
          >
            <h2 className={cardHeaderTitleClass}>Datos Generales</h2>
            <span className="text-[18px] font-bold text-[#5d6b85] dark:text-gray-400 leading-none">
              {isGeneralSectionOpen ? "−" : "+"}
            </span>
          </button>

          {isGeneralSectionOpen ? (
            <div className="px-4 py-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className={labelClass}>Efectivo Disponible</label>
                  <input
                    type="text"
                    name="cash"
                    value={generalData.cash}
                    onChange={handleGeneralChange}
                    placeholder="0.00"
                    className={inputLgClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Benchmark</label>
                  <BenchmarkSelect
                    value={generalData.benchmark}
                    onChange={handleBenchmarkSelect}
                    groups={benchmarkGroups}
                    className={selectLgClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Retorno Benchmark (%)</label>
                  <input
                    type="text"
                    name="benchmarkReturn"
                    value={generalData.benchmarkReturn}
                    onChange={handleGeneralChange}
                    placeholder="10.00"
                    className={inputLgClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                <div>
                  <label className={labelClass}>Moneda Base</label>
                  <select
                    name="currency"
                    value={generalData.currency}
                    onChange={handleGeneralChange}
                    className={selectLgClass}
                  >
                    {baseCurrencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Impuestos Dividendos (%)</label>
                  <input
                    type="text"
                    name="taxDividends"
                    value={generalData.taxDividends}
                    onChange={handleGeneralChange}
                    placeholder="0.00"
                    className={inputLgClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Impuestos Ganancias (%)</label>
                  <input
                    type="text"
                    name="taxGains"
                    value={generalData.taxGains}
                    onChange={handleGeneralChange}
                    placeholder="0.00"
                    className={inputLgClass}
                  />
                </div>

                <div>
                  <div className="h-[40px] rounded-lg border border-[#d9e2f1] dark:border-gray-600 bg-[#fbfcff] dark:bg-gray-800 px-3 flex items-center text-[12px] font-semibold text-[#5d6b85] dark:text-gray-400">
                    {formattedCashPreview}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveGeneralData}
                  className="h-[40px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[13px] font-bold hover:bg-[#316fda] transition-colors"
                >
                  Guardar
                </button>
              </div>

              {generalSavedMessage ? (
                <p className="mt-2 text-[12px] font-semibold text-[#39a96b]">
                  {generalSavedMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* ── Añadir Posición ── */}
        <div className={`${cardClass} mb-6`}>
          <button
            type="button"
            onClick={() => setIsAddPositionOpen((prev) => !prev)}
            className="w-full px-4 py-3 bg-[#f5f8ff] dark:bg-gray-800 border-b border-[#e7ebf3] dark:border-gray-700 flex items-center justify-between text-left"
          >
            <h2 className={cardHeaderTitleClass}>Añadir Posición</h2>
            <span className="text-[18px] font-bold text-[#5d6b85] dark:text-gray-400 leading-none">
              {isAddPositionOpen ? "−" : "+"}
            </span>
          </button>

          {isAddPositionOpen ? <div className="px-4 py-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 mb-3">
              <div>
                <label className={labelClass}>Ticker</label>
                <input
                  type="text"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handlePositionChange}
                  placeholder="AAPL"
                  className={`${inputClass} uppercase`}
                />
              </div>

              <div>
                <label className={labelClass}>Precio Actual</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handlePositionChange}
                  placeholder="180.00"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Moneda Cotización</label>
                <select
                  name="quoteCurrency"
                  value={formData.quoteCurrency}
                  onChange={handlePositionChange}
                  className={selectClass}
                >
                  {quoteCurrencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Sector</label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handlePositionChange}
                  className={selectClass}
                >
                  <option value="">Seleccionar</option>
                  {sectorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-6 gap-3 mb-3">
              <div>
                <label className={labelClass}>Tipo de Activo</label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handlePositionChange}
                  className={selectClass}
                >
                  <option value="">Seleccionar</option>
                  {assetTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Tipo de Inversión</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handlePositionChange}
                  className={selectClass}
                >
                  <option value="">Seleccionar</option>
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Cantidad / Unidades</label>
                <input
                  type="text"
                  name="shares"
                  value={formData.shares}
                  onChange={handlePositionChange}
                  placeholder="25"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Costo Promedio</label>
                <input
                  type="text"
                  name="avgCost"
                  value={formData.avgCost}
                  onChange={handlePositionChange}
                  placeholder="150.00"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Dividendo Anual</label>
                <input
                  type="text"
                  name="annualDividend"
                  value={formData.annualDividend}
                  onChange={handlePositionChange}
                  placeholder="1.20"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Ganancia Realizada</label>
                <input
                  type="text"
                  name="realizedGain"
                  value={formData.realizedGain}
                  onChange={handlePositionChange}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleAddOrUpdatePosition}
                className={btnPrimaryClass}
              >
                {editingId ? "Guardar cambios" : "Añadir"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className={btnSecondaryClass}
              >
                Limpiar
              </button>
            </div>

            {formError ? (
              <p className="mt-2 text-[12px] font-semibold text-[#d94b62]">
                {formError}
              </p>
            ) : null}

            {formWarning && !formError ? (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 px-3 py-2">
                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15" className="text-amber-500 shrink-0 mt-0.5">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
                <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  {formWarning}
                </p>
              </div>
            ) : null}
          </div> : null}
        </div>

        {/* ── Posiciones Añadidas ── */}
        <div className={cardClass}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#2f3a56] dark:text-gray-100">
                Posiciones Añadidas
              </h3>
              <div className="text-[12px] font-semibold text-[#65728d] dark:text-gray-400">
                {totalPositions} {totalPositions === 1 ? "posición" : "posiciones"}
              </div>
            </div>

            <div className="w-full rounded-[14px] border border-[#e7ebf3] dark:border-gray-700 overflow-hidden">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-[#f5f8ff] dark:bg-gray-800">
                  <tr>
                    <th className={thClass}>Ticker</th>
                    <th className={thClass}>Precio Actual</th>
                    <th className={thClass}>Moneda</th>
                    <th className={thClass}>Sector</th>
                    <th className={thClass}>Tipo Activo</th>
                    <th className={thClass}>Unidades</th>
                    <th className={thClass}>Costo Prom.</th>
                    <th className={thClass}>Div. Anual</th>
                    <th className={thClass}>Gan. Realizada</th>
                    <th className={thClass}>Gestión</th>
                  </tr>
                </thead>

                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-3 py-6 text-center text-[12px] font-medium text-[#94a3b8] dark:text-gray-500"
                      >
                        Todavía no has añadido ninguna posición.
                      </td>
                    </tr>
                  ) : (
                    positions.map((position) => (
                      <tr key={position.id} className="bg-white dark:bg-gray-900">
                        <td className={`${tdClass} font-semibold`}>
                          {position.ticker}
                        </td>
                        <td className={tdClass}>
                          {formatMoney(position.price, position.quoteCurrency)}
                        </td>
                        <td className={tdClass}>{position.quoteCurrency}</td>
                        <td className={tdClass}>{position.sector}</td>
                        <td className={tdClass}>{position.assetType || "—"}</td>
                        <td className={tdClass}>{position.shares}</td>
                        <td className={tdClass}>
                          {formatMoney(position.avgCost, position.quoteCurrency)}
                        </td>
                        <td className={tdClass}>
                          {formatMoney(position.annualDividend, position.quoteCurrency)}
                        </td>
                        <td className={tdClass}>
                          {formatMoney(position.realizedGain, generalData.currency)}
                        </td>
                        <td className={tdClass}>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditPosition(position)}
                              className="h-[28px] w-[68px] flex items-center justify-center rounded-md bg-[#3f7ee8] text-white text-[10px] font-bold hover:bg-[#316fda] transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePosition(position.id)}
                              className="h-[28px] w-[68px] flex items-center justify-center rounded-md bg-[#d94b62] text-white text-[10px] font-bold hover:bg-[#c73c53] transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioInputPage;
