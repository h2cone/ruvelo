import AsyncStorage from "expo-sqlite/kv-store";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentLanguage,
  getLocale,
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  type Language,
  setCurrentLanguage,
  type TranslationKey,
  translate,
  translateText,
} from "./config";

interface I18nContextValue {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  translateText: (value: string | null | undefined) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((storedLanguage) => {
        if (!active || !isLanguage(storedLanguage)) {
          return;
        }

        setCurrentLanguage(storedLanguage);
        setLanguageState(storedLanguage);
      })
      .catch((error) => {
        console.error("Failed to load language preference", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setCurrentLanguage(nextLanguage);
    setLanguageState(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage).catch((error) => {
      console.error("Failed to save language preference", error);
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "zh" : "en");
  }, [language, setLanguage]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      locale: getLocale(language),
      setLanguage,
      toggleLanguage,
      t: (key, params) => translate(language, key, params),
      translateText: (input) => translateText(input, language),
    }),
    [language, setLanguage, toggleLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}

export type { Language, TranslationKey } from "./config";
export {
  getCurrentLanguage,
  getDistanceUnit,
  getLocale,
  getPaceUnit,
  translate,
  translateText,
} from "./config";
