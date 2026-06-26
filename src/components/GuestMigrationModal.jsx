import React from 'react';
import { usePortfolioData } from '@/contexts/PortfolioDataProvider';

export default function GuestMigrationModal() {
  const { migrationPending, resolveMigration } = usePortfolioData();

  if (!migrationPending) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-md mx-4 p-6">
        <div className="w-9 h-1 rounded-full bg-blue-500 mb-4" />
        <h2 className="text-[18px] font-bold text-[#2f3a56] dark:text-gray-100 mb-2">
          Datos locales detectados
        </h2>
        <p className="text-[14px] text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
          Tienes datos de cartera guardados localmente en este dispositivo.
          ¿Quieres importarlos a tu cuenta de Google para sincronizarlos en todos tus dispositivos?
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => resolveMigration('import')}
            className="w-full h-11 rounded-xl bg-[#3f7ee8] text-white text-[14px] font-bold hover:bg-[#316fda] transition-colors"
          >
            Importar mis datos locales
          </button>
          <button
            type="button"
            onClick={() => resolveMigration('fresh')}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[14px] font-semibold text-[#51607f] dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          >
            Empezar desde cero
          </button>
        </div>
      </div>
    </div>
  );
}
