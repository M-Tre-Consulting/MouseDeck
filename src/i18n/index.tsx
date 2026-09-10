import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Translations, translations } from "./translations";

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
  languages: LanguageOption[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "mousedeck_language";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved === "it" || saved === "en") {
        return saved;
      }
      // System detection
      if (typeof navigator !== "undefined" && navigator.language) {
        return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
      }
    } catch {
      // Fallback
    }
    return "it";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.error("Failed to save language preference:", e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (path: string, fallback?: string): string => {
    const currentDict = translations[language];
    const defaultDict = translations.it;

    const resolve = (dict: any, keyPath: string[]): string | undefined => {
      let curr = dict;
      for (const k of keyPath) {
        if (curr && typeof curr === "object" && k in curr) {
          curr = curr[k];
        } else {
          return undefined;
        }
      }
      return typeof curr === "string" ? curr : undefined;
    };

    const keys = path.split(".");
    const resolved = resolve(currentDict, keys) ?? resolve(defaultDict, keys);

    return resolved ?? fallback ?? path;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return context;
};

export { translations };
export type { Language, Translations };
