"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Lock, Clock } from "lucide-react";

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Security badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8 border-b border-slate-200 dark:border-slate-800 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-600 dark:text-slate-400">
            <Clock className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="text-xs sm:text-sm">{t("badge_privacy")}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-600 dark:text-slate-400">
            <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
            <span className="text-xs sm:text-sm">{t("badge_no_signup")}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm">{t("badge_limit")}</span>
          </div>
        </div>

        {/* Links & copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>© {year} {t("brand_name")}.</span>
            <span>{t("footer_rights")}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href={`/${language}`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              {t("nav_home")}
            </Link>
            <Link href={`/${language}/about`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              {t("footer_about")}
            </Link>
            <Link href={`/${language}/privacy`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              {t("footer_privacy_link")}
            </Link>
            <Link href={`/${language}/terms`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              {t("footer_terms")}
            </Link>
            <Link href={`/${language}/contact`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              {t("footer_contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
