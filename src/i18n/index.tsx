/**
 * i18n Configuration
 * Internationalization support for Agent Team
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './translations';

// Language context type
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

// Default context
const I18nContext = createContext<I18nContextType>({
  language: 'en',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLanguage: () => {},
  t: (key) => key,
});

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'agentTeamLanguage';

/**
 * Get stored language preference or default to English
 */
const getStoredLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'en';
};

/**
 * I18n Provider Component
 */
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  /**
   * Set language and persist to localStorage
   */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
  };

  /**
   * Translation function
   * Returns the translated string for the given key
   */
  const t = (key: TranslationKeys): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

/**
 * Hook to use i18n translations
 */
export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

/**
 * Available languages
 */
export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export default I18nProvider;
