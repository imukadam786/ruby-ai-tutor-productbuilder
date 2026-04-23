"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

function MockupStats({ isMobile }: { isMobile: boolean }) {
  const cards = [
    { label: "Skills Mastered", value: "12", color: "#22c55e", bg: "#f0fdf4" },
    { label: "In Progress", value: "4", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Sessions Done", value: "24", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Accuracy", value: "78%", color: "#8b5cf6", bg: "#f5f3ff" },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">My Progress</span>
          <span className="ml-auto text-xs text-gray-400">Updated live</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-2">
            {cards.map((c) => (
              <div key={c.label} className="rounded-xl p-3 flex flex-col gap-0.5" style={{ backgroundColor: c.bg }}>
                <span className="text-lg font-bold" style={{ color: c.color }}>{c.value}</span>
                <span className="text-[10px] text-gray-500 font-medium">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Tracked automatically as you learn</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupStreak({ isMobile }: { isMobile: boolean }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const active = [true, true, true, true, true, false, false];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Study Streak</span>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-2xl font-bold text-[#1a2744]">5 days</p>
              <p className="text-xs text-gray-400">Best streak: 14 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full justify-center">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  active[i] ? "bg-[#B7182E] text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {active[i] ? "✓" : d}
                </div>
                <span className="text-[9px] text-gray-400">{d}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Consistency beats cramming every time</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Everything in one place",
    description: "Your skills mastered, sessions done, and accuracy — all tracked automatically as you learn.",
    Mockup: MockupStats,
  },
  {
    subtitle: "Keep your streak alive",
    description: "Every day you study adds to your streak. Consistency beats cramming every time.",
    Mockup: MockupStreak,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </div>
);

export default function ProgressTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Progress"
      featureIcon={ICON}
      finalBtnLabel="See My Progress"
    />
  );
}
