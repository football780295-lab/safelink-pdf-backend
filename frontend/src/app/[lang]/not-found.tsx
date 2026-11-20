"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
        <FileQuestion className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t("not_found_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("not_found_desc")}
        </p>
      </div>

      <Link
        href={`/${language}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-sm shadow-md hover:from-rose-600 hover:to-indigo-700 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>{t("not_found_btn")}</span>
      </Link>
    </div>
  );
}
