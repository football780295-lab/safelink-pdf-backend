"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
  progress?: number;
  message: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
          {message}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden relative">
        {progress !== undefined ? (
          <div
            className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        ) : (
          <div className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        )}
      </div>

      {progress !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {progress}%
        </span>
      )}
    </div>
  );
};
