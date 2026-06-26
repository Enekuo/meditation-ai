import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { usePortfolioData } from '@/contexts/PortfolioDataProvider';
import { fsUpdateSettings } from '@/lib/firestoreService';

const SETTINGS_KEY = 'portfolio_settings';

const DEFAULT_SETTINGS = {
  theme: 'system',
  numberLocale: 'es-ES',
  defaultChartView: 'donut',
  showDividends: true,
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  baseCurrency: 'EUR',
  updateBaseCurrency: () => {},
  effectiveTheme: 'light',
});

const readSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (theme) => {
  const effective = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', effective === 'dark');
  return effective;
};

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const { generalData, saveGeneralData } = usePortfolioData();
  const [settings, setSettings] = useState(readSettings);
  const [effectiveTheme, setEffectiveTheme] = useState(() => applyTheme(readSettings().theme));

  useEffect(() => {
    const effective = applyTheme(settings.theme);
    setEffectiveTheme(effective);
  }, [settings.theme]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const effective = applyTheme('system');
      setEffectiveTheme(effective);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  const updateSettings = useCallback(
    (partial) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        if (user) {
          fsUpdateSettings(user.uid, next).catch(() => {});
        }
        return next;
      });
    },
    [user]
  );

  const baseCurrency = generalData.currency || 'EUR';

  const updateBaseCurrency = useCallback(
    (currency) => {
      saveGeneralData({ ...generalData, currency });
    },
    [generalData, saveGeneralData]
  );

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, baseCurrency, updateBaseCurrency, effectiveTheme }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
