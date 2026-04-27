"use client";

import EduBackground from "@/components/EduBackground";
import { ActiveView } from "@/types";

interface StudyGuidesProps {
  onBack: () => void;
}

const SUBJECTS = [
  { emoji: "➕", label: "Mathematics", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { emoji: "🔬", label: "Physical Sciences", color: "bg-green-50 text-green-600 border-green-100" },
  { emoji: "🧬", label: "Life Sciences", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { emoji: "📖", label: "English HL", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { emoji: "🌍", label: "Geography", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { emoji: "🏛️", label: "History", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { emoji: "💰", label: "Accounting", color: "bg-rose-50 text-rose-600 border-rose-100" },
  { emoji: "📊", label: "Business Studies", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
];

export default function StudyGuides({ onBack }: StudyGuidesProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-10 pt-8 pb-12">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">📚</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study Guides</h1>
              <p className="text-gray-500 text-sm mt-0.5">In-depth subject guides and summaries for matric learners.</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Guides being added — check back soon
          </div>
        </div>

        {/* Subject grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SUBJECTS.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border p-5 flex flex-col items-center gap-3 text-center bg-white opacity-60 cursor-not-allowed select-none ${s.color.split(" ")[0]}`}
            >
              <span className="text-4xl">{s.emoji}</span>
              <span className="font-semibold text-gray-700 text-sm leading-snug">{s.label}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>Coming soon</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
