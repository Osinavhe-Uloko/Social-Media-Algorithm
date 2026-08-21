"use client";

import { useState } from "react";

export interface GlossaryEntry {
  key: string;
  name: string;
  description: string;
  questions?: string[];
}

export default function MetricsGlossary({ entries }: { entries: GlossaryEntry[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  return (
    <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
      {entries.map((entry) => {
        const open = activeKey === entry.key;
        return (
          <div key={entry.key} className="rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveKey((k) => (k === entry.key ? null : entry.key))}
              className="flex w-full items-center gap-2 p-3 text-left text-sm font-semibold text-slate-800"
              aria-expanded={open}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                  open ? "rotate-90" : ""
                }`}
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
              <span>
                {entry.key} &mdash; {entry.name}
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-3 pb-3 text-sm text-slate-500">
                  <p>{entry.description}</p>
                  {entry.questions && entry.questions.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
                      {entry.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
