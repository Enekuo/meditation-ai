import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Lightbulb,
  LifeBuoy,
  Settings,
  Globe,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
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
  const isPortfolioInput = pathname === "/portfolio-input";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900">
      {/* HEADER SUPERIOR */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center gap-0 mr-8 -ml-16"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <img
                src="/logo-icon.png"
                alt="Portfolio Controller logo"
                className="w-16 h-16 object-contain shrink-0"
              />
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Portfolio Controller
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              <Globe size={16} />
              {language}
              <ChevronDown size={16} className="opacity-70" />
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
        </div>
      </header>

      {/* CUERPO */}
      <div className="flex pt-16">
        {/* SIDEBAR */}
        <aside
          className={`fixed left-0 top-16 bottom-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 ${
            collapsed ? "w-16 px-2" : "w-48 px-4"
          }`}
        >
          <div className="flex-1 flex flex-col">
            {/* ARRIBA */}
            <nav className="space-y-2 text-sm mt-4">
              <Link
                to="/dashboard"
                className={`w-full flex items-center gap-2 px-3 h-11 rounded-lg ${
                  collapsed ? "justify-center" : ""
                } ${
                  isDashboard
                    ? "bg-slate-900 text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <LayoutDashboard size={18} />
                {showText && <span>Dashboard</span>}
              </Link>

              <Link
                to="/portfolio-input"
                className={`w-full flex items-center gap-2 px-3 h-11 rounded-lg ${
                  collapsed ? "justify-center" : ""
                } ${
                  isPortfolioInput
                    ? "bg-slate-900 text-white font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <Pencil size={18} />
                {showText && <span>Edit Portfolio</span>}
              </Link>
            </nav>

            <div className="flex-1" />

            {/* ABAJO */}
            <div className="space-y-1 text-sm mb-2">
              <button
                className={`w-full flex items-center gap-2 px-3 h-10 rounded-lg ${
                  collapsed ? "justify-center" : ""
                } hover:bg-slate-100 text-slate-700`}
              >
                <Lightbulb size={18} />
                {showText && <span>Sugerencias</span>}
              </button>

              <button
                className={`w-full flex items-center gap-2 px-3 h-10 rounded-lg ${
                  collapsed ? "justify-center" : ""
                } hover:bg-slate-100 text-slate-700`}
              >
                <LifeBuoy size={18} />
                {showText && <span>Ayuda</span>}
              </button>

              <button
                className={`w-full flex items-center gap-2 px-3 h-10 rounded-lg ${
                  collapsed ? "justify-center" : ""
                } hover:bg-slate-100 text-slate-700`}
              >
                <Settings size={18} />
                {showText && <span>Ajustes</span>}
              </button>
            </div>

            {/* CONTRAER */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } gap-2 h-9 text-sm text-slate-500 hover:text-slate-700 mb-2`}
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

        {/* CONTENIDO */}
        <div
          className={`flex-1 transition-all duration-200 ${
            collapsed ? "ml-16" : "ml-48"
          }`}
        >
          <main className="min-h-[calc(100vh-64px)] border-l border-slate-200">
            <div className="px-6 pt-0 pb-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}