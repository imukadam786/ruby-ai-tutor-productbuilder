"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

function MockupPapers({ isMobile }: { isMobile: boolean }) {
  const subjects = [
    { name: "Mathematics", color: "#3b82f6", emoji: "📐" },
    { name: "Physical Sciences", color: "#10b981", emoji: "⚗️" },
    { name: "Life Sciences", color: "#f59e0b", emoji: "🧬" },
    { name: "History", color: "#8b5cf6", emoji: "📜" },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">NSC Past Papers</span>
          <span className="text-xs text-gray-400">2017 – 2024</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col gap-2 overflow-hidden">
          {subjects.map((s) => (
            <div key={s.name} className="flex items-center gap-3 py-1.5 px-3 rounded-xl border border-gray-100 bg-gray-50">
              <span className="text-base">{s.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 flex-1">{s.name}</span>
              <div className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: s.color }}>
                Practice
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">50+ papers across all major subjects</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupCoach({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#B7182E] flex items-center justify-center text-white text-xs font-bold">R</div>
          <span className="text-sm font-semibold text-gray-800">Maths · Paper 1 · Q3</span>
          <span className="ml-auto text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">Practice</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col gap-2.5 overflow-hidden">
          <p className="text-xs text-gray-600 leading-relaxed">
            Given f(x) = 2x² − 3x + 1, determine f&apos;(x) using first principles.
          </p>
          <div
            className="flex gap-2 items-start p-2.5 rounded-xl border-2 border-[#B7182E] bg-rose-50/40"
            style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.1)" }}
          >
            <div className="w-5 h-5 rounded-full bg-[#B7182E] flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold mt-0.5">R</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Start with the definition: f&apos;(x) = lim(h→0) [f(x+h) − f(x)] / h. Expand f(x+h) first.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Practice or Guide mode — your choice</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupMarks({ isMobile }: { isMobile: boolean }) {
  const questions = [
    { q: "Q1", label: "Algebra", marks: "5/5", done: true },
    { q: "Q2", label: "Calculus", marks: "3/5", partial: true },
    { q: "Q3", label: "Geometry", marks: "—", done: false },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Marks Tracker</span>
          <span className="text-xs font-semibold text-[#B7182E]">8 / 15 so far</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col gap-2.5 justify-center">
          {questions.map((item) => (
            <div key={item.q} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                item.done ? "bg-green-100 text-green-700" : item.partial ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"
              }`}>
                {item.done ? "✓" : item.partial ? "~" : "?"}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-700">{item.q} · {item.label}</span>
              </div>
              <span className={`text-xs font-bold ${item.done ? "text-green-600" : item.partial ? "text-amber-600" : "text-gray-400"}`}>
                {item.marks}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Know where to focus your revision</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Real NSC papers. Real Understanding.",
    description: "Practice over 50 exam papers across all major subjects.",
    Mockup: MockupPapers,
  },
  {
    subtitle: "Work through it. Ruby coaches you.",
    description: "Submit your answer for any question and get personalised feedback in Practice or Guide mode — just like having a tutor in the room.",
    Mockup: MockupCoach,
  },
  {
    subtitle: "Track your marks as you go",
    description: "See your score per question and your total as you work through the paper. Know where to focus.",
    Mockup: MockupMarks,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </div>
);

export default function MatricTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Matric Prep"
      featureIcon={ICON}
      finalBtnLabel="Open Papers"
    />
  );
}
