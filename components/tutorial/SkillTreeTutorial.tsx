"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

// Reflects actual SkillTreeView: level rows with L-badge + title + progress bar + skill pills
function MockupMap({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-800">Skill Tree</p>
        </div>
        <div className="flex-1 px-4 py-3 space-y-3 overflow-hidden">
          {/* L1 — mastered */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">L1</span>
                <span className="text-xs font-semibold text-gray-900">Number Sense</span>
              </div>
              <span className="text-xs font-bold text-green-600">100%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full w-full" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["✅ Integers", "✅ Fractions", "✅ Ratios"].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg border text-[10px] font-medium bg-green-50 text-green-700 border-green-200">{s}</span>
              ))}
            </div>
          </div>
          {/* L2 — in progress, current */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">L2</span>
                <span className="text-xs font-semibold text-gray-900">Algebra Basics</span>
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Current</span>
              </div>
              <span className="text-xs font-bold text-gray-600">33%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "33%" }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg border text-[10px] font-medium bg-green-50 text-green-700 border-green-200">✅ Expressions</span>
              <span className="px-2.5 py-1 rounded-lg border text-[10px] font-medium bg-orange-50 text-orange-700 border-orange-200 ring-2 ring-blue-500 ring-offset-1">⚡ Linear Eq.</span>
              <span className="px-2.5 py-1 rounded-lg border text-[10px] font-medium bg-gray-100 text-gray-400 border-gray-200">🔒 Quadratic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects how locked L3 looks when L2 is still in progress
function MockupUnlock({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-800">Skills unlock in order</p>
        </div>
        <div className="flex-1 px-4 py-3 space-y-2 overflow-hidden">
          {/* L2 in progress */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">L2</span>
              <span className="text-xs font-semibold text-gray-800">Algebra Basics</span>
              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium ml-auto">Current</span>
            </div>
            <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "33%" }} />
            </div>
          </div>
          {/* Arrow */}
          <div className="flex justify-center">
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* L3 locked */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 space-y-1.5 opacity-60">
            <div className="flex items-center gap-2">
              <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">L3</span>
              <span className="text-xs font-semibold text-gray-500">Functions</span>
              <span className="text-[9px] text-gray-400 ml-auto">Locked</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["🔒 Linear Func.", "🔒 Parabola", "🔒 Hyperbola"].map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-lg border text-[10px] font-medium bg-gray-100 text-gray-400 border-gray-200">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Master L2 to unlock L3 automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Your personal learning map",
    description: "Every circle is a skill. Green means mastered, yellow means in progress, grey means locked — for now.",
    Mockup: MockupMap,
  },
  {
    subtitle: "Skills unlock in order",
    description: "Ruby builds on what you know. Master one skill and the next one opens up automatically.",
    Mockup: MockupUnlock,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

export default function SkillTreeTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Skill Tree"
      featureIcon={ICON}
      finalBtnLabel="View My Skills"
    />
  );
}
