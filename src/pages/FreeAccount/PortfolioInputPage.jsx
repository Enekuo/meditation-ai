import React, { useMemo, useState, useEffect } from "react";

const GENERAL_STORAGE_KEY = "portfolio_general_data";
const POSITIONS_STORAGE_KEY = "portfolio_positions";

const emptyGeneralData = {
  cash: "",
  benchmark: "S&P500",
  benchmarkReturn: "10",
  currency: "USD",
  taxDividends: "0",
  taxGains: "0",
};

const emptyPositionForm = {
  ticker: "",
  price: "",
  sector: "",
  type: "",
  shares: "",
  avgCost: "",
  annualDividend: "",
  realizedGain: "",
};

const benchmarkOptions = ["S&P500", "Nasdaq 100", "MSCI World", "IBEX 35"];
const currencyOptions = ["USD", "EUR"];
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
    const value = Number(generalData.cash || 0);
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
      Number(formData.price) < 0 ||
      Number(formData.shares) < 0 ||
      Number(formData.avgCost) < 0 ||
      Number(formData.annualDividend) < 0
    ) {
      return "Los valores numéricos no pueden ser negativos.";
    }

    return "";
  };

  const buildPositionObject = () => {
    return {
      id: editingId || crypto.randomUUID(),
      ticker: formData.ticker.trim().toUpperCase(),
      price: Number(formData.price),
      sector: formData.sector,
      type: formData.type,
      shares: Number(formData.shares),
      avgCost: Number(formData.avgCost),
      annualDividend: Number(formData.annualDividend),
      realizedGain: Number(formData.realizedGain),
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

  const formatMoney = (value) => {
    return `${generalData.currency} ${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <div className="max-w-[1160px] mx-auto px-4 pt-0 pb-3 -mt-12">
        <div className="mb-4">
          <div className="w-9 h-1 rounded-full bg-blue-500 mb-2" />
          <h1 className="text-[20px] leading-none font-bold text-[#24375d]">
            Portfolio Input
          </h1>
        </div>

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
                    type="number"
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
                    type="number"
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
                    {currencyOptions.map((option) => (
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
                    type="number"
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
                    type="number"
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
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 mb-3">
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
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handlePositionChange}
                  placeholder="180.00"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400"
                />
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
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-3 items-end">
              <div>
                <label className="block text-[12px] font-semibold text-[#2f3a56] mb-1.5">
                  Cantidad de Acciones
                </label>
                <input
                  type="number"
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
                  type="number"
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
                  type="number"
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
                  type="number"
                  name="realizedGain"
                  value={formData.realizedGain}
                  onChange={handlePositionChange}
                  placeholder="0.00"
                  className="w-full h-[38px] rounded-lg border border-[#d9e2f1] px-3 text-[13px] text-[#24375d] outline-none focus:border-blue-400"
                />
              </div>

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
              <table className="w-full min-w-[1020px] border-collapse">
                <thead className="bg-[#f5f8ff]">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Ticker
                    </th>
                    <th className="text-left px-3 py-2.5 text-[12px] font-bold text-[#2f3a56] border-b border-[#e7ebf3]">
                      Precio Actual
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
                        colSpan={9}
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
                          {formatMoney(position.price)}
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
                          {formatMoney(position.avgCost)}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {formatMoney(position.annualDividend)}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-[#24375d] border-b border-[#edf1f7]">
                          {formatMoney(position.realizedGain)}
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