"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Minimize2,
  GitMerge,
  Split,
  FileImage,
  Image as ImageIcon,
  Lock,
  Unlock,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

export default function LocalizedHomePage() {
  const { language, t } = useLanguage();

  const tools = [
    {
      href: `/${language}/compress`,
      title: t("tool_compress_title"),
      desc: t("tool_compress_desc"),
      icon: Minimize2,
      gradient: "from-rose-500 to-red-600",
      bgLight: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    },
    {
      href: `/${language}/merge`,
      title: t("tool_merge_title"),
      desc: t("tool_merge_desc"),
      icon: GitMerge,
      gradient: "from-indigo-500 to-blue-600",
      bgLight: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
    },
    {
      href: `/${language}/split`,
      title: t("tool_split_title"),
      desc: t("tool_split_desc"),
      icon: Split,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    },
    {
      href: `/${language}/jpg-to-pdf`,
      title: t("tool_jpg_to_pdf_title"),
      desc: t("tool_jpg_to_pdf_desc"),
      icon: FileImage,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    },
    {
      href: `/${language}/pdf-to-jpg`,
      title: t("tool_pdf_to_jpg_title"),
      desc: t("tool_pdf_to_jpg_desc"),
      icon: ImageIcon,
      gradient: "from-sky-500 to-cyan-600",
      bgLight: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/50",
    },
    {
      href: `/${language}/protect`,
      title: t("tool_protect_title"),
      desc: t("tool_protect_desc"),
      icon: Lock,
      gradient: "from-purple-500 to-violet-600",
      bgLight: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    },
    {
      href: `/${language}/unlock`,
      title: t("tool_unlock_title"),
      desc: t("tool_unlock_desc"),
      icon: Unlock,
      gradient: "from-fuchsia-500 to-pink-600",
      bgLight: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900/50",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-5 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>{t("badge_free")}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t("hero_title")}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t("hero_subtitle")}
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2">
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Clock className="w-4 h-4 text-rose-500" />
            {t("badge_privacy")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {t("badge_limit")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {t("badge_no_signup")}
          </span>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-rose-950/20 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform ${tool.bgLight}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-1 text-sm font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                <span>{t("upload_browse")}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
