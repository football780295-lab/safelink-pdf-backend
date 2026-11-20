"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { dataUriToBlobUrl, getDownloadUrl } from "@/lib/api";
import { CheckCircle2, Download, RefreshCw } from "lucide-react";

interface ResultStat {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface ResultCardProps {
  downloadId: string;
  fileData?: string | null;
  filename: string;
  stats?: ResultStat[];
  onReset: () => void;
  isZip?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  downloadId,
  fileData = null,
  filename,
  stats = [],
  onReset,
  isZip = false,
}) => {
  const { t } = useLanguage();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileData) {
      setBlobUrl(null);
      return;
    }
    const url = dataUriToBlobUrl(fileData);
    setBlobUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileData]);

  const downloadUrl = blobUrl || getDownloadUrl(downloadId);

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none text-center space-y-6">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-8 ring-emerald-50 dark:ring-emerald-950/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {t("status_success")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate max-w-md mx-auto">
          {filename}
        </p>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          {stats.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {s.label}
              </span>
              <span
                className={`text-base sm:text-lg font-bold mt-0.5 ${
                  s.highlight
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href={downloadUrl}
          download={filename}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-indigo-700 hover:shadow-rose-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="w-5 h-5" />
          <span>{isZip ? t("download_zip_btn") : t("download_btn")}</span>
        </a>

        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t("process_another")}</span>
        </button>
      </div>
    </div>
  );
};
