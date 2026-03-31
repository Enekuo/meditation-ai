import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  CircleHelp,
  Settings,
  ChevronsLeft,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const FreeLayout = () => {
  const { language } = useTranslation();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-slate-200">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              className="text-[30px] leading-none font-bold text-slate-900 tracking-tight"
            >
              Portfolio Controller
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              <Globe size={16} />
              {language}
              <ChevronDown size={16} className="opacity-70" />
            </button>

            <button
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm hover:bg-blue-700 transition-colors"
              aria-label="Cuenta"
            >
              E
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        <aside className="w-[250px] bg-white border-r border-slate-200 flex flex-col justify-between">
          <div className="p-4">
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-colors ${
                  isDashboard
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
            </nav>
          </div>

          <div className="p-4">
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-[15px] font-medium text-left">
                <Lightbulb size={18} />
                <span>Sugerencias</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-[15px] font-medium text-left">
                <CircleHelp size={18} />
                <span>Ayuda</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-[15px] font-medium text-left">
                <Settings size={18} />
                <span>Ajustes</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors text-[15px] font-medium text-left mt-2">
                <ChevronsLeft size={18} />
                <span>Contraer</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreeLayout;