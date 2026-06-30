import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PremiumModal({ open, positionCount, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 rounded-2xl shadow-2xl px-8 py-8 text-center">
        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Corona */}
        <div className="text-5xl mb-5 select-none">👑</div>

        {/* Título */}
        <h2 className="text-[22px] font-bold text-[#2f3a56] dark:text-gray-100 mb-3">
          ¡Atención!
        </h2>

        {/* Cuerpo */}
        <p className="text-[14px] text-[#51607f] dark:text-gray-400 leading-relaxed mb-2">
          El límite de acciones en cartera es de 30. Actualmente tienes{" "}
          <span className="font-bold text-[#2f3a56] dark:text-gray-100">{positionCount}</span>{" "}
          acciones.
        </p>

        {/* Subtítulo */}
        <p className="text-[13px] text-[#51607f] dark:text-gray-500 mb-5">
          Hazte premium para tener un número ilimitado de acciones.
        </p>

        {/* CTA principal — TODO: crear página /premium y reemplazar navigate("/ajustes") */}
        <button
          type="button"
          onClick={() => { navigate("/ajustes"); onClose(); }}
          className="w-full h-10 rounded-xl bg-gradient-to-r from-[#2a78d6] to-[#4a3aa7] hover:from-[#1a5299] hover:to-[#2f1f8a] text-white text-[14px] font-semibold transition-all mb-2"
        >
          Empieza premium
        </button>

        {/* CTA secundario */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 rounded-xl border border-[#d9e2f1] dark:border-gray-700 bg-transparent text-[13px] font-medium text-[#51607f] dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
        >
          Seguir usando gratis
        </button>
      </div>
    </div>
  );
}
