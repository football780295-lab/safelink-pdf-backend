"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Clock, Trash2, EyeOff, KeyRound, Lock, ArrowLeft } from "lucide-react";

export default function LocalizedPrivacyPage() {
  const { language, t } = useLanguage();

  const points = [
    {
      icon: Clock,
      title: t("privacy_point1_title"),
      desc: t("privacy_point1_desc"),
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50",
    },
    {
      icon: Trash2,
      title: t("privacy_point2_title"),
      desc: t("privacy_point2_desc"),
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    },
    {
      icon: EyeOff,
      title: t("privacy_point3_title"),
      desc: t("privacy_point3_desc"),
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50",
    },
    {
      icon: KeyRound,
      title: t("privacy_point4_title"),
      desc: t("privacy_point4_desc"),
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
    },
    {
      icon: Lock,
      title: t("privacy_point5_title"),
      desc: t("privacy_point5_desc"),
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50",
    },
  ];

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
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t("privacy_title")}
            </h1>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          {t("privacy_intro")}
        </p>
      </div>

      {/* Policy Pillars */}
      <div className="space-y-4">
        {points.map((pt, idx) => {
          const Icon = pt.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-start gap-4"
            >
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${pt.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {pt.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white text-base">
          Questions or Security Concerns?
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Our application is fully open source. You can inspect the complete source code, security
          audits, and temporary file cleanup mechanisms on GitHub.
        </p>
      </div>
    </div>
  );
}
