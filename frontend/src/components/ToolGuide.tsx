"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, CheckCircle } from "lucide-react";

interface Step {
  title: string;
  desc: string;
}

interface Faq {
  question: string;
  answer: string;
}

interface ToolGuideProps {
  steps: Step[];
  faqs: Faq[];
}

export const ToolGuide: React.FC<ToolGuideProps> = ({ steps, faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-4xl mx-auto pt-10 space-y-12">
      {/* 3 Steps Guide */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            How to Use in 3 Easy Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Fast, secure, and hassle-free PDF management right in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm relative space-y-3"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-sm">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {st.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      {faqs.length > 0 && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-500" />
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear answers regarding privacy, performance, and document security.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-rose-500" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
