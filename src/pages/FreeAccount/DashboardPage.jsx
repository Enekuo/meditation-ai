import React from "react";

const holdings = [
  { name: "GOOGL", value: "13.00%", top: "22%", left: "76%" },
  { name: "NKE", value: "7.37%", top: "37%", left: "87%" },
  { name: "TLT", value: "7.12%", top: "55%", left: "85%" },
  { name: "META", value: "7.12%", top: "70%", left: "76%" },
  { name: "TSN", value: "6.30%", top: "84%", left: "54%" },
  { name: "AMZN", value: "5.81%", top: "86%", left: "30%" },
  { name: "PFE", value: "4.28%", top: "74%", left: "12%" },
  { name: "CRM", value: "3.53%", top: "31%", left: "10%" },
  { name: "INTC", value: "2.54%", top: "18%", left: "18%" },
  { name: "SPN", value: "0.70%", top: "18%", left: "66%" },
];

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <div className="max-w-[1480px] mx-auto px-6 py-6">
        <div className="mb-5">
          <div className="w-12 h-[5px] rounded-full bg-blue-500 mb-3" />
          <h1 className="text-[20px] md:text-[22px] font-bold tracking-tight text-[#2f3a56] uppercase">
            Información General Del Portafolio
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_1.55fr_1.05fr] gap-4">
          {/* LEFT COLUMN */}
          <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-[0_4px_18px_rgba(31,41,55,0.04)] overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <p className="text-[15px] font-semibold text-[#3b455e] mb-2">
                Valor Actual
              </p>
              <h2 className="text-[34px] leading-none font-bold text-[#202b45]">
                $ 154,633.30
              </h2>
            </div>

            <div className="border-t border-[#edf1f7] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#66c38b] flex items-center justify-center text-white text-sm font-bold">
                  $
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#3b455e]">
                    Efectivo
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[17px] font-bold text-[#2c3651]">$34,341.41</p>
                <p className="text-[13px] font-semibold text-[#41b36d]">
                  +207.15 (+0.61%)
                </p>
              </div>
            </div>

            <div className="border-t border-[#edf1f7] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4678df] flex items-center justify-center text-white text-sm font-bold">
                  ▣
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#3b455e]">
                    Cantidad
                    <br />
                    Invertida
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[17px] font-bold text-[#2c3651]">$120,291.89</p>
                <p className="text-[13px] font-semibold text-[#41b36d]">
                  +14,135.74
                  <br />
                  (+13.32%)
                </p>
              </div>
            </div>

            <div className="border-t border-[#edf1f7] px-5 py-5">
              <div className="flex items-center gap-5">
                <div className="relative w-[178px] h-[178px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background:
                        "conic-gradient(#4d7cff 0deg 281deg, #7ecb9b 281deg 360deg)",
                    }}
                  />
                  <div className="absolute inset-[29px] rounded-full bg-white flex items-center justify-center border border-[#edf1f7]">
                    <span className="text-[44px] leading-none text-[#44b06c]">$</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-6 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#7ecb9b]" />
                      <span className="text-[15px] text-[#3a4560] font-medium">
                        Efectivo
                      </span>
                    </div>
                    <span className="text-[15px] font-semibold text-[#2f3a56]">
                      22%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-6 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#4d7cff]" />
                      <span className="text-[15px] text-[#3a4560] font-medium leading-[1.1]">
                        Cantidad
                        <br />
                        Invertida
                      </span>
                    </div>
                    <span className="text-[15px] font-semibold text-[#2f3a56]">
                      78%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#e7edf7] bg-[#eef4ff] px-4 py-2 text-center">
                <p className="text-[14px] font-bold uppercase tracking-wide text-[#35405c]">
                  Cantidad De Acciones
                </p>
                <p className="text-[42px] leading-none mt-1 font-bold text-[#3471e6]">
                  21
                </p>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-[0_4px_18px_rgba(31,41,55,0.04)] px-5 py-4">
            <h3 className="text-center text-[20px] font-bold text-[#2f3a56] mb-2">
              ACCIONES
            </h3>

            <div className="relative h-[510px] flex items-center justify-center">
              {holdings.map((item) => (
                <div
                  key={item.name}
                  className="absolute text-[12px] font-semibold text-[#48536e] whitespace-nowrap"
                  style={{ top: item.top, left: item.left, transform: "translate(-50%, -50%)" }}
                >
                  {item.name} {item.value}
                </div>
              ))}

              <div
                className="relative w-[380px] h-[380px] rounded-full"
                style={{
                  background:
                    "conic-gradient(#26457f 0deg 46deg,#4e84ff 46deg 72deg,#7aa56d 72deg 98deg,#7ab9ff 98deg 124deg,#b1965e 124deg 145deg,#8c63d8 145deg 168deg,#b98bf2 168deg 190deg,#79a96a 190deg 214deg,#295da8 214deg 238deg,#ad6230 238deg 262deg,#f3872d 262deg 286deg,#a8bfd9 286deg 306deg,#85b864 306deg 322deg,#488bb8 322deg 336deg,#f1ce4b 336deg 347deg,#6ab5ff 347deg 356deg,#d9bfd9 356deg 360deg)",
                }}
              >
                <div className="absolute inset-[110px] rounded-full bg-white border border-[#edf1f7]" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-[0_4px_18px_rgba(31,41,55,0.04)] px-4 py-4 text-center h-[146px] flex flex-col justify-center">
                <p className="text-[15px] leading-tight font-bold text-[#313b56]">
                  Dividendos
                  <br />
                  Anuales
                  <br />
                  Estimados
                </p>
                <p className="mt-3 text-[18px] font-bold text-[#24304a]">$ 2,973.40</p>
              </div>

              <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-[0_4px_18px_rgba(31,41,55,0.04)] px-4 py-4 text-center h-[146px] flex flex-col justify-center">
                <p className="text-[15px] leading-tight font-bold text-[#313b56]">
                  Yield Del
                  <br />
                  Portafolio
                </p>
                <p className="mt-4 text-[18px] font-bold text-[#43b36d]">1.86%</p>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-[0_4px_18px_rgba(31,41,55,0.04)] px-4 py-5">
              <h3 className="text-[18px] font-bold text-[#2f3a56] mb-4">
                Retorno Promedio Anual
              </h3>

              <div className="space-y-3">
                <div className="bg-[#eef4ff] rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[15px] text-[#3a4560] font-medium">Mi Retorno</span>
                  <span className="text-[15px] font-bold text-[#24304a]">18.18%</span>
                </div>

                <div className="bg-[#eef4ff] rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[15px] text-[#3a4560] font-medium">S&amp;P500</span>
                  <span className="text-[15px] font-bold text-[#24304a]">13.34%</span>
                </div>

                <div className="bg-[#eef4ff] rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[15px] text-[#3a4560] font-medium">Diferencia</span>
                  <span className="text-[15px] font-bold text-[#24304a]">4.84%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e7ebf3] rounded-2xl shadow-[0_4px_18px_rgba(31,41,55,0.04)] px-4 py-5">
              <h3 className="text-[18px] font-bold text-[#2f3a56] mb-4">
                Tipo De Inversión
              </h3>

              <div className="flex items-center gap-5">
                <div className="relative w-[170px] h-[170px] shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background:
                        "conic-gradient(#4d7cff 0deg 194deg,#72bf69 194deg 334deg,#23447d 334deg 360deg)",
                    }}
                  />
                  <div className="absolute inset-[36px] rounded-full bg-white border border-[#edf1f7]" />
                  <div className="absolute top-[18px] left-[92px] text-white text-[12px] font-bold">
                    54%
                  </div>
                  <div className="absolute bottom-[24px] left-[20px] text-white text-[12px] font-bold">
                    39%
                  </div>
                  <div className="absolute top-[20px] left-[44px] text-white text-[12px] font-bold">
                    7%
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-sm bg-[#4d7cff]" />
                    <span className="text-[15px] text-[#3a4560] font-medium">
                      Especulativa
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-sm bg-[#72bf69]" />
                    <span className="text-[15px] text-[#3a4560] font-medium">
                      Largo Plazo
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-sm bg-[#23447d]" />
                    <span className="text-[15px] text-[#3a4560] font-medium">
                      Dividendos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END RIGHT COLUMN */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;