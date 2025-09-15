import React, { useState, useEffect, useCallback } from 'react';
import { LanguageContext } from '@/lib/i18n';

const loadTranslation = (language) => {
  return import(`@/lib/translations/${language.toLowerCase()}.json`)
    .then(module => module.default);
};

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ES');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    loadTranslation(language)
      .then(data => {
        if (active) {
          setTranslations(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        loadTranslation('es').then(data => {
          if (active) {
            setTranslations(data);
            setIsLoading(false);
          }
        });
      });
    return () => {
      active = false;
    };
  }, [language]);

  const t = useCallback((key) => {
    if (isLoading) return '';
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key;
      }
    }
    return result;
  }, [translations, isLoading]);

  const value = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {!isLoading && children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;