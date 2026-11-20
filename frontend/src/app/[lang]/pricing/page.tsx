"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Check, Zap, Sparkles, ArrowLeft, Shield } from "lucide-react";

export default function LocalizedPricingPage() {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <Link
          href={`/${language}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("nav_home")}</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Supercharge Your PDF Workflow
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Need bigger files and batch processing? Choose the plan that best fits your daily needs.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Free Plan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Perfect for casual and everyday PDF tasks.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
              <span className="text-xs text-slate-500 font-medium">/ forever</span>
            </div>

            <ul className="space-y-3 pt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Up to 50MB per file</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>All 7 PDF tools included</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Auto-deletion within 15 minutes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No sign-up or registration required</span>
              </li>
            </ul>
          </div>

          <Link
            href={`/${language}`}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm text-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Current Plan
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-rose-50/50 to-indigo-50/50 dark:from-rose-950/20 dark:to-indigo-950/20 border-2 border-rose-500 dark:border-rose-500/80 shadow-xl shadow-rose-500/10 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider">
            Popular
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-500" />
                Pro Plan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For power users, designers, and business workflows.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$4.99</span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>

            <ul className="space-y-3 pt-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span><strong>200MB</strong> max file size limit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span><strong>Zero advertisements</strong> (100% ad-free)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span><strong>Batch processing</strong> (multiple files in parallel)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Dedicated high-speed conversion servers</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Priority 24/7 customer support</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => alert("Pro subscriptions opening soon! Enjoy free unlimited usage right now.")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-sm text-center shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-indigo-700 transition-all"
          >
            Upgrade to Pro (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
