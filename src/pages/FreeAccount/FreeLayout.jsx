import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Globe,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useSettings } from "@/contexts/SettingsProvider";
import FooterDisclaimer from "@/components/FooterDisclaimer";

function ThemeToggle({ compact = false }) {
  const { settings, updateSettings } = useSettings();
  const cycle = () => {
    const next = settings.theme === "light" ? "dark" : settings.theme === "dark" ? "system" : "light";
    updateSettings({ theme: next });
  };
  const Icon = settings.theme === "dark" ? Moon : settings.theme === "light" ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={cycle}
      title={`Tema: ${settings.theme}`}
      className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Cambiar tema"
    >
      <Icon size={18} />
    </button>
  );
}

export default function FreeLayout() {
  const { language } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  const [collapsed, setCollapsed] = useState(false);

  const showText = !collapsed;
  const isDashboard = pathname === "/dashboard";
  const isPortfolioInput = pathname === "/portfolio-input";
  const isAyuda = pathname === "/ayuda";
  const isAjustes = pathname === "/ajustes";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navLinkClass = (active) =>
    `w-full flex items-center gap-2 px-3 h-11 rounded-lg transition-colors ${
      collapsed ? "justify-center" : ""
    } ${
      active
        ? "bg-slate-900 dark:bg-blue-600 text-white font-medium"
        : "hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300"
    }`;

  const bottomLinkClass = (active) =>
    `w-full flex items-center gap-2 px-3 h-10 rounded-lg transition-colors ${
      collapsed ? "justify-center" : ""
    } ${
      active
        ? "bg-slate-900 dark:bg-blue-600 text-white font-medium"
        : "hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-gray-950 text-slate-900 dark:text-gray-100">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
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
              <span className="text-xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
                Portfolio Controller
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 transition-colors">
              <Globe size={16} />
              {language}
              <ChevronDown size={16} className="opacity-70" />
            </button>
            <button
              type="button"
              className="h-9 w-9 rounded-full border border-slate-200 dark:border-gray-600 bg-[#0B66C3] text-white overflow-hidden flex items-center justify-center hover:bg-[#0957a5] font-semibold text-sm"
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
          className={`fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-700 flex flex-col justify-between transition-all duration-200 ${
            collapsed ? "w-16 px-2" : "w-48 px-4"
          }`}
        >
          <div className="flex-1 flex flex-col">
            {/* NAV PRINCIPAL */}
            <nav className="space-y-2 text-sm mt-4">
              <Link to="/dashboard" className={navLinkClass(isDashboard)}>
                <LayoutDashboard size={18} />
                {showText && <span>Dashboard</span>}
              </Link>
              <Link to="/portfolio-input" className={navLinkClass(isPortfolioInput)}>
                <Pencil size={18} />
                {showText && <span>Edit Portfolio</span>}
              </Link>
            </nav>

            <div className="flex-1" />

            {/* NAV SECUNDARIO */}
            <div className="space-y-1 text-sm mb-2">
              <Link to="/ayuda" className={bottomLinkClass(isAyuda)}>
                <LifeBuoy size={18} />
                {showText && <span>Ayuda</span>}
              </Link>
              <Link to="/ajustes" className={bottomLinkClass(isAjustes)}>
                <Settings size={18} />
                {showText && <span>Ajustes</span>}
              </Link>
            </div>

            {/* CONTRAER */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } gap-2 h-9 text-sm text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 mb-2 transition-colors`}
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
          <main className="min-h-[calc(100vh-64px)] border-l border-slate-200 dark:border-gray-700 flex flex-col">
            <div className="flex-1 px-6 pt-0 pb-6">
              <Outlet />
            </div>
            <FooterDisclaimer />
          </main>
        </div>
      </div>
    </div>
  );
}
