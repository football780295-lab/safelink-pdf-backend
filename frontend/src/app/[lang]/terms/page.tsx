"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { FileText, ArrowLeft, ShieldCheck, Scale } from "lucide-react";

export default function LocalizedTermsPage() {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-4">
        <Link
          href={`/${language}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("nav_home")}</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t("terms_title")}
            </h1>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          {t("terms_intro")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("terms_section1_title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("terms_section1_desc")}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("terms_section2_title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("terms_section2_desc")}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("terms_section3_title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("terms_section3_desc")}
          </p>
        </div>
      </div>
    </div>
  );
}
