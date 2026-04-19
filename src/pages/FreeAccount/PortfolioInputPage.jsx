import React, { useMemo, useState, useEffect, useRef } from "react";

const GENERAL_STORAGE_KEY = "portfolio_general_data";
const POSITIONS_STORAGE_KEY = "portfolio_positions";

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
  shares: "",
  avgCost: "",
  annualDividend: "",
  realizedGain: "",
};

const benchmarkOptions = ["S&P500", "Nasdaq 100", "MSCI World", "IBEX 35"];
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

const PortfolioInputPage = () => {
  const [generalData, setGeneralData] = useState(emptyGeneralData);
  const [positions, setPositions] = useState([]);
  const [formData, setFormData] = useState(emptyPositionForm);
  const [editingId, setEditingId] = useState(null);
  const [generalSavedMessage, setGeneralSavedMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isGeneralSectionOpen, setIsGeneralSectionOpen] = useState(true);
  const [isImportSectionOpen, setIsImportSectionOpen] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  const importEditorRef = useRef(null);

  useEffect(() => {
    const savedGeneral = localStorage.getItem(GENERAL_STORAGE_KEY);
    const savedPositions = localStorage.getItem(POSITIONS_STORAGE_KEY);

    if (savedGeneral) {
      try {
        setGeneralData(JSON.parse(savedGeneral));
      } catch {}
    }

    if (savedPositions) {
      try {
        setPositions(JSON.parse(savedPositions));
      } catch {}
    }
  }, []);

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

  const handleSaveGeneralData = () => {
    localStorage.setItem(GENERAL_STORAGE_KEY, JSON.stringify(generalData));
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
    setFormData(emptyPositionForm);
    setEditingId(null);
    setFormError("");
  };

  const validatePositionForm = () => {
    if (
      !formData.ticker.trim() ||
      !formData.price ||
      !formData.quoteCurrency ||
      !formData.quoteUnit ||
      !formData.sector ||
      !formData.type ||
      !formData.shares ||
      !formData.avgCost ||
      !formData.annualDividend ||
      formData.realizedGain === ""
    ) {
      return "Completa todos los campos de la posición antes de guardarla.";
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
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(nextPositions));
  };

  const handleAddOrUpdatePosition = () => {
    const validationError = validatePositionForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

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

    resetForm();
  };

  const handleEditPosition = (position) => {
    setEditingId(position.id);
    setFormData({
      ticker: position.ticker,
      price: String(position.price),
      quoteCurrency: position.quoteCurrency || "EUR",
      quoteUnit: position.quoteUnit || "NORMAL",
      sector: position.sector,
      type: position.type,
      shares: String(position.shares),
      avgCost: String(position.avgCost),
      annualDividend: String(position.annualDividend),
      realizedGain: String(position.realizedGain),
    });
    setFormError("");
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
      const avgCost = parseFlexibleNumber(parts[3]);
      const costBasis = parseFlexibleNumber(parts[4]);
      const currentPrice = parseFlexibleNumber(parts[5]);
      const marketValue = parseFlexibleNumber(parts[6]);
      const unrealizedGain = parseFlexibleNumber(parts[7]);

      imported.push({
        id: crypto.randomUUID(),
        ticker,
        price: currentPrice,
        quoteCurrency: currentCurrency,
        quoteUnit: "NORMAL",
        sector: "",
        type: "",
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

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <div className="max-w-[1280px] mx-auto px-4 pt-0 pb-3">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="w-9 h-1 rounded-full bg-blue-500 mb-2" />
            <h1 className="text-[20px] leading-none font-bold text-[#24375d]">
              Portfolio Input
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsImportSectionOpen((prev) => !prev)}
            className="h-[38px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[12px] font-bold hover:bg-[#316fda] transition-colors whitespace-nowrap"
          >
            {isImportSectionOpen ? "Ocultar importación" : "Importar desde IBKR"}
          </button>
        </div>

        {isImportSectionOpen ? (
          <div className="bg-white border border-[#e7ebf3] rounded-[16px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden mb-4">
            <div className="px-4 py-3 bg-[#f5f8ff] border-b border-[#e7ebf3]">
              <h2 className="text-[15px] font-bold text-[#2f3a56]">
                Importar cartera automáticamente
              </h2>
            </div>

            <div className="px-4 py-4">
              <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                Pega aquí tus posiciones de IBKR
              </label>

              <div
                ref={importEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full min-h-[320px] rounded-lg border border-[#d9e2f1] px-4 py-3 text-[14px] text-[#24375d] outline-none overflow-auto bg-white whitespace-pre-wrap"
                style={{ fontFamily: "monospace" }}
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleAutoFillFromIbkr}
                  className="h-[38px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[12px] font-bold hover:bg-[#316fda] transition-colors"
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
                  className="h-[38px] px-4 rounded-lg border border-[#d9e2f1] bg-white text-[#2f3a56] text-[12px] font-semibold hover:bg-[#f8fbff] transition-colors"
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

        <div className="bg-white border border-[#e7ebf3] rounded-[16px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setIsGeneralSectionOpen((prev) => !prev)}
            className="w-full px-4 py-3 bg-[#f5f8ff] border-b border-[#e7ebf3] flex items-center justify-between text-left"
          >
            <h2 className="text-[15px] font-bold text-[#2f3a56]">
              Datos Generales
            </h2>

            <span className="text-[18px] font-bold text-[#5d6b85] leading-none">
              {isGeneralSectionOpen ? "−" : "+"}
            </span>
          </button>

          {isGeneralSectionOpen ? (
            <div className="px-4 py-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                    Efectivo Disponible
                  </label>
                  <input
                    type="text"
                    name="cash"
                    value={generalData.cash}
                    onChange={handleGeneralChange}
                    placeholder="0.00"
                    className="w-full h-[40px] rounded-lg border border-[#d9e2f1] px-3 text-[14px] text-[#24375d] outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                    Benchmark
                  </label>
                  <select
                    name="benchmark"
                    value={generalData.benchmark}
                    onChange={handleGeneralChange}
                    className="w-full h-[40px] rounded-lg border border-[#d9e2f1] px-3 text-[14px] text-[#24375d] outline-none focus:border-blue-400 bg-white"
                  >
                    {benchmarkOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                    Retorno Benchmark (%)
                  </label>
                  <input
                    type="text"
                    name="benchmarkReturn"
                    value={generalData.benchmarkReturn}
                    onChange={handleGeneralChange}
                    placeholder="10.00"
                    className="w-full h-[40px] rounded-lg border border-[#d9e2f1] px-3 text-[14px] text-[#24375d] outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                <div>
                  <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                    Moneda Base
                  </label>
                  <select
                    name="currency"
                    value={generalData.currency}
                    onChange={handleGeneralChange}
                    className="w-full h-[40px] rounded-lg border border-[#d9e2f1] px-3 text-[14px] text-[#24375d] outline-none focus:border-blue-400 bg-white"
                  >
                    {baseCurrencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                    Impuestos Dividendos (%)
                  </label>
                  <input
                    type="text"
                    name="taxDividends"
                    value={generalData.taxDividends}
                    onChange={handleGeneralChange}
                    placeholder="0.00"
                    className="w-full h-[40px] rounded-lg border border-[#d9e2f1] px-3 text-[14px] text-[#24375d] outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                    Impuestos Ganancias (%)
                  </label>
                  <input
                    type="text"
                    name="taxGains"
                    value={generalData.taxGains}
                    onChange={handleGeneralChange}
                    placeholder="0.00"
                    className="w-full h-[40px] rounded-lg border border-[#d9e2f1] px-3 text-[14px] text-[#24375d] outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <div className="h-[40px] rounded-lg border border-[#d9e2f1] bg-[#fbfcff] px-3 flex items-center text-[12px] font-semibold text-[#5d6b85]">
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

        <div className="bg-white border border-[#e7ebf3] rounded-[16px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden mb-6">
          <div className="px-4 py-3 bg-[#f5f8ff] border-b border-[#e7ebf3]">
            <h2 className="text-[15px] font-bold text-[#2f3a56]">
              Añadir Posición
            </h2>
          </div>

          <div className="px-4 py-4">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 mb-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Ticker
                </label>
                <input
                  type="text"
                  name="ticker"
                  value={formData.ticker}
                  onChange={handlePositionChange}
                  placeholder="AAPL"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400 uppercase"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Precio Actual
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handlePositionChange}
                  placeholder="180.00"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Moneda Cotización
                </label>
                <select
                  name="quoteCurrency"
                  value={formData.quoteCurrency}
                  onChange={handlePositionChange}
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400 bg-white"
                >
                  {quoteCurrencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  name="quoteUnit"
                  value={formData.quoteUnit}
                  onChange={handlePositionChange}
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400 bg-white"
                >
                  {quoteUnitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Sector
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handlePositionChange}
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400 bg-white"
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

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 mb-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Tipo de Inversión
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handlePositionChange}
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400 bg-white"
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
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Cantidad de Acciones
                </label>
                <input
                  type="text"
                  name="shares"
                  value={formData.shares}
                  onChange={handlePositionChange}
                  placeholder="25"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Costo Promedio
                </label>
                <input
                  type="text"
                  name="avgCost"
                  value={formData.avgCost}
                  onChange={handlePositionChange}
                  placeholder="150.00"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Dividendo Anual
                </label>
                <input
                  type="text"
                  name="annualDividend"
                  value={formData.annualDividend}
                  onChange={handlePositionChange}
                  placeholder="1.20"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Ganancia Realizada
                </label>
                <input
                  type="text"
                  name="realizedGain"
                  value={formData.realizedGain}
                  onChange={handlePositionChange}
                  placeholder="0.00"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleAddOrUpdatePosition}
                className="h-[38px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[12px] font-bold hover:bg-[#316fda] transition-colors"
              >
                {editingId ? "Guardar cambios" : "Añadir"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="h-[38px] px-4 rounded-lg border border-[#d9e2f1] bg-white text-[#2f3a56] text-[12px] font-semibold hover:bg-[#f8fbff] transition-colors"
              >
                Limpiar
              </button>
            </div>

            {formError ? (
              <p className="mt-2 text-[12px] font-semibold text-[#d94b62]">
                {formError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="bg-white border border-[#e7ebf3] rounded-[16px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#2f3a56]">
                Posiciones Añadidas
              </h3>

              <div className="text-[12px] font-semibold text-[#65728d]">
                {totalPositions} {totalPositions === 1 ? "posición" : "posiciones"}
              </div>
            </div>

<div className="w-full rounded-[14px] border border-[#e7ebf3] overflow-hidden">
  <table className="w-full table-fixed border-collapse">
                <thead className="bg-[#f5f8ff]">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Ticker
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Precio Actual
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Moneda
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Sector
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Tipo
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Acciones
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Costo Prom.
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Div. Anual
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Gan. Realizada
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Gestión
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-3 py-6 text-center text-[12px] font-medium text-[#94a3b8]"
                      >
                        Todavía no has añadido ninguna posición.
                      </td>
                    </tr>
                  ) : (
                    positions.map((position) => (
                      <tr key={position.id} className="bg-white">
                        <td className="px-3 py-2.5 text-[12px] font-semibold text-[#24375d] border-b border-[#edf1f7]">
                          {position.ticker}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {formatMoney(position.price, position.quoteCurrency)}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {position.quoteCurrency}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {position.sector}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {position.type}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {position.shares}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {formatMoney(position.avgCost, position.quoteCurrency)}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {formatMoney(position.annualDividend, position.quoteCurrency)}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {formatMoney(position.realizedGain, generalData.currency)}
                        </td>
                        <td className="px-3 py-2.5 border-b border-[#edf1f7]">
  <div className="flex items-center gap-1.5">
    <button
      type="button"
      onClick={() => handleEditPosition(position)}
      className="h-[28px] px-2.5 rounded-md bg-[#3f7ee8] text-white text-[10px] font-bold hover:bg-[#316fda] transition-colors"
    >
      Editar
    </button>

    <button
      type="button"
      onClick={() => handleDeletePosition(position.id)}
      className="h-[28px] px-2.5 rounded-md bg-[#d94b62] text-white text-[10px] font-bold hover:bg-[#c73c53] transition-colors"
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