import React, { useState } from "react";
import {
  LayoutDashboard,
  Lightbulb,
  LifeBuoy,
  Settings,
  Globe,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function FreeLayout() {
  const { language } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  const [collapsed, setCollapsed] = useState(false);

  const showText = !collapsed;
  const isDashboard = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex">
      {/* LOGO FIJO */}
      <div
        className="fixed top-0 left-0 h-16 bg-white flex items-center z-[60]"
        style={{ width: collapsed ? 64 : 192 }}
      >
        <div className="flex items-center px-4 pl-16">
          <span
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            className="font-bold tracking-tight text-[22px] whitespace-nowrap text-slate-900"
          >
            Portfolio Controller
          </span>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen
          bg-white flex flex-col pt-16 pb-2
          transition-[width] duration-200
          overflow-visible
          ${collapsed ? "w-16 px-2" : "w-48 px-4"}
        `}
      >
        <div className="flex-1 flex flex-col">
          {/* BLOQUE SUPERIOR */}
          <nav className="space-y-1 text-sm mt-4">
            <Link
              to="/dashboard"
              className={`
                w-full flex items-center gap-2 px-3 h-11 rounded-lg
                ${collapsed ? "justify-center" : ""}
                ${
                  isDashboard
                    ? "bg-slate-900 text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }
              `}
            >
              <LayoutDashboard size={18} />
              {showText && <span>Dashboard</span>}
            </Link>
          </nav>

          <div className="flex-1" />

          {/* BLOQUE INFERIOR */}
          <div className="space-y-1 text-sm mb-2">
            <button
              className={`
                w-full flex items-center gap-2 px-3 h-10 rounded-lg
                ${collapsed ? "justify-center" : ""}
                hover:bg-slate-100 text-slate-700
              `}
            >
              <Lightbulb size={18} />
              {showText && <span>Sugerencias</span>}
            </button>

            <button
              className={`
                w-full flex items-center gap-2 px-3 h-10 rounded-lg
                ${collapsed ? "justify-center" : ""}
                hover:bg-slate-100 text-slate-700
              `}
            >
              <LifeBuoy size={18} />
              {showText && <span>Ayuda</span>}
            </button>

            <button
              className={`
                w-full flex items-center gap-2 px-3 h-10 rounded-lg
                ${collapsed ? "justify-center" : ""}
                hover:bg-slate-100 text-slate-700
              `}
            >
              <Settings size={18} />
              {showText && <span>Ajustes</span>}
            </button>
          </div>

          {/* CONTRAER */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`
              w-full flex items-center
              ${collapsed ? "justify-center" : "justify-start"}
              gap-2 h-9 text-sm text-slate-500 hover:text-slate-700
            `}
          >
            {collapsed ? (
              <ChevronsRight size={18} />
            ) : (
              <>
                <ChevronsLeft size={18} />
                <span>Contraer</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* COLUMNA DERECHA */}
      <div
        className={`flex-1 flex flex-col transition-all ${
          collapsed ? "ml-16" : "ml-48"
        }`}
      >
        {/* HEADER */}
        <header
          className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-200 fixed top-0 right-0 z-40"
          style={{ left: collapsed ? 64 : 192 }}
        >
          <div className="w-[180px]" />

          <div className="flex-1 min-w-0 flex items-center justify-center px-4" />

          <div className="flex items-center gap-3">
            <button
              className="
                h-9 px-3 rounded-full border border-slate-200 bg-white
                flex items-center gap-1.5 text-sm font-medium text-slate-700
                hover:bg-slate-50
              "
            >
              <Globe size={16} />
              <span>{language}</span>
              <ChevronDown size={14} className="opacity-70" />
            </button>

            <button
              type="button"
              className="h-9 w-9 rounded-full border border-slate-200 bg-[#0B66C3] text-white overflow-hidden flex items-center justify-center hover:bg-[#0957a5] font-semibold text-sm"
              aria-label="Cuenta"
              title="Cuenta"
            >
              E
            </button>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 mt-16 py-8 border-l border-slate-200">
          <div className="px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}