"use client";

import React, { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { formatBytes } from "@/lib/api";
import { UploadCloud, File, X, ArrowUp, ArrowDown, AlertCircle } from "lucide-react";

interface FileDropzoneProps {
  accept: string;                // e.g. "application/pdf" or "image/jpeg,image/png"
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  multiple = false,
  files,
  onFilesChange,
  maxSizeMB = 50,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateAndAddFiles = (incoming: FileList | File[]) => {
    setError(null);
    const newValidFiles: File[] = [];

    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i];

      // Check size
      if (file.size > maxSizeBytes) {
        setError(`${file.name}: ${t("error_too_large")}`);
        return;
      }

      // Check type
      if (accept.includes("pdf")) {
        if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
          setError(`${file.name}: ${t("error_invalid_type_pdf")}`);
          return;
        }
      } else if (accept.includes("image")) {
        const isImg = file.type.startsWith("image/") || /\.(jpe?g|png)$/i.test(file.name);
        if (!isImg) {
          setError(`${file.name}: ${t("error_invalid_type_img")}`);
          return;
        }
      }

      newValidFiles.push(file);
    }

    if (multiple) {
      onFilesChange([...files, ...newValidFiles]);
    } else {
      onFilesChange(newValidFiles.slice(0, 1));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    onFilesChange(updated);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onFilesChange(updated);
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Target */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          isDragOver
            ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/20 scale-[0.99]"
            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
              {multiple ? t("drag_drop_multi_title") : t("drag_drop_title")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("drag_drop_subtitle")}
            </p>
          </div>
          <button
            type="button"
            className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm shadow hover:bg-slate-800 dark:hover:bg-white transition-all pointer-events-none"
          >
            {t("upload_browse")}
          </button>
        </div>
      </div>

      {/* Error notice */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* File List for multiple files or single file preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          {multiple && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {files.length} {t("upload_browse").toLowerCase()}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {t("reorder_tip")}
              </span>
            </div>
          )}

          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {multiple && (
                    <>
                      <button
                        type="button"
                        disabled={idx === 0 || disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveFile(idx, "up");
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === files.length - 1 || disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveFile(idx, "down");
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors ml-1"
                    title={t("remove")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
