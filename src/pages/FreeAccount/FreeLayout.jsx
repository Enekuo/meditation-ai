import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const FreeLayout = () => {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link
              to="/"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
              className="text-xl font-bold text-slate-900 tracking-tight"
            >
              Portfolio Controller
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              <Globe size={16} />
              {language}
              <ChevronDown size={16} className="opacity-70" />
            </button>

            <button
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm hover:bg-blue-700 transition-colors"
              aria-label="Cuenta de Google"
            >
              G
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default FreeLayout;