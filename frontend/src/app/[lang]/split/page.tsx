"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getApiBase, formatBytes, parseApiError } from "@/lib/api";
import { FileDropzone } from "@/components/FileDropzone";
import { ResultCard } from "@/components/ResultCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Split, Check, AlertCircle, FileText, Archive } from "lucide-react";

interface Thumbnail {
  page_number: number;
  thumbnail: string;
}

export default function LocalizedSplitPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview & Selection State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [serverFilename, setServerFilename] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState<string>("");
  const [mode, setMode] = useState<"single" | "zip">("single");

  // Final Result State
  const [result, setResult] = useState<{
    downloadId: string;
    fileData?: string | null;
    filename: string;
    selectedCount: number;
    mode: "single" | "zip";
    fileSize: number;
  } | null>(null);

  // When a file is chosen, automatically fetch page preview
  const handleFileChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setError(null);
    setThumbnails([]);
    setTotalPages(0);
    setSelectedPages(new Set());
    setRangeInput("");

    if (newFiles.length === 0) return;

    setPreviewLoading(true);
    const formData = new FormData();
    formData.append("file", newFiles[0]);

    try {
      const res = await fetch(`${getApiBase()}/api/split/preview`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await parseApiError(res, t("error_generic"));
        setError(msg);
        setPreviewLoading(false);
        return;
      }

      const data = await res.json();
      setSessionId(data.session_id);
      setServerFilename(data.filename);
      setTotalPages(data.total_pages);
      setThumbnails(data.thumbnails);

      // Select all by default
      const initial = new Set<number>();
      for (let p = 1; p <= data.total_pages; p++) {
        initial.add(p);
      }
      setSelectedPages(initial);
      setRangeInput(`1-${data.total_pages}`);
    } catch {
      setError(t("error_generic"));
    } finally {
      setPreviewLoading(false);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    const updated = new Set(selectedPages);
    if (updated.has(pageNum)) {
      updated.delete(pageNum);
    } else {
      updated.add(pageNum);
    }
    setSelectedPages(updated);
    updateRangeInputFromSet(updated);
  };

  const updateRangeInputFromSet = (set: Set<number>) => {
    const sorted = Array.from(set).sort((a, b) => a - b);
    if (sorted.length === 0) {
      setRangeInput("");
      return;
    }
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    setRangeInput(ranges.join(", "));
  };

  const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRangeInput(val);

    const newSet = new Set<number>();
    const parts = val.split(",").map((p) => p.trim());
    for (const part of parts) {
      if (!part) continue;
      const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : start;
        if (start <= end && start >= 1 && end <= totalPages) {
          for (let i = start; i <= end; i++) {
            newSet.add(i);
          }
        }
      }
    }
    setSelectedPages(newSet);
  };

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    setSelectedPages(all);
    setRangeInput(`1-${totalPages}`);
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
    setRangeInput("");
  };

  const handleSplit = async () => {
    if (selectedPages.size === 0) {
      setError("Please select at least one page to extract.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (files[0]) {
      formData.append("file", files[0]);
    } else if (sessionId && serverFilename) {
      formData.append("session_id", sessionId);
      formData.append("filename", serverFilename);
    }
    formData.append("pages", rangeInput || Array.from(selectedPages).join(","));
    formData.append("mode", mode);

    try {
      const res = await fetch(`${getApiBase()}/api/split`, {
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
        selectedCount: data.selected_pages_count,
        mode: data.mode,
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
    setThumbnails([]);
    setTotalPages(0);
    setSelectedPages(new Set());
    setRangeInput("");
    setResult(null);
    setError(null);
    setSessionId(null);
    setServerFilename(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mb-2">
          <Split className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("tool_split_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t("tool_split_desc")}
        </p>
      </div>

      {result ? (
        <ResultCard
          downloadId={result.downloadId}
          fileData={result.fileData}
          filename={result.filename}
          isZip={result.mode === "zip"}
          stats={[
            { label: "Selected Pages", value: result.selectedCount, highlight: true },
            { label: "Total Pages", value: totalPages },
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
            onFilesChange={handleFileChange}
            multiple={false}
          />

          {previewLoading && (
            <ProgressBar message="Generating page previews..." />
          )}

          {thumbnails.length > 0 && !previewLoading && (
            <div className="space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Range Input & Select helpers */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t("split_range_label")} ({selectedPages.size} / {totalPages} {t("split_page")})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      {t("split_select_all")}
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      {t("split_deselect_all")}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={rangeInput}
                  onChange={handleRangeInputChange}
                  placeholder={t("split_range_placeholder")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("split_range_help")}
                </p>
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2 border border-slate-100 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
                {thumbnails.map((tItem) => {
                  const isSelected = selectedPages.has(tItem.page_number);
                  return (
                    <div
                      key={tItem.page_number}
                      onClick={() => togglePageSelection(tItem.page_number)}
                      className={`relative group rounded-xl p-2 cursor-pointer transition-all border flex flex-col items-center select-none ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tItem.thumbnail}
                          alt={`Page ${tItem.page_number}`}
                          className="w-full h-full object-contain"
                        />
                        {/* Selection check badge */}
                        <div
                          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-amber-500 text-white shadow-sm"
                              : "bg-slate-200 dark:bg-slate-600 text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                        {t("split_page")} {tItem.page_number}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mode Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("split_mode_label")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("single")}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      mode === "single"
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Single PDF
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("split_mode_single")}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("zip")}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      mode === "zip"
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Archive className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        ZIP Archive
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("split_mode_zip")}
                      </p>
                    </div>
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
                onClick={handleSplit}
                disabled={selectedPages.size === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-base shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t("split_action")} ({selectedPages.size} {t("split_page")})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

