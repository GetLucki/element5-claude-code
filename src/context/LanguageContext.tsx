import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type Locale = "sv" | "en" | "zh";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

// Lazy-load translations
import { sv } from "@/data/translations/sv";
import { en } from "@/data/translations/en";
import { zh } from "@/data/translations/zh";

const TRANSLATIONS: Record<Locale, Record<string, string>> = { sv, en, zh };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("5e-locale");
    if (stored === "sv" || stored === "en" || stored === "zh") return stored;
    return "sv";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("5e-locale", l);
  }, []);

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.sv[key] || key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
