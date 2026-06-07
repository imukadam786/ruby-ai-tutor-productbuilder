"use client";

import { FET_SUBJECTS, type FetSubjectKey } from "@/lib/fet-subjects";

// The FET subject checklist shared by onboarding (step 4) and the "My subjects"
// editor. Locked subjects (English) render as always-on and can't be toggled.
export default function SubjectChecklist({
  selected,
  onToggle,
}: {
  selected: FetSubjectKey[];
  onToggle: (key: FetSubjectKey) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {FET_SUBJECTS.map(({ key, label, emoji, locked }) => {
        const isSelected = selected.includes(key);
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            disabled={locked}
            className={`py-3.5 px-5 rounded-full border-2 text-base font-medium transition-all flex items-center justify-between gap-2 ${
              isSelected
                ? "border-rose-500 bg-rose-50 text-rose-600"
                : "border-gray-200 text-gray-700 hover:border-gray-300"
            } ${locked ? "cursor-default" : ""}`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="text-xl flex-shrink-0" aria-hidden>{emoji}</span>
              <span className="truncate">{label}</span>
            </span>
            {locked ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Always on
              </span>
            ) : isSelected ? (
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
