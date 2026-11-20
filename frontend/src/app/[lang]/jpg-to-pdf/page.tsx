"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getApiBase, formatBytes, parseApiError } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { ProgressBar } from "@/components/ProgressBar";
import { FileImage, AlertCircle, Layout, Maximize2 } from "lucide-react";

export default function LocalizedJpgToPdfPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "fit">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadId: string;
    fileData?: string | null;
    filename: string;
    pageCount: number;
    fileSize: number;
  } | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("page_size", pageSize);
    formData.append("orientation", orientation);

    try {
      const res = await fetch(`${getApiBase()}/api/jpg-to-pdf`, {
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
        pageCount: data.page_count,
        fileSize: data.file_size,
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-2">
          <FileImage className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("tool_jpg_to_pdf_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t("tool_jpg_to_pdf_desc")}
        </p>
      </div>

      {result ? (
        <ResultCard
          downloadId={result.downloadId}
          fileData={result.fileData}
          filename={result.filename}
          stats={[
            { label: t("total_pages"), value: result.pageCount, highlight: true },
            { label: t("file_size"), value: formatBytes(result.fileSize) },
            { label: t("jpg_size_label"), value: pageSize.toUpperCase() },
          ]}
          onReset={reset}
        />
      ) : loading ? (
        <ProgressBar message={t("processing")} />
      ) : (
        <div className="space-y-6">
          <FileDropzone
            accept="image/jpeg,image/png"
            files={files}
            onFilesChange={setFiles}
            multiple={true}
          />

          {files.length > 0 && (
            <div className="space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Page Size Option */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("jpg_size_label")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPageSize("a4")}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      pageSize === "a4"
                        ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Layout className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">A4</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("jpg_size_a4")}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageSize("fit")}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      pageSize === "fit"
                        ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Maximize2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Fit to Image</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("jpg_size_fit")}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Orientation Option (Only for A4) */}
              {pageSize === "a4" && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t("jpg_orientation_label")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOrientation("portrait")}
                      className={`p-3 rounded-xl border text-center font-medium text-sm transition-all ${
                        orientation === "portrait"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t("jpg_orient_portrait")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation("landscape")}
                      className={`p-3 rounded-xl border text-center font-medium text-sm transition-all ${
                        orientation === "landscape"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {t("jpg_orient_landscape")}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvert}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                {t("jpg_action")} ({files.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

