"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getApiBase, formatBytes, parseApiError } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Minimize2, Zap, Award, Sparkles, AlertCircle } from "lucide-react";

type CompressionLevel = "extreme" | "recommended" | "low";

export default function LocalizedCompressPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadId: string;
    fileData?: string | null;
    filename: string;
    originalSize: number;
    newSize: number;
    percentSaved: number;
  } | null>(null);

  const handleCompress = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("level", level);

    try {
      const res = await fetch(`${getApiBase()}/api/compress`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await parseApiError(res, t("error_generic"));
        setError(msg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult({
        downloadId: data.download_id,
        fileData: data.file_data || null,
        filename: data.filename,
        originalSize: data.original_size,
        newSize: data.new_size,
        percentSaved: data.percent_saved,
      });
    } catch {
      setError(t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-2">
          <Minimize2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("tool_compress_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t("tool_compress_desc")}
        </p>
      </div>

      {result ? (
        <ResultCard
          downloadId={result.downloadId}
          fileData={result.fileData}
          filename={result.filename}
          stats={[
            { label: t("original_size"), value: formatBytes(result.originalSize) },
            { label: t("new_size"), value: formatBytes(result.newSize) },
            { label: t("saved"), value: `${result.percentSaved}%`, highlight: true },
          ]}
          onReset={reset}
        />
      ) : loading ? (
        <ProgressBar message={t("processing")} />
      ) : (
        <div className="space-y-6">
          <FileDropzone
            accept="application/pdf"
            files={files}
            onFilesChange={setFiles}
            multiple={false}
          />

          {files.length > 0 && (
            <div className="space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t("compress_select_level")}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Extreme */}
                <button
                  type="button"
                  onClick={() => setLevel("extreme")}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    level === "extreme"
                      ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-rose-500" />
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                      Max
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {t("compress_extreme_title")}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("compress_extreme_desc")}
                    </p>
                  </div>
                </button>

                {/* Recommended */}
                <button
                  type="button"
                  onClick={() => setLevel("recommended")}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    level === "recommended"
                      ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                      Best
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {t("compress_recommended_title")}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("compress_recommended_desc")}
                    </p>
                  </div>
                </button>

                {/* Low */}
                <button
                  type="button"
                  onClick={() => setLevel("low")}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    level === "low"
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                      HD
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {t("compress_low_title")}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("compress_low_desc")}
                    </p>
                  </div>
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCompress}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-rose-500/20 hover:from-rose-600 hover:to-indigo-700 transition-all"
              >
                {t("compress_action")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

