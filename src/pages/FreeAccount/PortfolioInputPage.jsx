import React, { useMemo, useState, useEffect } from "react";

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
  const [importText, setImportText] = useState("");
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const [importError, setImportError] = useState("");
  const [importSuccessMessage, setImportSuccessMessage] = useState("");

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
    return {
      id: editingId || crypto.randomUUID(),
      ticker: formData.ticker.trim().toUpperCase(),
      price: Number(String(formData.price).replace(",", ".")),
      quoteCurrency: formData.quoteCurrency,
      quoteUnit: formData.quoteUnit,
      sector: formData.sector,
      type: formData.type,
      shares: Number(String(formData.shares).replace(",", ".")),
      avgCost: Number(String(formData.avgCost).replace(",", ".")),
      annualDividend: Number(String(formData.annualDividend).replace(",", ".")),
      realizedGain: Number(String(formData.realizedGain).replace(",", ".")),
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

  const parseLocaleNumber = (value) => {
    if (value === null || value === undefined) return null;

    const cleaned = String(value)
      .replace(/\s+/g, "")
      .replace(/%/g, "")
      .replace(/\u00A0/g, "")
      .trim();

    if (!cleaned) return null;

    const normalized = cleaned.includes(",")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const isTickerLine = (line) => {
    return /^[A-Z0-9.\-]{1,12}$/.test(line.trim());
  };

  const mapIbkrCurrency = (rawCurrency) => {
    const normalized = String(rawCurrency || "").trim().toUpperCase();

    if (normalized === "GBP" || normalized === "GBX" || normalized === "GBP.") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP ") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP\t") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP\n") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP\r") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP\r\n") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP.") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP,") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP;") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP:") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP-") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP/") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP_") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP+") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP=") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP*") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP?") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP!") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GBP)") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "(GBP") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "[GBP]") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "{GBP}") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === '"GBP"') {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "'GBP'") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "`GBP`") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GB P") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GB-P") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBP" || normalized === "GB/P") {
      return { quoteCurrency: "GBP", quoteUnit: "NORMAL" };
    }

    if (normalized === "GBp".toUpperCase()) {
      return { quoteCurrency: "GBP", quoteUnit: "GBX" };
    }

    return {
      quoteCurrency: quoteCurrencyOptions.includes(normalized) ? normalized : "EUR",
      quoteUnit: "NORMAL",
    };
  };

  const parseIbkrBlocks = (rawText) => {
    const cleanedLines = String(rawText || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/\t/g, " ").trim())
      .filter(Boolean)
      .filter(
        (line) =>
          !line.includes("Instrumento") &&
          !line.includes("Posición") &&
          !line.includes("Último") &&
          !line.includes("% variación") &&
          !line.includes("Base de coste") &&
          !line.includes("Valor de mercado") &&
          !line.includes("Precio medio") &&
          !line.includes("PyG diarias") &&
          !line.includes("PyG no realizadas")
      );

    const blocks = [];
    let currentBlock = [];

    for (let i = 0; i < cleanedLines.length; i += 1) {
      const line = cleanedLines[i];

      if (isTickerLine(line)) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
        }
        currentBlock = [line];
      } else if (currentBlock.length > 0) {
        currentBlock.push(line);
      }
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    return blocks;
  };

  const extractPreviewRowFromBlock = (block) => {
    if (!Array.isArray(block) || block.length < 4) return null;

    const ticker = block[0]?.trim()?.toUpperCase() || "";
    const companyName = block[1]?.trim() || "";

    const metricsLine = block[2] || "";
    const metricsTokens = metricsLine.split(/\s+/).filter(Boolean);

    const shares = parseLocaleNumber(metricsTokens[0]);
    const avgCost = parseLocaleNumber(metricsTokens[1]);
    const marketValue = parseLocaleNumber(metricsTokens[metricsTokens.length - 1]);

    let rawCurrency = "";
    let currentPrice = null;
    let unrealizedGain = 0;

    for (let i = 3; i < block.length; i += 1) {
      const currentLine = block[i];
      const nextLine = block[i + 1];

      if (/^[A-Za-z]{3,4}$/.test(currentLine) && rawCurrency === "") {
        rawCurrency = currentLine;
      }

      if (/^[A-Za-z]{3,4}$/.test(currentLine) && currentPrice === null) {
        const maybePrice = parseLocaleNumber(nextLine);
        if (maybePrice !== null && maybePrice > 0) {
          currentPrice = maybePrice;
          i += 1;
          continue;
        }
      }

      if (/^[+-]/.test(currentLine)) {
        const maybeGain = parseLocaleNumber(currentLine);
        if (maybeGain !== null) {
          unrealizedGain = maybeGain;
        }
      }
    }

    const currencyInfo = mapIbkrCurrency(rawCurrency);

    if (!ticker || shares === null || currentPrice === null) {
      return null;
    }

    return {
      id: crypto.randomUUID(),
      ticker,
      companyName,
      shares,
      avgCost: avgCost ?? 0,
      price: currentPrice,
      marketValue: marketValue ?? shares * currentPrice,
      quoteCurrency: currencyInfo.quoteCurrency,
      quoteUnit: currencyInfo.quoteUnit,
      sector: "",
      type: "",
      annualDividend: 0,
      realizedGain: 0,
      unrealizedGain: unrealizedGain ?? 0,
    };
  };

  const handleProcessImport = () => {
    setImportError("");
    setImportSuccessMessage("");
    setImportPreviewRows([]);

    if (!importText.trim()) {
      setImportError("Pega primero el contenido copiado desde IBKR.");
      return;
    }

    const blocks = parseIbkrBlocks(importText);
    const parsedRows = blocks
      .map((block) => extractPreviewRowFromBlock(block))
      .filter(Boolean);

    if (parsedRows.length === 0) {
      setImportError("No se han podido detectar posiciones válidas con ese formato.");
      return;
    }

    setImportPreviewRows(parsedRows);
  };

  const handleImportPreviewRows = () => {
    if (importPreviewRows.length === 0) {
      setImportError("Primero procesa el texto para generar la vista previa.");
      return;
    }

    const importedPositions = importPreviewRows.map((row) => ({
      id: crypto.randomUUID(),
      ticker: row.ticker,
      price: row.price,
      quoteCurrency: row.quoteCurrency,
      quoteUnit: row.quoteUnit,
      sector: row.sector,
      type: row.type,
      shares: row.shares,
      avgCost: row.avgCost,
      annualDividend: row.annualDividend,
      realizedGain: row.realizedGain,
    }));

    const updated = [...positions, ...importedPositions];
    persistPositions(updated);

    setImportSuccessMessage(
      `${importedPositions.length} ${
        importedPositions.length === 1 ? "posición importada" : "posiciones importadas"
      } correctamente.`
    );
    setImportPreviewRows([]);
    setImportText("");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <div className="max-w-[1280px] mx-auto px-4 pt-0 pb-3 -mt-12">
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

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Pega aquí las posiciones copiadas desde IBKR..."
                wrap="off"
                spellCheck={false}
                className="w-full h-[260px] rounded-lg border border-[#d9e2f1] px-3 py-3 text-[12px] text-[#24375d] outline-none focus:border-blue-400 resize-y overflow-x-auto overflow-y-auto font-mono leading-6 bg-white"
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="h-[38px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[12px] font-bold hover:bg-[#316fda] transition-colors"
                >
                  Procesar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImportText("");
                    setImportPreviewRows([]);
                    setImportError("");
                    setImportSuccessMessage("");
                  }}
                  className="h-[38px] px-4 rounded-lg border border-[#d9e2f1] bg-white text-[#2f3a56] text-[12px] font-semibold hover:bg-[#f8fbff] transition-colors"
                >
                  Limpiar
                </button>
              </div>

              {importError ? (
                <p className="mt-3 text-[12px] font-semibold text-[#d94b62]">
                  {importError}
                </p>
              ) : null}

              {importSuccessMessage ? (
                <p className="mt-3 text-[12px] font-semibold text-[#39a96b]">
                  {importSuccessMessage}
                </p>
              ) : null}

              {importPreviewRows.length > 0 ? (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-bold text-[#2f3a56]">
                      Vista previa
                    </h3>

                    <div className="text-[12px] font-semibold text-[#65728d]">
                      {importPreviewRows.length}{" "}
                      {importPreviewRows.length === 1 ? "posición detectada" : "posiciones detectadas"}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-[14px] border border-[#e7ebf3]">
                    <table className="w-full min-w-[1100px] border-collapse">
                      <thead className="bg-[#f5f8ff]">
                        <tr>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Ticker
                          </th>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Empresa
                          </th>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Acciones
                          </th>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Precio Actual
                          </th>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Costo Prom.
                          </th>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Valor Mercado
                          </th>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Moneda
                          </th>
                          <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                            Unidad
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {importPreviewRows.map((row) => (
                          <tr key={row.id} className="bg-white">
                            <td className="px-3 py-2.5 text-[12px] font-semibold text-[#24375d] border-b border-[#edf1f7]">
                              {row.ticker}
                            </td>
                            <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                              {row.companyName}
                            </td>
                            <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                              {row.shares}
                            </td>
                            <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                              {formatMoney(row.price, row.quoteCurrency)}
                            </td>
                            <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                              {formatMoney(row.avgCost, row.quoteCurrency)}
                            </td>
                            <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                              {formatMoney(row.marketValue, row.quoteCurrency)}
                            </td>
                            <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                              {row.quoteCurrency}
                            </td>
                            <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                              {row.quoteUnit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      type="button"
                      onClick={handleImportPreviewRows}
                      className="h-[38px] px-4 rounded-lg bg-[#3f7ee8] text-white text-[12px] font-bold hover:bg-[#316fda] transition-colors"
                    >
                      Importar posiciones
                    </button>
                  </div>
                </div>
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
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Unidad
                </label>
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

            <div className="overflow-x-auto rounded-[14px] border border-[#e7ebf3]">
              <table className="w-full min-w-[1300px] border-collapse">
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
                      Unidad
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
                      Acciones
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
                          {position.quoteUnit}
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
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditPosition(position)}
                              className="h-[30px] px-3 rounded-md bg-[#3f7ee8] text-white text-[11px] font-bold hover:bg-[#316fda] transition-colors"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePosition(position.id)}
                              className="h-[30px] px-3 rounded-md bg-[#d94b62] text-white text-[11px] font-bold hover:bg-[#c73c53] transition-colors"
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