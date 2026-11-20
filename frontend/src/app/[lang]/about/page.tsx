"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Info, ArrowLeft, Heart, Sparkles, ShieldCheck } from "lucide-react";

export default function LocalizedAboutPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t("about_title")}
            </h1>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          {t("about_intro")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center shadow-sm">
          <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {t("about_stat1")}
          </span>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {t("about_stat1_label")}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center shadow-sm">
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {t("about_stat2")}
          </span>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {t("about_stat2_label")}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center shadow-sm">
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {t("about_stat3")}
          </span>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {t("about_stat3_label")}
          </p>
        </div>
      </div>

      {/* Mission details */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t("about_mission_title")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
          {t("about_mission_desc")}
        </p>
      </div>
    </div>
  );
}
