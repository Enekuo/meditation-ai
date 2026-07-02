import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ExpandModal({ title, onClose, children, maxWidth = "max-w-5xl", noPadding = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl bg-white dark:bg-gray-900 border border-[#e7ebf3] dark:border-gray-700 shadow-2xl flex flex-col max-h-[90vh]`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f3fa] dark:border-gray-700/60 shrink-0">
          <h2 className="text-[17px] font-bold text-[#2f3a56] dark:text-gray-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[#9ca3af] hover:text-[#374151] dark:hover:text-gray-200 hover:bg-[#f3f4f6] dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto min-h-0 ${noPadding ? "" : "px-6 py-5"}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
