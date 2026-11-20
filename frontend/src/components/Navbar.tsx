"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Shield } from "lucide-react";

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={`/${language}`} className="flex items-center gap-3 group" aria-label="PDF Tools Home">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="PDF Tools Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              {t("brand_name")}
            </span>
            <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              {t("brand_tagline")}
            </span>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={`/${language}`}
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors hidden md:inline-block"
          >
            {t("nav_home")}
          </Link>
          <Link
            href={`/${language}/privacy`}
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>{t("nav_privacy")}</span>
          </Link>

          {/* Language Toggle */}
          <div className="relative inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setLanguage("en")}
              aria-label="Switch to English"
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                language === "en"
                  ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("bn")}
              aria-label="Switch to Bangla"
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                language === "bn"
                  ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
