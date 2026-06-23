import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SETTINGS_KEY = 'portfolio_settings';
const GENERAL_KEY = 'portfolio_general_data';

const DEFAULT_SETTINGS = {
  theme: 'system',         // 'light' | 'dark' | 'system'
  numberLocale: 'es-ES',   // 'es-ES' | 'en-US'
  defaultChartView: 'donut', // 'donut' | 'bars'
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

const readBaseCurrency = () => {
  try {
    const general = JSON.parse(localStorage.getItem(GENERAL_KEY) || '{}');
    return general.currency || 'EUR';
  } catch {
    return 'EUR';
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
  const [settings, setSettings] = useState(readSettings);
  const [baseCurrency, setBaseCurrencyState] = useState(readBaseCurrency);
  const [effectiveTheme, setEffectiveTheme] = useState(() => applyTheme(readSettings().theme));

  // Apply theme whenever it changes
  useEffect(() => {
    const effective = applyTheme(settings.theme);
    setEffectiveTheme(effective);
  }, [settings.theme]);

  // Follow system preference when theme is 'system'
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

  // Sync baseCurrency if portfolio_general_data changes from another component
  useEffect(() => {
    const handleUpdated = () => setBaseCurrencyState(readBaseCurrency());
    window.addEventListener('portfolio-updated', handleUpdated);
    return () => window.removeEventListener('portfolio-updated', handleUpdated);
  }, []);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateBaseCurrency = useCallback((currency) => {
    try {
      const general = JSON.parse(localStorage.getItem(GENERAL_KEY) || '{}');
      const updated = { ...general, currency };
      localStorage.setItem(GENERAL_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
    setBaseCurrencyState(currency);
    window.dispatchEvent(new CustomEvent('portfolio-updated'));
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, baseCurrency, updateBaseCurrency, effectiveTheme }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
