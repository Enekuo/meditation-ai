import React, { useEffect, useRef, useState } from "react";
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
  LogOut,
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useSettings } from "@/contexts/SettingsProvider";
import { useAuth } from "@/contexts/AuthProvider";
import FooterDisclaimer from "@/components/FooterDisclaimer";

function ThemeToggle() {
  const { settings, updateSettings } = useSettings();
  const cycle = () => {
    const next =
      settings.theme === "light" ? "dark" : settings.theme === "dark" ? "system" : "light";
    updateSettings({ theme: next });
  };
  const Icon =
    settings.theme === "dark" ? Moon : settings.theme === "light" ? Sun : Monitor;
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

function AvatarDropdown() {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-9 rounded-full border border-slate-200 dark:border-gray-600 bg-[#0B66C3] text-white overflow-hidden flex items-center justify-center hover:bg-[#0957a5] font-semibold text-sm shrink-0"
        aria-label="Cuenta"
        title={user ? (user.displayName || "Cuenta") : "Invitado"}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "avatar"}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-700">
                <p className="text-[13px] font-semibold text-[#2f3a56] dark:text-gray-100 truncate">
                  {user.displayName}
                </p>
                <p className="text-[12px] text-slate-400 dark:text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
              <div className="p-1">
                <Link
                  to="/ajustes"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 h-9 rounded-lg text-[13px] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors w-full"
                >
                  <Settings size={15} />
                  Ajustes
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    signOutUser();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 h-9 rounded-lg text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors w-full"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <div className="p-1">
              <p className="px-3 py-2 text-[12px] text-slate-400 dark:text-gray-500">
                Modo invitado
              </p>
              <button
                type="button"
                onClick={() => {
                  signInWithGoogle().catch(() => {});
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 h-9 rounded-lg text-[13px] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Iniciar sesión con Google
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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
            <AvatarDropdown />
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
