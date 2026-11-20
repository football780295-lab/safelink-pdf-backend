"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Cookie, X, ShieldCheck } from "lucide-react";

export const CookieConsent: React.FC = () => {
  const { language } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pdf_tool_cookie_consent");
    if (!saved) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("pdf_tool_cookie_consent", "accepted");
    setShow(false);
    window.dispatchEvent(new Event("storage"));
  };

  const handleDecline = () => {
    localStorage.setItem("pdf_tool_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 text-slate-900 dark:text-white space-y-3.5 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
          <Cookie className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Cookie & Privacy Preferences</span>
        </div>
        <button
          onClick={handleDecline}
          aria-label="Dismiss cookie notice"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        We respect your privacy. We do not track document content. We use essential storage for
        theme and language settings, and optional cookies for supporting advertisements. Read our{" "}
        <Link
          href={`/${language}/privacy`}
          className="text-rose-600 dark:text-rose-400 underline font-semibold"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleAccept}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-xs shadow-sm hover:from-rose-600 hover:to-indigo-700 transition-all"
        >
          Accept All
        </button>
        <button
          onClick={handleDecline}
          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
        >
          Necessary Only
        </button>
      </div>
    </div>
  );
};
