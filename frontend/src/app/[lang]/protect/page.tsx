"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getApiBase, formatBytes, parseApiError } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

export default function LocalizedProtectPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadId: string;
    fileData?: string | null;
    filename: string;
    fileSize: number;
    encryption: string;
  } | null>(null);

  const handleProtect = async () => {
    if (files.length === 0) return;

    if (!password) {
      setError(t("error_pass_empty"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("error_pass_mismatch"));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("password", password);
    formData.append("confirm_password", confirmPassword);

    try {
      const res = await fetch(`${getApiBase()}/api/protect`, {
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
        fileSize: data.file_size,
        encryption: data.encryption,
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
    setConfirmPassword("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mb-2">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("tool_protect_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t("tool_protect_desc")}
        </p>
      </div>

      {result ? (
        <ResultCard
          downloadId={result.downloadId}
          fileData={result.fileData}
          filename={result.filename}
          stats={[
            { label: "Encryption", value: result.encryption, highlight: true },
            { label: t("file_size"), value: formatBytes(result.fileSize) },
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
            <div className="space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200/60 dark:border-purple-900/50">
                <ShieldCheck className="w-4 h-4 shrink-0 text-purple-500" />
                <span>{t("protect_notice")}</span>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("protect_password_label")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder={t("protect_password_placeholder")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

              {/* Confirm password field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("protect_confirm_label")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder={t("protect_confirm_placeholder")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
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
                onClick={handleProtect}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-indigo-700 transition-all"
              >
                {t("protect_action")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

