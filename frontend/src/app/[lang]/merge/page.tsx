"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getApiBase, formatBytes, parseApiError } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { ProgressBar } from "@/components/ProgressBar";
import { GitMerge, AlertCircle } from "lucide-react";

export default function LocalizedMergePage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadId: string;
    fileData?: string | null;
    filename: string;
    fileCount: number;
    totalPages: number;
    outputSize: number;
  } | null>(null);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError(t("merge_min_files_warning"));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((f) => {
      formData.append("files", f);
    });

    try {
      const res = await fetch(`${getApiBase()}/api/merge`, {
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
        fileCount: data.file_count,
        totalPages: data.total_pages,
        outputSize: data.output_size,
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2">
          <GitMerge className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("tool_merge_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t("tool_merge_desc")}
        </p>
      </div>

      {result ? (
        <ResultCard
          downloadId={result.downloadId}
          fileData={result.fileData}
          filename={result.filename}
          stats={[
            { label: t("total_pages"), value: result.totalPages },
            { label: t("upload_browse"), value: result.fileCount },
            { label: t("file_size"), value: formatBytes(result.outputSize) },
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
            onFilesChange={(newFiles) => {
              setFiles(newFiles);
              if (newFiles.length >= 2) setError(null);
            }}
            multiple={true}
          />

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {files.length > 0 && (
            <button
              type="button"
              disabled={files.length < 2}
              onClick={handleMerge}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t("merge_action")} ({files.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

