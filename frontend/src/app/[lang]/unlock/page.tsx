"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getApiBase, formatBytes, parseApiError } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Unlock, Eye, EyeOff, ShieldAlert, AlertCircle } from "lucide-react";

export default function LocalizedUnlockPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadId: string;
    fileData?: string | null;
    filename: string;
    fileSize: number;
    message: string;
  } | null>(null);

  const handleUnlock = async () => {
    if (files.length === 0) return;

    if (!password) {
      setError(t("error_pass_empty"));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("password", password);

    try {
      const res = await fetch(`${getApiBase()}/api/unlock`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await parseApiError(res, t("error_wrong_pass"));
        setError(msg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult({
        downloadId: data.download_id,
        fileData: data.file_data || null,
        filename: data.filename,
        fileSize: data.file_size,
        message: data.message,
      });
    } catch {
      setError(t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setPassword("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 mb-2">
          <Unlock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("tool_unlock_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t("tool_unlock_desc")}
        </p>
      </div>

      {result ? (
        <ResultCard
          downloadId={result.downloadId}
          fileData={result.fileData}
          filename={result.filename}
          stats={[
            { label: "Security Status", value: "Unlocked", highlight: true },
            { label: t("file_size"), value: formatBytes(result.fileSize) },
          ]}
          onReset={reset}
        />
      ) : loading ? (
        <ProgressBar message={t("processing")} />
      ) : (
        <div className="space-y-6">
          {/* Explicit Legal / Authorization Disclaimer */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex gap-3 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold">{t("unlock_disclaimer_title")}</h4>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {t("unlock_disclaimer_text")}
              </p>
            </div>
          </div>

          <FileDropzone
            accept="application/pdf"
            files={files}
            onFilesChange={setFiles}
            multiple={false}
          />

          {files.length > 0 && (
            <div className="space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Password input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("unlock_password_label")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder={t("unlock_password_placeholder")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleUnlock}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-base shadow-lg shadow-pink-500/20 hover:from-pink-600 hover:to-rose-700 transition-all"
              >
                {t("unlock_action")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

