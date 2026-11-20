"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { en } from "@/locales/en";
import { bn } from "@/locales/bn";

export type Language = "en" | "bn";
export type TranslationKey = keyof typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => en[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>("en");

  // Sync state with URL prefix
  useEffect(() => {
    if (pathname?.startsWith("/bn")) {
      setLanguageState("bn");
    } else {
      setLanguageState("en");
    }
  }, [pathname]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (!pathname) return;

    if (pathname.startsWith("/en") || pathname.startsWith("/bn")) {
      const newPath = pathname.replace(/^\/(en|bn)/, `/${newLang}`);
      router.push(newPath);
    } else {
      router.push(`/${newLang}${pathname === "/" ? "" : pathname}`);
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = language === "bn" ? bn : en;
    return dict[key] || en[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
