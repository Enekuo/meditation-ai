import React from "react";

const DashboardPage = () => {
  const hasPositions = false;

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <div className="max-w-[1480px] mx-auto px-6 py-5">
        <div className="mb-4">
          <div className="w-11 h-1 rounded-full bg-blue-500 mb-2" />
          <h1 className="text-[18px] md:text-[19px] font-bold tracking-tight text-[#2f3a56] uppercase">
            Información General Del Portafolio
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.98fr_1.62fr_0.78fr] gap-4">
          {/* LEFT COLUMN */}
          <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <p className="text-[13px] font-semibold text-[#3b455e] mb-2">
                Valor Actual
              </p>
              <h2 className="text-[28px] leading-none font-bold text-[#202b45]">
                $ 0.00
              </h2>
            </div>

            <div className="border-t border-[#edf1f7] px-4 py-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#66c38b] flex items-center justify-center text-white text-sm font-bold">
                  $
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#3b455e]">
                    Efectivo
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#2c3651]">$0.00</p>
                <p className="text-[11px] font-semibold text-[#94a3b8]">
                  0.00 (0.00%)
                </p>
              </div>
            </div>

            <div className="border-t border-[#edf1f7] px-4 py-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4678df] flex items-center justify-center text-white text-xs font-bold">
                  ▣
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#3b455e] leading-[1.15]">
                    Cantidad
                    <br />
                    Invertida
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-bold text-[#2c3651]">$0.00</p>
                <p className="text-[11px] font-semibold text-[#94a3b8] leading-[1.2]">
                  0.00
                  <br />
                  (0.00%)
                </p>
              </div>
            </div>

            <div className="border-t border-[#edf1f7] px-4 py-4">
              <div className="flex items-center gap-4">
                <div className="relative w-[128px] h-[128px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: "conic-gradient(#e2e8f0 0deg 360deg)",
                    }}
                  />
                  <div className="absolute inset-[22px] rounded-full bg-white flex items-center justify-center border border-[#edf1f7]">
                    <span className="text-[34px] leading-none text-[#94a3b8]">$</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#cbd5e1]" />
                      <span className="text-[13px] text-[#3a4560] font-medium">
                        Efectivo
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#2f3a56]">
                      0%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#cbd5e1]" />
                      <span className="text-[13px] text-[#3a4560] font-medium leading-[1.1]">
                        Cantidad
                        <br />
                        Invertida
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[#2f3a56]">
                      0%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-[#e7edf7] bg-[#eef4ff] px-4 py-2 text-center">
                <p className="text-[12px] font-bold uppercase tracking-wide text-[#35405c]">
                  Cantidad De Acciones
                </p>
                <p className="text-[30px] leading-none mt-1 font-bold text-[#3471e6]">
                  0
                </p>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-3 flex flex-col">
            <h3 className="text-center text-[16px] font-bold text-[#2f3a56] pt-1">
              ACCIONES
            </h3>

            <div className="flex-1 flex items-center justify-center">
              {hasPositions ? (
                <div
                  className="relative w-[250px] h-[250px] rounded-full"
                  style={{
                    background:
                      "conic-gradient(#26457f 0deg 46deg,#4e84ff 46deg 72deg,#7aa56d 72deg 98deg,#7ab9ff 98deg 124deg,#b1965e 124deg 145deg,#8c63d8 145deg 168deg,#b98bf2 168deg 190deg,#79a96a 190deg 214deg,#295da8 214deg 238deg,#ad6230 238deg 262deg,#f3872d 262deg 286deg,#a8bfd9 286deg 306deg,#85b864 306deg 322deg,#488bb8 322deg 336deg,#f1ce4b 336deg 347deg,#6ab5ff 347deg 356deg,#d9bfd9 356deg 360deg)",
                  }}
                >
                  <div className="absolute inset-[67px] rounded-full bg-white border border-[#edf1f7]" />
                </div>
              ) : (
                <div className="relative w-[250px] h-[250px] rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center">
                  <div className="absolute inset-[67px] rounded-full bg-white border border-[#e2e8f0]" />
                  <span className="absolute text-[14px] font-semibold text-[#94a3b8]">
                    Sin datos
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-3 py-3 text-center h-[98px] flex flex-col justify-center">
                <p className="text-[12px] leading-tight font-bold text-[#313b56]">
                  Dividendos
                  <br />
                  Anuales
                  <br />
                  Estimados
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#24304a]">$ 0.00</p>
              </div>

              <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-3 py-3 text-center h-[98px] flex flex-col justify-center">
                <p className="text-[12px] leading-tight font-bold text-[#313b56]">
                  Yield Del
                  <br />
                  Portafolio
                </p>
                <p className="mt-2 text-[14px] font-bold text-[#94a3b8]">0.00%</p>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3">
                Retorno Promedio Anual
              </h3>

              <div className="space-y-2">
                <div className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-[13px] text-[#3a4560] font-medium">Mi Retorno</span>
                  <span className="text-[13px] font-bold text-[#24304a]">0.00%</span>
                </div>

                <div className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-[13px] text-[#3a4560] font-medium">S&amp;P500</span>
                  <span className="text-[13px] font-bold text-[#24304a]">0.00%</span>
                </div>

                <div className="bg-[#eef4ff] rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-[13px] text-[#3a4560] font-medium">Diferencia</span>
                  <span className="text-[13px] font-bold text-[#24304a]">0.00%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3">
                Tipo De Inversión
              </h3>

              <div className="flex items-center gap-4">
                <div className="relative w-[112px] h-[112px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: "conic-gradient(#e2e8f0 0deg 360deg)",
                    }}
                  />
                  <div className="absolute inset-[24px] rounded-full bg-white border border-[#edf1f7]" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#cbd5e1]" />
                    <span className="text-[13px] text-[#3a4560] font-medium">
                      Especulativa
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#cbd5e1]" />
                    <span className="text-[13px] text-[#3a4560] font-medium">
                      Largo Plazo
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#cbd5e1]" />
                    <span className="text-[13px] text-[#3a4560] font-medium">
                      Dividendos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END RIGHT COLUMN */}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.72fr_1.28fr] gap-4 mt-4">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-4">
            {/* GANANCIA / PÉRDIDA */}
            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3">
                Ganancia/Pérdida
              </h3>

              <div className="overflow-hidden rounded-xl border border-[#edf1f7]">
                <div className="grid grid-cols-[1fr_auto] bg-[#f4f8fb] border-b border-[#edf1f7]">
                  <div className="px-3 py-2 text-[13px] text-[#3a4560] font-medium">
                    Ganancia/Pérdida (sin realizar)
                  </div>
                  <div className="px-3 py-2 text-[13px] font-bold text-[#4aa56d]">
                    $ 0.00
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] bg-[#f4f8fb] border-b border-[#edf1f7]">
                  <div className="px-3 py-2 text-[13px] text-[#3a4560] font-medium">
                    Ganancia/Pérdida (realizada)
                  </div>
                  <div className="px-3 py-2 text-[13px] font-bold text-[#4aa56d]">
                    $ 0.00
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] bg-[#f4f8fb]">
                  <div className="px-3 py-2 text-[13px] text-[#3a4560] font-medium">
                    Ganancia/Pérdida (TOTAL)
                  </div>
                  <div className="px-3 py-2 text-[13px] font-bold text-[#4aa56d]">
                    $ 0.00
                  </div>
                </div>
              </div>
            </div>

            {/* SECTORES PEQUEÑO */}
            <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
              <h3 className="text-[15px] font-bold text-[#2f3a56] mb-3">
                Sectores
              </h3>

              <div className="flex items-center justify-center min-h-[160px]">
                <div className="relative w-[118px] h-[118px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: "conic-gradient(#e2e8f0 0deg 360deg)",
                    }}
                  />
                  <div className="absolute inset-[25px] rounded-full bg-white border border-[#edf1f7] flex items-center justify-center">
                    <span className="text-[12px] font-semibold text-[#94a3b8]">
                      0%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white border border-[#e7ebf3] rounded-[18px] shadow-[0_4px_16px_rgba(31,41,55,0.04)] px-4 py-4">
            <h3 className="text-[15px] font-bold text-[#2f3a56] mb-4">
              Historial Del Portafolio
            </h3>

            <div className="h-[260px] rounded-xl bg-[#fbfcff] border border-[#edf1f7] px-4 py-4">
              <div className="w-full h-full relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-[#eef2f7]" />
                  <div className="border-t border-[#eef2f7]" />
                  <div className="border-t border-[#eef2f7]" />
                  <div className="border-t border-[#eef2f7]" />
                  <div className="border-t border-[#eef2f7]" />
                </div>

                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] text-[#7c89a3]">
                  <span>$0</span>
                  <span>$0</span>
                  <span>$0</span>
                  <span>$0</span>
                  <span>$0</span>
                </div>

                <div className="absolute left-[52px] right-0 top-0 bottom-0 flex items-center justify-center">
                  <span className="text-[13px] font-medium text-[#94a3b8]">
                    Sin historial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;