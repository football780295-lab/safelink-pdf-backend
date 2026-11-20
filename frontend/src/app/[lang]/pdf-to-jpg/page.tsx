"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getApiBase, formatBytes, parseApiError, getDownloadUrl } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Image as ImageIcon, AlertCircle, Monitor, Printer, Smartphone, Download } from "lucide-react";

export default function LocalizedPdfToJpgPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [dpi, setDpi] = useState<number>(150);
  const [quality, setQuality] = useState<number>(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadId: string;
    fileData?: string | null;
    filename: string;
    totalPages: number;
    dpi: number;
    fileSize: number;
    images?: { page: number; download_id: string; file_data?: string | null; filename: string }[];
  } | null>(null);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("dpi", dpi.toString());
    formData.append("quality", quality.toString());

    try {
      const res = await fetch(`${getApiBase()}/api/pdf-to-jpg`, {
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
        totalPages: data.total_pages,
        dpi: data.dpi,
        fileSize: data.file_size,
        images: data.images || [],
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 mb-2">
          <ImageIcon className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("tool_pdf_to_jpg_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t("tool_pdf_to_jpg_desc")}
        </p>
      </div>

      {result ? (
        <div className="space-y-6">
          <ResultCard
            downloadId={result.downloadId}
            fileData={result.fileData}
            filename={result.filename}
            isZip={true}
            stats={[
              { label: t("total_pages"), value: result.totalPages, highlight: true },
              { label: "DPI", value: `${result.dpi} DPI` },
              { label: t("file_size"), value: formatBytes(result.fileSize) },
            ]}
            onReset={reset}
          />

          {result.images && result.images.length > 0 && (
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Download Individual Pages ({result.images.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {result.images.map((img) => (
                  <a
                    key={img.download_id}
                    href={img.file_data || getDownloadUrl(img.download_id)}
                    download={img.filename}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>Page {img.page}</span>
                    <Download className="w-3.5 h-3.5 text-sky-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
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
              {/* DPI Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("pdf2jpg_dpi_label")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDpi(72)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      dpi === 72
                        ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-sky-500 mb-1" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">72 DPI</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Web / Small</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDpi(150)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      dpi === 150
                        ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Monitor className="w-5 h-5 text-sky-500 mb-1" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">150 DPI</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Standard / Screen</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDpi(300)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      dpi === 300
                        ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Printer className="w-5 h-5 text-sky-500 mb-1" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">300 DPI</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">High Quality / Print</p>
                  </button>
                </div>
              </div>

              {/* Quality slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t("pdf2jpg_quality_label")}
                  </label>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvert}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-sky-500/20 hover:from-sky-600 hover:to-indigo-700 transition-all"
              >
                {t("pdf2jpg_action")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

